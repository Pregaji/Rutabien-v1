import type { CSSProperties, ReactNode } from "react";

export type CardVariant = "default" | "teal" | "bordered";

const VARIANT_STYLES: Record<CardVariant, CSSProperties> = {
  default: {
    background: "#fff",
    border: "1px solid rgba(34,48,60,.08)",
    boxShadow: "var(--shadow-sm)",
  },
  teal: {
    background: "var(--rb-gradient-teal)",
    color: "#fff",
    boxShadow: "var(--shadow-lg)",
  },
  bordered: {
    background: "#fff",
    border: "1.5px solid var(--rb-border)",
  },
};

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: string;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, variant = "default", padding = "22px", style, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        borderRadius: "var(--radius-lg)",
        padding,
        cursor: onClick ? "pointer" : undefined,
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
