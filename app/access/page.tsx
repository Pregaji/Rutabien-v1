"use client";

import { useState } from "react";

export default function AccessPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    await fetch("/api/auth/request-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48, textAlign: "center" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "30px", lineHeight: "1.2", color: "var(--rb-text)", margin: 0, letterSpacing: "-.3px" }}>
          Access your roadmap
        </h2>
        {sent ? (
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "15px", lineHeight: "1.6", color: "var(--rb-text-secondary)", margin: "14px 0 0" }}>
            We&apos;ve sent a link to {email}. It&apos;ll take you straight to your roadmap — no
            password needed.
          </p>
        ) : (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              style={{
                width: "100%",
                padding: "16px 18px",
                borderRadius: 14,
                border: "1.5px solid var(--rb-border)",
                background: "#fff",
                fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "16px",
                color: "var(--rb-text)",
              }}
            />
            <button
              onClick={submit}
              disabled={!email}
              style={{
                background: "var(--rb-teal)",
                color: "#fff",
                border: "none",
                borderRadius: 15,
                padding: 16,
                fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "15px",
                cursor: email ? "pointer" : "default",
              }}
            >
              Send my access link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
