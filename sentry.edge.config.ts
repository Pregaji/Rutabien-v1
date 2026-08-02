import * as Sentry from "@sentry/nextjs";

// Covers proxy.ts (Edge runtime) - see sentry.server.config.ts for the
// no-op-until-configured rationale.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}
