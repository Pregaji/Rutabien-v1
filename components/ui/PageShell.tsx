import type { CSSProperties, ReactNode } from "react";

// The centered full-height wrapper used by every standalone screen (access,
// paywall, translation, checkout results, etc.) - was previously a locally
// duplicated `Centered` helper in ~8 different files.
export default function PageShell({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-9)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
