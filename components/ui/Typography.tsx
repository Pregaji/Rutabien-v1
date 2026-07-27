import type { CSSProperties, ElementType, ReactNode } from "react";

export type HeadingSize = "xl" | "lg" | "md" | "sm";

const HEADING_SIZE: Record<HeadingSize, CSSProperties> = {
  xl: { fontSize: 34, letterSpacing: "-.3px" },
  lg: { fontSize: 28, letterSpacing: "-.3px" },
  md: { fontSize: 22 },
  sm: { fontSize: 17 },
};

export function Heading({
  children,
  size = "xl",
  as: Tag = "h1",
  color = "var(--rb-text)",
  style,
  className,
}: {
  children: ReactNode;
  size?: HeadingSize;
  as?: ElementType;
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <Tag
      className={className}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        lineHeight: 1.2,
        margin: 0,
        color,
        ...HEADING_SIZE[size],
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export function Text({
  children,
  muted = false,
  size = 14.5,
  weight = 400,
  color,
  style,
}: {
  children: ReactNode;
  muted?: boolean;
  size?: number;
  weight?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <p
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.6,
        margin: 0,
        color: color ?? (muted ? "var(--rb-text-muted)" : "var(--rb-text-secondary)"),
        ...style,
      }}
    >
      {children}
    </p>
  );
}
