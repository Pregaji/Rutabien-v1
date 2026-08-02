"use client";

import { useEffect } from "react";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

// Fires once, client-side only - keeps app/checkout/success/page.tsx a
// plain server component otherwise.
export function PaymentCompletedTracker() {
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.paymentCompleted);
  }, []);

  return null;
}
