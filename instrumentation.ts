import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// captureRequestError itself is a no-op when Sentry.init() was never called
// (see sentry.server.config.ts) - safe to reference unconditionally.
export const onRequestError = Sentry.captureRequestError;
