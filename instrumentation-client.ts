import * as Sentry from "@sentry/nextjs";

// Client-side errors - see sentry.server.config.ts for the
// no-op-until-configured rationale. Uses NEXT_PUBLIC_ prefix since this
// code ships to the browser.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

// Required export for Sentry to instrument client-side route transitions;
// a no-op like everything else here when Sentry was never initialized.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
