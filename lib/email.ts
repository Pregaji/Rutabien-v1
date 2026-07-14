import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is missing");
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_NOREPLY =
  process.env.RESEND_FROM_NOREPLY || "Rutabien <no-reply@rutabien.com>";

// Rutabien palette (see CLAUDE.md "Design system")
const COLOR_PRIMARY = "#1B3A3E";
const COLOR_ACCENT = "#D4562E";
const COLOR_BG = "#F5F2EC";
const COLOR_TEXT = "#1A1F24";

function emailWrapper(content: string, footerText: string) {
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
  .header{background:${COLOR_PRIMARY};padding:28px 36px}
  .logo{font-size:20px;font-weight:700;letter-spacing:1px;color:#ffffff;font-family:Georgia,serif}
  .body{padding:32px 36px;font-family:Helvetica,Arial,sans-serif}
  h1{font-size:21px;font-weight:700;color:${COLOR_TEXT};margin-bottom:12px;line-height:1.3;font-family:Georgia,serif}
  p{font-size:14px;line-height:1.65;color:#3f474a;margin-bottom:14px}
  .btn{display:inline-block;background:${COLOR_ACCENT};color:#ffffff!important;font-size:14px;font-weight:700;padding:13px 26px;border-radius:8px;text-decoration:none;margin:6px 0 20px}
  .code{font-family:monospace;font-size:28px;font-weight:700;letter-spacing:6px;color:${COLOR_PRIMARY};background:${COLOR_BG};border-radius:8px;padding:16px 20px;text-align:center;margin:16px 0}
  .footer{padding:20px 36px;background:${COLOR_BG};border-top:1px solid #e8e3d8}
  .footer p{font-size:12px;color:#6b7280;line-height:1.6;margin:0;font-family:Helvetica,Arial,sans-serif}
</style>
</head>
<body>
  <div class="page"><div class="wrap"><div class="card">
    <div class="header"><div class="logo">Rutabien</div></div>
    <div class="body">${content}</div>
    <div class="footer"><p>${footerText}</p></div>
  </div></div></div>
</body>
</html>`;
}

/* Magic link — "Access your roadmap" request. Single-use, short expiry. */
export async function sendAccessLinkEmail({
  to,
  accessUrl,
  expiresInMinutes,
}: {
  to: string;
  accessUrl: string;
  expiresInMinutes: number;
}) {
  const html = emailWrapper(
    `
    <h1>Access your roadmap</h1>
    <p>Click below to securely sign in to Rutabien. This link works once and expires in ${expiresInMinutes} minutes.</p>
    <a href="${accessUrl}" class="btn">Access my roadmap →</a>
    <p style="font-size:13px;color:#8a8f92">If you didn't request this, you can safely ignore this email — no one can access your account without it.</p>
  `,
    "You received this because you (or someone with this email) requested access to a Rutabien roadmap."
  );

  await getResend().emails.send({
    from: FROM_NOREPLY,
    to,
    subject: "Your Rutabien access link",
    html,
  });
}

/* Step-up verification — required before viewing/downloading a document,
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
  const html = emailWrapper(
    `
    <h1>Verify it's you</h1>
    <p>Enter this code to view or download your document. It expires in ${expiresInMinutes} minutes.</p>
    <div class="code">${code}</div>
    <p style="font-size:13px;color:#8a8f92">If you didn't request this, someone may have your Rutabien access link — consider requesting a new one.</p>
  `,
    "You received this because a document access request was made on your Rutabien account."
  );

  await getResend().emails.send({
    from: FROM_NOREPLY,
    to,
    subject: `${code} is your Rutabien verification code`,
    html,
  });
}

/* Sent immediately after payment, per MVP_Draft.md section 7 point 5 —
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
  const html = emailWrapper(
    `
    <h1>Payment confirmed — here's your roadmap</h1>
    <p>Your ${planName} plan is active. Click below to access your personalized roadmap now.</p>
    <a href="${accessUrl}" class="btn">Access my roadmap →</a>
    <p style="font-size:13px;color:#8a8f92">This link works once and expires in ${expiresInMinutes} minutes, same as any other Rutabien access link. Request a new one any time from the "Access your roadmap" page.</p>
  `,
    "This is your payment receipt and access link for Rutabien."
  );

  await getResend().emails.send({
    from: FROM_NOREPLY,
    to,
    subject: "Payment confirmed — access your Rutabien roadmap",
    html,
  });
}
