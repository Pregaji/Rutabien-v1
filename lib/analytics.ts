import posthog from "posthog-js";

// No-op until NEXT_PUBLIC_POSTHOG_KEY is set (see components/Analytics.tsx
// for the init call) - trackEvent is safe to call from anywhere regardless
// of whether analytics is actually configured.
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(name, properties);
}

// The specific "quantitative success metrics" named in MVP_Draft.md -
// conversion rate and roadmap completion rate both need these two events
// to exist at all before they can be measured.
export const ANALYTICS_EVENTS = {
  intakeStarted: "intake_started",
  intakeCompleted: "intake_completed",
  roadmapStepCompleted: "roadmap_step_completed",
  roadmapAllStepsCompleted: "roadmap_all_steps_completed",
  checkoutStarted: "checkout_started",
  paymentCompleted: "payment_completed",
} as const;
