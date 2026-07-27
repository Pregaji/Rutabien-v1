import type { CSSProperties } from "react";

interface TextInputProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
  autoFocus?: boolean;
}

export default function TextInput({ type = "text", value, onChange, placeholder, onKeyDown, style, autoFocus }: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      style={{
        width: "100%",
        padding: "15px 17px",
        borderRadius: "var(--radius-lg)",
        border: "1.5px solid var(--rb-border)",
        background: "#fff",
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        fontSize: 15,
        color: "var(--rb-text)",
        ...style,
      }}
    />
  );
}
