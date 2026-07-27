"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

// Floating help entry point, per the approved prototype - a persistent
// bottom-right button rather than a full dedicated page, offering a hard
// split between general navigation support (chat) and case-specific
// questions (Ida), matching the escalation boundary in CLAUDE.md.
export default function HelpWidget() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div style={{ position: "fixed", bottom: 28, right: 32, zIndex: 50 }}>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 0,
            width: 280,
            background: "#fff",
            border: "1px solid rgba(34,48,60,.1)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 16px 40px -12px rgba(34,48,60,.35)",
            padding: 10,
          }}
        >
          <button
            onClick={() => {
              setOpen(false);
              router.push("/live-support");
            }}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderRadius: "var(--radius-sm)", padding: "12px 14px", cursor: "pointer" }}
          >
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--rb-text)" }}>
              Chat with support
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 12, color: "var(--rb-text-muted)", marginTop: 2 }}>
              Navigation, document questions, how-to&apos;s
            </div>
          </button>
          <button
            onClick={() => {
              setOpen(false);
              router.push("/lawyer");
            }}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderRadius: "var(--radius-sm)", padding: "12px 14px", cursor: "pointer" }}
          >
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--rb-text)" }}>
              Talk to Ida
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 12, color: "var(--rb-text-muted)", marginTop: 2 }}>
              For anything needing real legal judgment
            </div>
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Help"
        style={{
          width: 52,
          height: 52,
          borderRadius: "var(--radius-full)",
          background: "var(--rb-teal)",
          color: "var(--rb-on-teal)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 24px -8px rgba(34,48,60,.45)",
        }}
      >
        <MessageCircle size={22} strokeWidth={1.75} />
      </button>
    </div>
  );
}
