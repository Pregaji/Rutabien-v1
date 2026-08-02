import * as Sentry from "@sentry/nextjs";

// No-op until SENTRY_DSN is set - safe to ship as-is, becomes live the
// moment the env var is added (no code change needed).
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}
