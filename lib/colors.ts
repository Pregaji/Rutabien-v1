// Single source of truth for the Rutabien palette in contexts that cannot
// use CSS custom properties - transactional email HTML (lib/email.ts) and
// the next/og social-preview image (app/opengraph-image.tsx). Everywhere
// else in the app, use the CSS variables in app/globals.css (var(--rb-teal)
// etc.) directly - don't hardcode hex values there.
//
// These values must match app/globals.css's :root block exactly.
// test/colors.test.ts asserts that automatically - it previously drifted
// silently (app/opengraph-image.tsx shipped the old #1B3A3E for a while
// after the app-wide color was corrected to #14181A) with nothing catching
// it, which is exactly what this guards against now.
export const RUTABIEN_COLORS = {
  primary: "#14181A", // --rb-teal
  accent: "#D4562E", // --rb-orange
  bg: "#F5F2EC", // --rb-bg
  text: "#1A1F24", // --rb-text
  // Text/fill tints for use on top of `primary` - mirrors the
  // --rb-on-teal-* scale in globals.css exactly (already re-verified for
  // AA contrast against #14181A when that color was corrected).
  onDark: {
    body: "#DCE7E5", // --rb-on-teal-body
    accent: "#F0A98C", // --rb-on-teal-accent
  },
} as const;
