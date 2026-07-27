import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "md" | "lg";

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  // Conversion actions - pay, unlock, submit. Prototype uses a flat fill
  // with no shadow by default - the hero CTA is the one exception and
  // opts into a shadow via the style prop.
  primary: {
    background: "var(--rb-gradient-orange)",
    color: "#fff",
    border: "none",
  },
  // Navigation / neutral actions - next, continue, sign in. Greyed out
  // with just a border, not a filled surface - the primary orange fill
  // is reserved for the one true conversion action per screen.
  secondary: {
    background: "#fff",
    color: "var(--rb-text-secondary)",
    border: "1.5px solid var(--rb-border)",
  },
  outline: {
    background: "#fff",
    color: "var(--rb-teal)",
    border: "1.5px solid var(--rb-teal)",
  },
  ghost: {
    background: "transparent",
    color: "var(--rb-teal)",
    border: "1.5px solid var(--rb-border)",
  },
};

const SIZE_STYLES: Record<ButtonSize, CSSProperties> = {
  md: { padding: "13px 20px", fontSize: 14.5, borderRadius: "var(--radius-md)" },
  lg: { padding: "16px 26px", fontSize: 16, borderRadius: "var(--radius-lg)" },
};

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit";
  style?: CSSProperties;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled = false,
  fullWidth = false,
  type = "button",
  style,
}: ButtonProps) {
  const disabledStyle: CSSProperties = disabled
    ? { background: "var(--rb-disabled-bg)", boxShadow: "none", cursor: "default", color: "#fff", border: "none" }
    : {};

  const combined: CSSProperties = {
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    cursor: disabled ? "default" : "pointer",
    textAlign: "center",
    display: "inline-block",
    width: fullWidth ? "100%" : undefined,
    ...VARIANT_STYLES[variant],
    ...SIZE_STYLES[size],
    ...disabledStyle,
    ...style,
  };

  if (href && !disabled) {
    return (
      <Link href={href} style={combined}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={combined}>
      {children}
    </button>
  );
}
