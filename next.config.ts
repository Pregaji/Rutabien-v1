import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// CSP is 'unsafe-inline' for script/style rather than nonce-based - Next's
// hydration payload and this app's widespread use of React inline styles
// both need it, and wiring a nonce through proxy.ts is a separate piece of
// work. This still blocks the more common attack shape (loading a script or
// iframe from an attacker-controlled domain) even without nonces.
//
// 'unsafe-eval' is dev-only: Next's dev-mode HMR and React's dev-mode
// debugging both use eval(), which a strict CSP blocks outright (confirmed
// locally - the page didn't just warn, React's error overlay broke). The
// production build never calls eval(), so this is real dev/prod parity, not
// a hole left open (see MVP_Draft.md - production must stay minimal).
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // R2 presigned uploads go browser -> bucket directly (see lib/storage.ts);
  // Stripe/PayPal checkout are full-page redirects, not XHR, so they don't
  // need to be listed here. Sentry's and PostHog's domains are added only
  // when their respective keys are actually configured, so the default
  // policy stays as strict as possible until each is turned on.
  [
    "connect-src 'self' https://*.r2.cloudflarestorage.com",
    process.env.NEXT_PUBLIC_SENTRY_DSN ? "https://*.sentry.io https://*.ingest.sentry.io" : "",
    process.env.NEXT_PUBLIC_POSTHOG_KEY ? "https://*.posthog.com https://*.i.posthog.com" : "",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

// withSentryConfig itself is safe to apply unconditionally (it only
// uploads source maps/sets up tunneling when SENTRY_AUTH_TOKEN is present
// at build time) - source maps stay hidden either way, so stack traces
// never leak to end users regardless of whether Sentry is configured.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  disableLogger: true,
});
