import type { BienvenidoIcon } from "@/lib/bienvenidoContent";

// Minimal single-stroke line-art icons for the Bienvenido guide -
// intentionally plain/geometric rather than filled or photographic, to
// match the flat, editorial visual language used elsewhere in the app.
const SHARED = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function SimGlyph() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path {...SHARED} d="M20 10h16l8 8v36a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z" />
      <path {...SHARED} d="M36 10v8h8" />
      <rect {...SHARED} x="24" y="30" width="16" height="12" rx="2" />
      <path {...SHARED} d="M28 30v-4a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function TransportGlyph() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path {...SHARED} d="M12 40 24 14h16l12 26" />
      <rect {...SHARED} x="10" y="40" width="44" height="10" rx="3" />
      <circle {...SHARED} cx="20" cy="52" r="3" />
      <circle {...SHARED} cx="44" cy="52" r="3" />
      <path {...SHARED} d="M20 26h24" />
    </svg>
  );
}

function CurrencyGlyph() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <circle {...SHARED} cx="32" cy="32" r="20" />
      <path {...SHARED} d="M26 24a8 8 0 0 0 0 16m0-8h10m-10-4h12" />
    </svg>
  );
}

function CheckinGlyph() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path {...SHARED} d="M32 10c9 8 14 16 14 24a14 14 0 0 1-28 0c0-8 5-16 14-24Z" />
      <circle {...SHARED} cx="32" cy="34" r="5" />
    </svg>
  );
}

function SafetyGlyph() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path {...SHARED} d="M32 8 14 15v14c0 13 8 22 18 27 10-5 18-14 18-27V15Z" />
      <path {...SHARED} d="M24 32l6 6 10-12" />
    </svg>
  );
}

function LanguageGlyph() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <circle {...SHARED} cx="32" cy="32" r="20" />
      <path {...SHARED} d="M12 32h40M32 12c5 5.5 8 12.5 8 20s-3 14.5-8 20c-5-5.5-8-12.5-8-20s3-14.5 8-20Z" />
    </svg>
  );
}

function HousingGlyph() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <path {...SHARED} d="M12 30 32 12l20 18" />
      <path {...SHARED} d="M18 26v24a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V26" />
      <rect {...SHARED} x="28" y="36" width="8" height="16" />
    </svg>
  );
}

const ICONS: Record<BienvenidoIcon, () => React.ReactElement> = {
  sim: SimGlyph,
  transport: TransportGlyph,
  currency: CurrencyGlyph,
  checkin: CheckinGlyph,
  safety: SafetyGlyph,
  language: LanguageGlyph,
  housing: HousingGlyph,
};

export function BienvenidoIllustration({ icon, color = "var(--rb-teal)" }: { icon: BienvenidoIcon; color?: string }) {
  const Glyph = ICONS[icon];
  return (
    <div style={{ width: "100%", height: "100%", color }}>
      <Glyph />
    </div>
  );
}
