"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PRICING_TIERS, type PlanType } from "@/lib/pricing";
import HomeLink from "../HomeLink";
import { Button, Heading, PageShell, Text } from "@/components/ui";
import { PaywallTiersScene } from "@/components/illustrations/PaywallTiersScene";
import { UnlockScene } from "@/components/illustrations/UnlockScene";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

const checkIcon = (bg: string, color: string) => ({
  width: 18,
  height: 18,
  flex: "none" as const,
  borderRadius: "var(--radius-full)",
  background: bg,
  color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 1,
});

export default function PaywallPage() {
  const [selectedTier, setSelectedTier] = useState<PlanType | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedTier) {
    return (
      <PageShell className="rb-paywall-wrap">
        <HomeLink />
        <div style={{ width: "100%", maxWidth: 820 }}>
          <div style={{ maxWidth: 260, margin: "0 auto" }}>
            <PaywallTiersScene width="100%" height="auto" />
          </div>
          <Heading size="lg" style={{ fontSize: 30, textAlign: "center", marginTop: 8 }}>
            Unlock your full roadmap
          </Heading>
          <Text size={14.5} muted style={{ margin: "10px 0 0", textAlign: "center" }}>
            Both plans are a single payment - no auto-renewal, ever.
          </Text>

          <div style={{ display: "flex", gap: 20, marginTop: 28, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px", background: "#fff", borderRadius: "var(--radius-xl)", padding: 28, border: "1.5px solid var(--rb-border)" }}>
              <Heading as="h3" size="sm" style={{ fontSize: 19 }}>
                {PRICING_TIERS.essential.name}
              </Heading>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 34, color: "var(--rb-text)" }}>
                  €{PRICING_TIERS.essential.priceEur}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "var(--rb-text-muted)" }}>one-time</span>
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {PRICING_TIERS.essential.includes.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={checkIcon("rgba(27,58,62,.12)", "var(--rb-teal)")}><Check size={10} strokeWidth={3} /></span>
                    <Text size={14} style={{ lineHeight: 1.5, color: "var(--rb-text-dense)" }}>{f}</Text>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                fullWidth
                style={{ marginTop: 24, padding: 13, fontSize: 14.5, transition: "background .15s ease" }}
                onClick={() => setSelectedTier("essential")}
              >
                Choose {PRICING_TIERS.essential.name}
              </Button>
            </div>

            <div
              style={{
                flex: "1 1 320px",
                borderRadius: "var(--radius-xl)",
                padding: 28,
                background: "var(--rb-gradient-teal)",
                position: "relative",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: -13,
                  left: 28,
                  background: "var(--rb-gradient-orange)",
                  color: "#fff",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: ".3px",
                }}
              >
                Most popular
              </span>
              <Heading as="h3" size="sm" color="var(--rb-on-teal)" style={{ fontSize: 19 }}>
                {PRICING_TIERS.complete.name}
              </Heading>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 34, color: "var(--rb-on-teal)" }}>
                  €{PRICING_TIERS.complete.priceEur}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "var(--rb-on-teal-muted)" }}>
                  single payment, valid 12 months
                </span>
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {PRICING_TIERS.complete.includes.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={checkIcon("rgba(245,242,236,.15)", "var(--rb-on-teal)")}><Check size={10} strokeWidth={3} /></span>
                    <Text size={14} style={{ lineHeight: 1.5, color: "var(--rb-on-teal-body)" }}>{f}</Text>
                  </div>
                ))}
              </div>
              <Button
                variant="primary"
                fullWidth
                style={{ marginTop: 24, padding: 13, fontSize: 14.5 }}
                onClick={() => setSelectedTier("complete")}
              >
                Choose {PRICING_TIERS.complete.name}
              </Button>
            </div>
          </div>
          <Text size={12.5} muted style={{ margin: "18px 0 0" }}>
            &quot;Valid for 12 months&quot; means single access period, not a recurring charge -
            nothing renews automatically.
          </Text>
        </div>
      </PageShell>
    );
  }

  const tier = PRICING_TIERS[selectedTier];

  async function payWithStripe() {
    trackEvent(ANALYTICS_EVENTS.checkoutStarted, { plan: selectedTier, method: "stripe" });
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
    trackEvent(ANALYTICS_EVENTS.checkoutStarted, { plan: selectedTier, method: "paypal" });
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
    <PageShell>
      <HomeLink />
      <div style={{ width: "100%", maxWidth: 460 }}>
        <Button
          variant="ghost"
          style={{ border: "none", padding: "0 0 18px", fontSize: 15 }}
          onClick={() => setSelectedTier(null)}
        >
          ‹ Back
        </Button>
        <div style={{ maxWidth: 180, marginBottom: 4 }}>
          <UnlockScene width="100%" height="auto" />
        </div>
        <Heading size="lg">{tier.name} plan</Heading>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 18 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 46, color: "var(--rb-text)" }}>€{tier.priceEur}</span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: "var(--rb-text-muted)" }}>single payment</span>
        </div>
        <Text size={13.5} muted style={{ margin: "6px 0 0" }}>
          This is the full price - nothing changes at checkout.
        </Text>

        {error && (
          <Text size={13} weight={500} color="var(--rb-orange)" style={{ marginTop: 16 }}>
            {error}
          </Text>
        )}

        <Text size={12} weight={600} muted style={{ letterSpacing: ".5px", textTransform: "uppercase", margin: "28px 0 10px" }}>
          Choose how to pay
        </Text>
        <div style={{ display: "flex", gap: 12 }}>
          <Button
            variant="outline"
            disabled={paying}
            style={{ flex: 1, padding: 16, fontSize: 15, borderRadius: "var(--radius-lg)" }}
            onClick={payWithPaypal}
          >
            PayPal
          </Button>
          <Button
            variant="outline"
            disabled={paying}
            style={{ flex: 1, padding: 16, fontSize: 15, borderRadius: "var(--radius-lg)" }}
            onClick={payWithStripe}
          >
            Credit / debit card
          </Button>
        </div>
        <Text size={12.5} muted style={{ margin: "16px 0 0" }}>
          A receipt is emailed to you. Pay once - no subscription.
        </Text>
      </div>
    </PageShell>
  );
}
