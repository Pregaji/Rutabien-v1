"use client";

import Link from "next/link";

// A way out of standalone funnel screens (intake, paywall, translation,
// access, etc.) that don't have the full app-shell nav — these are
// deliberately minimal single-purpose screens, but every screen still
// needs an exit.
export default function HomeLink() {
  return (
    <Link
      href="/"
      style={{
        position: "fixed",
        top: 20,
        left: 24,
        zIndex: 10,
        fontFamily: "var(--font-spectral)",
        fontWeight: 600,
        fontSize: 15,
        color: "var(--rb-teal)",
      }}
    >
      Rutabien
    </Link>
  );
}
