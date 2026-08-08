import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import sharp from "sharp";
import { RUTABIEN_COLORS } from "@/lib/colors";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is missing");
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_NOREPLY =
  process.env.RESEND_FROM_NOREPLY || "Rutabien <no-reply@rutabien.com>";

// Resend's SDK returns { data, error } on failure rather than throwing, so a
// bad API key, an unverified sending domain, or a rejected recipient used to
// fail completely silently with the caller reporting success anyway.
//
// This deliberately does NOT rethrow: an email is a side effect, not the
// point of intake submit / checkout / step-up request / etc - a user whose
// roadmap was generated or whose payment succeeded must not see "something
// went wrong" just because the follow-up email failed to send (this broke
// the entire intake flow in production once send() was made to throw - see
// git history). Failures are reported to Sentry (no-op if SENTRY_DSN isn't
// set) so they're visible without blocking the request that triggered them.
async function send(params: Parameters<Resend["emails"]["send"]>[0]) {
  const { error } = await getResend().emails.send(params);
  if (error) {
    Sentry.captureException(new Error(`Resend send failed (${error.name}): ${error.message}`), {
      extra: { to: params.to, subject: params.subject },
    });
  }
}

// Rutabien palette - see lib/colors.ts for why this can't be var(--rb-teal)
// etc. here (email HTML has no access to the app's stylesheet).
const COLOR_PRIMARY = RUTABIEN_COLORS.primary;
const COLOR_ACCENT = RUTABIEN_COLORS.accent;
const COLOR_BG = RUTABIEN_COLORS.bg;
const COLOR_TEXT = RUTABIEN_COLORS.text;

// Just the icon/glow portion of illustrations/18-email-header.svg -
// rasterized to a small PNG and inlined as a data URI (email clients
// render inline <svg> unreliably, especially Outlook desktop). Deliberately
// excludes the "Rutabien" wordmark from the raster: baked-in text depends
// on fonts being installed on whatever server does the rendering, which
// isn't guaranteed - real HTML text next to the icon is crisper and more
// portable. Memoized since it never changes between sends.
const EMAIL_HEADER_ICON_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <radialGradient id="glowE" cx="60%" cy="50%" r="70%">
    <stop offset="0%" stop-color="${RUTABIEN_COLORS.accent}" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="${RUTABIEN_COLORS.accent}" stop-opacity="0"/>
  </radialGradient>
  <rect width="120" height="120" fill="url(#glowE)"/>
  <g transform="translate(48,60)">
    <path d="M0 -34 a20 20 0 0 1 20 20 c0 14 -20 34 -20 34 s-20 -20 -20 -34 a20 20 0 0 1 20 -20z" fill="${RUTABIEN_COLORS.accent}"/>
    <circle cy="-14" r="8" fill="${RUTABIEN_COLORS.bg}"/>
  </g>
  <g fill="${RUTABIEN_COLORS.accent}">
    <circle cx="90" cy="80" r="4" opacity="0.8"/>
    <circle cx="100" cy="72" r="4" opacity="0.55"/>
  </g>
</svg>`;

// Same icon/glow-only, font-free rasterization approach used for the
// header (see comment above EMAIL_HEADER_ICON_SVG) - one memoized rasterize
// helper shared by both, since neither depends on request-time data.
const rasterizedIconCache = new Map<string, Promise<string>>();

function rasterizeIcon(svg: string, size: number): Promise<string> {
  const cacheKey = `${size}:${svg}`;
  const cached = rasterizedIconCache.get(cacheKey);
  if (cached) return cached;

  const promise = sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer()
    .then((buf) => `data:image/png;base64,${buf.toString("base64")}`)
    .catch((err) => {
      Sentry.captureException(err);
      rasterizedIconCache.delete(cacheKey);
      return "";
    });
  rasterizedIconCache.set(cacheKey, promise);
  return promise;
}

// A document with an hourglass and a warning badge - illustrations/17-
// document-expiring.svg, cropped to its icon cluster (excludes the ambient
// background ellipses, which would look like stray gray blobs at icon
// size). Used only by sendDocumentExpiringEmail, the one email where a
// document's validity window is the actual subject.
const DOCUMENT_EXPIRING_ICON_SVG = `<svg viewBox="230 160 220 190" xmlns="http://www.w3.org/2000/svg">
  <rect x="230" y="160" width="220" height="190" fill="none"/>
  <g>
    <rect x="290" y="220" width="120" height="150" rx="8" fill="${RUTABIEN_COLORS.bg}" stroke="${RUTABIEN_COLORS.text}" stroke-width="3"/>
    <line x1="306" y1="244" x2="365" y2="244" stroke="${RUTABIEN_COLORS.text}" stroke-width="4"/>
    <line x1="306" y1="260" x2="350" y2="260" stroke="${RUTABIEN_COLORS.text}" stroke-width="4"/>
    <line x1="306" y1="276" x2="360" y2="276" stroke="${RUTABIEN_COLORS.text}" stroke-width="4"/>
  </g>
  <g transform="translate(420,300)">
    <path d="M-16 -22 h32 v6 l-14 16 14 16 v6 h-32 v-6 l14 -16 -14 -16z" fill="none" stroke="${RUTABIEN_COLORS.text}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M-11 -16 h22 l-11 13z" fill="${RUTABIEN_COLORS.accent}"/>
    <path d="M-6 18 h12 v-6 l-6 -6 -6 6z" fill="${RUTABIEN_COLORS.accent}"/>
  </g>
  <g transform="translate(300,220)">
    <circle r="20" fill="${RUTABIEN_COLORS.accent}"/>
    <line x1="0" y1="-8" x2="0" y2="2" stroke="${RUTABIEN_COLORS.bg}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="0" cy="9" r="2.4" fill="${RUTABIEN_COLORS.bg}"/>
  </g>
</svg>`;

async function emailWrapper(content: string, footerText: string, heroImageDataUri?: string) {
  const iconDataUri = await rasterizeIcon(EMAIL_HEADER_ICON_SVG, 96);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rutabien</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{margin:0;padding:0;width:100% !important;background:${COLOR_BG};font-family:Georgia,'Times New Roman',serif;color:${COLOR_TEXT};-webkit-font-smoothing:antialiased}
  .page{width:100%;background:${COLOR_BG};padding:40px 16px}
  .wrap{width:100%;max-width:520px;margin:0 auto}
  .card{width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(27,58,62,0.08)}
  .header{background:${COLOR_PRIMARY};padding:24px 36px}
  .header-icon{width:40px;height:40px;vertical-align:middle}
  .logo{font-size:20px;font-weight:700;letter-spacing:1px;color:#ffffff;font-family:Georgia,serif}
  .tagline{font-size:12px;color:#9fc0bc;font-family:Helvetica,Arial,sans-serif;margin-top:2px}
  .body{padding:32px 36px;font-family:Helvetica,Arial,sans-serif}
  h1{font-size:21px;font-weight:700;color:${COLOR_TEXT};margin-bottom:12px;line-height:1.3;font-family:Georgia,serif}
  p{font-size:14px;line-height:1.65;color:#3f474a;margin-bottom:14px}
  .btn-row{text-align:center;margin:6px 0 20px}
  .btn{display:inline-block;background:${COLOR_ACCENT};color:#ffffff!important;font-size:14px;font-weight:700;padding:13px 26px;border-radius:8px;text-decoration:none}
  .code{font-family:monospace;font-size:28px;font-weight:700;letter-spacing:6px;color:${COLOR_PRIMARY};background:${COLOR_BG};border-radius:8px;padding:16px 20px;text-align:center;margin:16px 0}
  .footer{padding:20px 36px;background:${COLOR_BG};border-top:1px solid #e8e3d8}
  .footer p{font-size:12px;color:#6b7280;line-height:1.6;margin:0;font-family:Helvetica,Arial,sans-serif}
</style>
</head>
<body>
  <div class="page"><div class="wrap"><div class="card">
    <div class="header">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        ${iconDataUri ? `<td style="padding-right:12px"><img src="${iconDataUri}" width="40" height="40" alt="" class="header-icon"></td>` : ""}
        <td>
          <div class="logo">Rutabien</div>
          <div class="tagline">Every step, mapped.</div>
        </td>
      </tr></table>
    </div>
    <div class="body">${heroImageDataUri ? `<img src="${heroImageDataUri}" width="120" height="103" alt="" style="display:block;margin:0 auto 18px">` : ""}${content}</div>
    <div class="footer"><p>${footerText}</p></div>
  </div></div></div>
</body>
</html>`;
}

/* Magic link - "Access your roadmap" request. Single-use, short expiry. */
export async function sendAccessLinkEmail({
  to,
  accessUrl,
  expiresInMinutes,
}: {
  to: string;
  accessUrl: string;
  expiresInMinutes: number;
}) {
  const html = await emailWrapper(
    `
    <h1>Access your roadmap</h1>
    <p>Click below to securely sign in to Rutabien. This link works once and expires in ${expiresInMinutes} minutes.</p>
    <div class="btn-row"><a href="${accessUrl}" class="btn">Access my roadmap →</a></div>
    <p style="font-size:13px;color:#8a8f92">If you didn't request this, you can safely ignore this email - no one can access your account without it.</p>
  `,
    "You received this because you (or someone with this email) requested access to a Rutabien roadmap."
  );

  await send({
    from: FROM_NOREPLY,
    to,
    subject: "Your Rutabien access link",
    html,
  });
}

/* Step-up verification - required before viewing/downloading a document,
   even within an active session. */
export async function sendStepUpCodeEmail({
  to,
  code,
  expiresInMinutes,
}: {
  to: string;
  code: string;
  expiresInMinutes: number;
}) {
  const html = await emailWrapper(
    `
    <h1>Verify it's you</h1>
    <p>Enter this code to view or download your document. It expires in ${expiresInMinutes} minutes.</p>
    <div class="code">${code}</div>
    <p style="font-size:13px;color:#8a8f92">If you didn't request this, someone may have your Rutabien access link - consider requesting a new one.</p>
  `,
    "You received this because a document access request was made on your Rutabien account."
  );

  await send({
    from: FROM_NOREPLY,
    to,
    subject: `${code} is your Rutabien verification code`,
    html,
  });
}

/* Sent immediately after payment, per MVP_Draft.md section 7 point 5 -
   no gap between "I just paid" and "here's how I get back in." */
export async function sendPostPaymentAccessEmail({
  to,
  accessUrl,
  expiresInMinutes,
  planName,
}: {
  to: string;
  accessUrl: string;
  expiresInMinutes: number;
  planName: string;
}) {
  const html = await emailWrapper(
    `
    <h1>Payment confirmed - here's your roadmap</h1>
    <p>Your ${planName} plan is active. Click below to access your personalized roadmap now.</p>
    <div class="btn-row"><a href="${accessUrl}" class="btn">Access my roadmap →</a></div>
    <p style="font-size:13px;color:#8a8f92">This link works once and expires in ${expiresInMinutes} minutes, same as any other Rutabien access link. Request a new one any time from the "Access your roadmap" page.</p>
  `,
    "This is your payment receipt and access link for Rutabien."
  );

  await send({
    from: FROM_NOREPLY,
    to,
    subject: "Payment confirmed - access your Rutabien roadmap",
    html,
  });
}

/* Reminders - MVP_Draft.md section 8. Every reminder includes the direct
   access link, matching the no-password architecture. Sent by lib/reminders.ts,
   never more than the cadence discipline the section calls for. */

export async function sendStalledProgressEmail({
  to,
  accessUrl,
}: {
  to: string;
  accessUrl: string;
}) {
  const html = await emailWrapper(
    `
    <h1>Pick up where you left off</h1>
    <p>You started your Rutabien roadmap a couple of weeks ago - no rush, just a nudge in case it slipped your mind.</p>
    <div class="btn-row"><a href="${accessUrl}" class="btn">Continue my roadmap →</a></div>
  `,
    "You're receiving this because your Rutabien roadmap has been inactive for a while."
  );

  await send({
    from: FROM_NOREPLY,
    to,
    subject: "Pick up where you left off with Rutabien",
    html,
  });
}

export async function sendUnlockReminderEmail({
  to,
  accessUrl,
}: {
  to: string;
  accessUrl: string;
}) {
  const html = await emailWrapper(
    `
    <h1>Your personalized roadmap is ready to unlock</h1>
    <p>Your roadmap has been generated and is waiting for you - full step detail, document tracking, and reminders unlock with a one-time payment.</p>
    <div class="btn-row"><a href="${accessUrl}" class="btn">View my roadmap →</a></div>
  `,
    "One-time reminder about your unlocked Rutabien roadmap."
  );

  await send({
    from: FROM_NOREPLY,
    to,
    subject: "Your Rutabien roadmap is ready to unlock",
    html,
  });
}

export async function sendDocumentExpiringEmail({
  to,
  documentName,
  accessUrl,
}: {
  to: string;
  documentName: string;
  accessUrl: string;
}) {
  const heroImageDataUri = await rasterizeIcon(DOCUMENT_EXPIRING_ICON_SVG, 120);
  const html = await emailWrapper(
    `
    <h1>A document may no longer be valid</h1>
    <p><strong>${documentName}</strong> is approaching or past its validity window for submission. It may need to be re-issued before you use it.</p>
    <div class="btn-row"><a href="${accessUrl}" class="btn">Check my documents →</a></div>
    <p style="font-size:13px;color:#8a8f92">Guidance based on officially published requirements - validity windows can vary by consulate.</p>
  `,
    "You're receiving this because a document in your Rutabien vault has a validity window.",
    heroImageDataUri
  );

  await send({
    from: FROM_NOREPLY,
    to,
    subject: `${documentName} may need to be re-issued`,
    html,
  });
}

export async function sendRetentionWarningEmail({
  to,
  graceDays,
  accessUrl,
}: {
  to: string;
  graceDays: number;
  accessUrl: string;
}) {
  const html = await emailWrapper(
    `
    <h1>Your documents will be removed soon</h1>
    <p>Your Rutabien account has been inactive for a while, and the files in your Document Vault are scheduled for removal in ${graceDays} days.</p>
    <p>Sign back in any time before then and they'll stay exactly where they are.</p>
    <div class="btn-row"><a href="${accessUrl}" class="btn">Access my roadmap →</a></div>
  `,
    "You're receiving this because of Rutabien's document retention policy for inactive accounts."
  );

  await send({
    from: FROM_NOREPLY,
    to,
    subject: "Your Rutabien documents will be removed soon",
    html,
  });
}
