"use client";

import { useState } from "react";
import { PRICING_TIERS, type PlanType } from "@/lib/pricing";
import HomeLink from "../HomeLink";

const cardBase = {
  flex: "1 1 320px",
  background: "#fff",
  borderRadius: 20,
  padding: 28,
} as const;

const checkIcon = (bg: string, color: string) => ({
  width: 18,
  height: 18,
  flex: "none" as const,
  borderRadius: 999,
  background: bg,
  color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  marginTop: 1,
});

export default function PaywallPage() {
  const [selectedTier, setSelectedTier] = useState<PlanType | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedTier) {
    return (
      <div className="rb-paywall-wrap" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
        <HomeLink />
        <div style={{ width: "100%", maxWidth: 820 }}>
          <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "30px", lineHeight: "1.2", color: "var(--rb-text)", margin: 0, letterSpacing: "-.3px" }}>
            Unlock your full roadmap
          </h2>
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "14.5px", color: "var(--rb-text-muted)", margin: "10px 0 0" }}>
            Both plans are a single payment — no auto-renewal, ever.
          </p>

          <div style={{ display: "flex", gap: 20, marginTop: 28, flexWrap: "wrap" }}>
            <div style={{ ...cardBase, border: "1.5px solid var(--rb-border)" }}>
              <h3 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "19px", color: "var(--rb-text)", margin: 0 }}>
                {PRICING_TIERS.essential.name}
              </h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "34px", color: "var(--rb-text)" }}>
                  €{PRICING_TIERS.essential.priceEur}
                </span>
                <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "13px", color: "var(--rb-text-muted)" }}>one-time</span>
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {PRICING_TIERS.essential.includes.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={checkIcon("rgba(27,58,62,.12)", "var(--rb-teal)")}>✓</span>
                    <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "14px", lineHeight: "1.5", color: "#3A4A54" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedTier("essential")}
                style={{
                  width: "100%",
                  marginTop: 24,
                  background: "#fff",
                  border: "1.5px solid var(--rb-teal)",
                  color: "var(--rb-teal)",
                  borderRadius: 12,
                  padding: 13,
                  fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "14.5px",
                  cursor: "pointer",
                  transition: "background .15s ease",
                }}
              >
                Choose {PRICING_TIERS.essential.name}
              </button>
            </div>

            <div
              style={{
                ...cardBase,
                background: "linear-gradient(160deg, var(--rb-teal) 0%, #234b50 100%)",
                border: "none",
                position: "relative",
                boxShadow: "0 30px 60px -30px rgba(27,58,62,.55)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: -13,
                  left: 28,
                  background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
                  color: "#fff",
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "11px",
                  letterSpacing: ".3px",
                }}
              >
                Most popular
              </span>
              <h3 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "19px", color: "#F5F2EC", margin: 0 }}>
                {PRICING_TIERS.complete.name}
              </h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "34px", color: "#F5F2EC" }}>
                  €{PRICING_TIERS.complete.priceEur}
                </span>
                <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "13px", color: "#B8CFCC" }}>
                  single payment, valid 12 months
                </span>
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {PRICING_TIERS.complete.includes.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={checkIcon("rgba(245,242,236,.15)", "#F5F2EC")}>✓</span>
                    <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "14px", lineHeight: "1.5", color: "#DCE7E5" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedTier("complete")}
                style={{
                  width: "100%",
                  marginTop: 24,
                  background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
                  border: "none",
                  color: "#fff",
                  borderRadius: 12,
                  padding: 13,
                  fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "14.5px",
                  cursor: "pointer",
                  boxShadow: "0 14px 28px -14px rgba(212,86,46,.6)",
                }}
              >
                Choose {PRICING_TIERS.complete.name}
              </button>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "12.5px", color: "var(--rb-text-muted)", margin: "18px 0 0" }}>
            &quot;Valid for 12 months&quot; means single access period, not a recurring charge —
            nothing renews automatically.
          </p>
        </div>
      </div>
    );
  }

  const tier = PRICING_TIERS[selectedTier];

  async function payWithStripe() {
    setPaying(true);
    setError(null);
    const res = await fetch("/api/checkout/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedTier }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error ?? "Could not start checkout.");
      setPaying(false);
    }
  }

  async function payWithPaypal() {
    setPaying(true);
    setError(null);
    const res = await fetch("/api/checkout/paypal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedTier }),
    });
    const data = await res.json();
    if (res.ok && data.approveUrl) {
      window.location.href = data.approveUrl;
    } else {
      setError(data.error ?? "Could not start PayPal checkout.");
      setPaying(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 460 }}>
        <button
          onClick={() => setSelectedTier(null)}
          style={{ background: "none", border: "none", padding: "0 0 18px", cursor: "pointer", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "15px", color: "var(--rb-teal)" }}
        >
          ‹ Back
        </button>
        <h2 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "28px", lineHeight: "1.2", color: "var(--rb-text)", margin: 0, letterSpacing: "-.3px" }}>
          {tier.name} plan
        </h2>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 18 }}>
          <span style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "46px", color: "var(--rb-text)" }}>€{tier.priceEur}</span>
          <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "14px", color: "var(--rb-text-muted)" }}>single payment</span>
        </div>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "13.5px", color: "var(--rb-text-muted)", margin: "6px 0 0" }}>
          This is the full price — nothing changes at checkout.
        </p>

        {error && (
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "13px", color: "var(--rb-orange)", marginTop: 16 }}>{error}</p>
        )}

        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "12px", letterSpacing: ".5px", textTransform: "uppercase", color: "var(--rb-text-muted)", margin: "28px 0 10px" }}>
          Choose how to pay
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={payWithPaypal}
            disabled={paying}
            style={{ flex: 1, padding: 16, borderRadius: 14, border: "1.5px solid var(--rb-border)", background: "#fff", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "15px", color: "var(--rb-text)", cursor: paying ? "default" : "pointer" }}
          >
            PayPal
          </button>
          <button
            onClick={payWithStripe}
            disabled={paying}
            style={{ flex: 1, padding: 16, borderRadius: 14, border: "1.5px solid var(--rb-border)", background: "#fff", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "15px", color: "var(--rb-text)", cursor: paying ? "default" : "pointer" }}
          >
            Credit / debit card
          </button>
        </div>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "12.5px", color: "var(--rb-text-muted)", margin: "16px 0 0" }}>
          A receipt is emailed to you. Pay once — no subscription.
        </p>
      </div>
    </div>
  );
}
