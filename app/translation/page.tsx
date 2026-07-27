"use client";

import { useState } from "react";
import { computeTranslationTotal, POSTAL_DELIVERY_SURCHARGE_EUR, tierPriceFor } from "@/lib/translationPricing";
import HomeLink from "../HomeLink";
import { Button, Card, Heading, PageShell, Text, TextInput } from "@/components/ui";

const STEPS = [
  { n: "01", title: "Attach", body: "Upload scans of the documents you need translated." },
  { n: "02", title: "We translate", body: "Our translation team prepares a certified Spanish translation." },
  { n: "03", title: "Get it back", body: "Ready in 2 working days - download it, or have a copy posted to you." },
];

// Standalone entry point - "Just need a translation?" - skips the entire
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
      <PageShell>
        <HomeLink />
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <Heading size="lg">Check your inbox</Heading>
          <Text style={{ margin: "14px 0 0" }}>
            We&apos;ve sent a link to {email} - click it to upload your documents and pay.
          </Text>
          <Button variant="secondary" size="lg" fullWidth href="/" style={{ marginTop: 24 }}>
            Back to homepage
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "80px 48px" }}>
      <HomeLink />
      <div
        className="rb-translation-grid"
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          gap: 56,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 380px", maxWidth: 420 }}>
          <Heading size="lg" style={{ fontSize: 32 }}>
            Just need a translation?
          </Heading>
          <Text size={15} style={{ margin: "12px 0 0", lineHeight: 1.6 }}>
            Sworn translation via our accredited translator partner - no visa questionnaire
            needed. Attach a scan, we translate it, you get it back.
          </Text>

          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 22 }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span
                  style={{
                    flex: "none",
                    width: 34,
                    height: 34,
                    borderRadius: "var(--radius-full)",
                    border: "2px solid var(--rb-orange)",
                    color: "var(--rb-orange)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {s.n}
                </span>
                <div>
                  <Heading as="h3" size="sm" style={{ fontSize: 16 }}>
                    {s.title}
                  </Heading>
                  <Text size={13.5} style={{ margin: "3px 0 0", lineHeight: 1.5 }}>
                    {s.body}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card style={{ flex: "1 1 380px", maxWidth: 440, padding: 32 }}>
          <Text size={13} weight={600} color="var(--rb-text)" style={{ margin: "0 0 10px" }}>
            How many documents?
          </Text>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setDocumentCount((c) => Math.max(1, c - 1))}
              style={stepperBtn}
            >
              −
            </button>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--rb-text)", minWidth: 24, textAlign: "center" }}>
              {documentCount}
            </span>
            <button onClick={() => setDocumentCount((c) => Math.min(50, c + 1))} style={stepperBtn}>
              +
            </button>
            <Text size={13} weight={500} muted>
              €{tierPriceFor(documentCount)} for {documentCount <= 3 ? "1-3" : documentCount <= 6 ? "4-6" : "7+"} docs
            </Text>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, cursor: "pointer" }}>
            <input type="checkbox" checked={postalDelivery} onChange={(e) => setPostalDelivery(e.target.checked)} />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: "var(--rb-text)" }}>
              Postal delivery (+€{POSTAL_DELIVERY_SURCHARGE_EUR})
            </span>
          </label>

          <div style={{ marginTop: 22, padding: "16px 20px", background: "var(--rb-bg)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--rb-text-muted)", textTransform: "uppercase", letterSpacing: ".3px" }}>
              Total
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 28, color: "var(--rb-text)" }}>€{total}</span>
          </div>

          {error && (
            <Text size={13} weight={500} color="var(--rb-orange)" style={{ marginTop: 14 }}>
              {error}
            </Text>
          )}

          <TextInput
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@email.com"
            style={{ marginTop: 18 }}
          />
          <Button
            variant="primary"
            fullWidth
            disabled={!email || submitting}
            style={{ marginTop: 12, padding: 16, borderRadius: "var(--radius-xl)", fontSize: 15 }}
            onClick={submit}
          >
            {submitting ? "Starting…" : `Continue - €${total}`}
          </Button>
          <Text size={12} muted style={{ marginTop: 12 }}>
            A receipt is emailed to you. Pay once - no subscription.
          </Text>
        </Card>
      </div>
    </div>
  );
}

const stepperBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "var(--radius-full)",
  border: "1.5px solid var(--rb-border)",
  background: "#fff",
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  fontSize: 18,
  color: "var(--rb-text)",
  cursor: "pointer",
};
