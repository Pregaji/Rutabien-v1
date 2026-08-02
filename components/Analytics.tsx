"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Privacy-respecting by default: no autocapture of clicks/inputs (this app
// handles passport scans and financial documents - see CLAUDE.md), no
// session recording, IP anonymization on. A no-op entirely until
// NEXT_PUBLIC_POSTHOG_KEY is set.
export function Analytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      autocapture: false,
      capture_pageview: true,
      disable_session_recording: true,
      person_profiles: "identified_only",
    });
  }, []);

  return null;
}
