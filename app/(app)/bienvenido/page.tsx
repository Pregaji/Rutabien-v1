"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BIENVENIDO_CONTENT, type Lang } from "@/lib/bienvenidoContent";

export default function BienvenidoPage() {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    fetch("/api/roadmap")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setPaymentStatus(data.paymentStatus))
      .catch(() => setPaymentStatus(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Centered>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 15, color: "var(--rb-text-muted)" }}>Loading…</p>
      </Centered>
    );
  }

  if (paymentStatus !== "complete") {
    return (
      <Centered>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 26, color: "var(--rb-text)", margin: 0 }}>
            Bienvenido is a Complete plan feature
          </h2>
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 14.5, lineHeight: 1.6, color: "var(--rb-text-secondary)", margin: "12px 0 22px" }}>
            Your arrival guide — SIM cards, getting into the city, safety notes, and settling in — available in English and Spanish.
          </p>
          <Link
            href="/paywall"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
              color: "#fff",
              borderRadius: 12,
              padding: "13px 22px",
              fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 14.5,
            }}
          >
            See plans — from €39
          </Link>
        </div>
      </Centered>
    );
  }

  const content = BIENVENIDO_CONTENT[lang];

  return (
    <div className="rb-roadmap-wrap" style={{ maxWidth: 720, margin: "0 auto", padding: "44px 48px 96px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 34, color: "var(--rb-text)", margin: 0, letterSpacing: "-.3px" }}>
          Bienvenido
        </h1>
        <div style={{ display: "flex", gap: 6 }}>
          {(["en", "es"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: lang === l ? "1.5px solid var(--rb-teal)" : "1.5px solid var(--rb-border)",
                background: lang === l ? "rgba(27,58,62,.08)" : "#fff",
                fontFamily: "var(--font-figtree)",
                fontWeight: 600,
                fontSize: 12.5,
                color: "var(--rb-teal)",
                cursor: "pointer",
              }}
            >
              {l === "en" ? "English" : "Español"}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 15, color: "var(--rb-text-secondary)", margin: "14px 0 0" }}>
        {content.intro}
      </p>

      <div
        style={{
          marginTop: 20,
          background: "linear-gradient(135deg, var(--rb-teal) 0%, #234b50 100%)",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: "#DCE7E5", margin: 0, fontStyle: "italic" }}>
          {content.empathyLine}
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        {content.sections.map((s) => (
          <div key={s.title} style={{ background: "#fff", border: "1px solid rgba(34,48,60,.08)", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
            <h3 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: 17, color: "var(--rb-text)", margin: 0 }}>
              {s.title}
            </h3>
            <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 14, lineHeight: 1.6, color: "var(--rb-text-secondary)", margin: "8px 0 0" }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>{children}</div>;
}
