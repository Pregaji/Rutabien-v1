import type { CSSProperties } from "react";

export type ChipTone = "teal" | "orange" | "neutral" | "tealOnDark";

const TONE_STYLES: Record<ChipTone, CSSProperties> = {
  teal: { background: "rgba(27,58,62,.12)", color: "var(--rb-teal)" },
  orange: { background: "rgba(212,86,46,.12)", color: "var(--rb-orange)" },
  neutral: { background: "rgba(34,48,60,.07)", color: "var(--rb-text-neutral)" },
  tealOnDark: { background: "rgba(245,242,236,.15)", color: "var(--rb-on-teal)" },
};

interface ChipProps {
  children: React.ReactNode;
  tone?: ChipTone;
  style?: CSSProperties;
}

export default function Chip({ children, tone = "neutral", style }: ChipProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 11px",
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: ".3px",
        whiteSpace: "nowrap",
        ...TONE_STYLES[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
