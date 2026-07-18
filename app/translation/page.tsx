"use client";

import { useState } from "react";
import { computeTranslationTotal, POSTAL_DELIVERY_SURCHARGE_EUR, tierPriceFor } from "@/lib/translationPricing";
import HomeLink from "../HomeLink";

// Standalone entry point — "Just need a translation?" — skips the entire
// intake questionnaire. Full total shown before any commitment, updating
// live as document count / postal option change (CLAUDE.md pricing rule).
export default function TranslationPage() {
  const [documentCount, setDocumentCount] = useState(1);
  const [postalDelivery, setPostalDelivery] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = computeTranslationTotal(documentCount, postalDelivery);

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/translation/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, documentCount, postalDelivery }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
    }
  }

  if (sent) {
    return (
      <Centered>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 28, color: "var(--rb-text)", margin: 0 }}>
            Check your inbox
          </h2>
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: "var(--rb-text-secondary)", margin: "14px 0 0" }}>
            We&apos;ve sent a link to {email} — click it to upload your documents and pay.
          </p>
        </div>
      </Centered>
    );
  }

  return (
    <Centered>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 30, lineHeight: 1.2, color: "var(--rb-text)", margin: 0, letterSpacing: "-.3px" }}>
          Just need a translation?
        </h2>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 14.5, color: "var(--rb-text-muted)", margin: "10px 0 0" }}>
          Sworn translation via our accredited translator partner — no visa questionnaire needed.
        </p>

        <div style={{ marginTop: 28 }}>
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, color: "var(--rb-text)", margin: "0 0 10px" }}>
            How many documents?
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setDocumentCount((c) => Math.max(1, c - 1))}
              style={stepperBtn}
            >
              −
            </button>
            <span style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 20, color: "var(--rb-text)", minWidth: 24, textAlign: "center" }}>
              {documentCount}
            </span>
            <button onClick={() => setDocumentCount((c) => Math.min(50, c + 1))} style={stepperBtn}>
              +
            </button>
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13, color: "var(--rb-text-muted)" }}>
              €{tierPriceFor(documentCount)} for {documentCount <= 3 ? "1–3" : documentCount <= 6 ? "4–6" : "7+"} docs
            </span>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, cursor: "pointer" }}>
            <input type="checkbox" checked={postalDelivery} onChange={(e) => setPostalDelivery(e.target.checked)} />
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 14, color: "var(--rb-text)" }}>
              Postal delivery (+€{POSTAL_DELIVERY_SURCHARGE_EUR})
            </span>
          </label>

          <div style={{ marginTop: 22, padding: "16px 20px", background: "var(--rb-bg)", borderRadius: 14, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, color: "var(--rb-text-muted)", textTransform: "uppercase", letterSpacing: ".3px" }}>
              Total
            </span>
            <span style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 28, color: "var(--rb-text)" }}>€{total}</span>
          </div>

          {error && (
            <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 13, color: "var(--rb-orange)", marginTop: 14 }}>{error}</p>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{ width: "100%", marginTop: 18, padding: "15px 17px", borderRadius: 14, border: "1.5px solid var(--rb-border)", fontFamily: "var(--font-figtree)", fontSize: 15 }}
          />
          <button
            onClick={submit}
            disabled={!email || submitting}
            style={{
              width: "100%",
              marginTop: 12,
              padding: 16,
              borderRadius: 15,
              border: "none",
              background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
              color: "#fff",
              fontFamily: "var(--font-figtree)",
              fontWeight: 600,
              fontSize: 15,
              cursor: submitting ? "default" : "pointer",
            }}
          >
            {submitting ? "Starting…" : `Continue — €${total}`}
          </button>
        </div>
      </div>
    </Centered>
  );
}

const stepperBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 999,
  border: "1.5px solid var(--rb-border)",
  background: "#fff",
  fontFamily: "var(--font-figtree)",
  fontWeight: 600,
  fontSize: 18,
  color: "var(--rb-text)",
  cursor: "pointer",
};

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <HomeLink />
      {children}
    </div>
  );
}
