"use client";

import { useEffect, useState } from "react";
import { BIENVENIDO_CONTENT, type Lang } from "@/lib/bienvenidoContent";
import { Button, Card, Heading, PageShell, Text } from "@/components/ui";
import { BienvenidoIllustration } from "@/components/BienvenidoIcons";

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
      <PageShell>
        <Text muted weight={500} size={15}>
          Loading…
        </Text>
      </PageShell>
    );
  }

  if (paymentStatus !== "complete") {
    return (
      <PageShell style={{ textAlign: "center" }}>
        <div style={{ maxWidth: 440 }}>
          <Heading size="lg">Bienvenido is a Complete plan feature</Heading>
          <Text style={{ margin: "12px 0 22px" }}>
            Your arrival guide - SIM cards, getting into the city, safety notes, and settling in - available in English and Spanish.
          </Text>
          <Button variant="primary" href="/paywall">
            See plans - from €39
          </Button>
        </div>
      </PageShell>
    );
  }

  const content = BIENVENIDO_CONTENT[lang];

  return (
    <div className="rb-roadmap-wrap" style={{ maxWidth: 880, margin: "0 auto", padding: "44px 48px 96px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Heading size="xl">Bienvenido</Heading>
        <div style={{ display: "flex", gap: 6 }}>
          {(["en", "es"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: "7px 14px",
                borderRadius: "var(--radius-full)",
                border: lang === l ? "1.5px solid var(--rb-teal)" : "1.5px solid var(--rb-border)",
                background: lang === l ? "rgba(27,58,62,.08)" : "#fff",
                fontFamily: "var(--font-body)",
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

      <Text style={{ margin: "14px 0 0" }}>{content.intro}</Text>

      <Card variant="teal" style={{ marginTop: 20, padding: 20 }}>
        <Text
          size={14}
          style={{ color: "var(--rb-on-teal-body)", fontStyle: "italic" }}
        >
          {content.empathyLine}
        </Text>
      </Card>

      <div style={{ marginTop: 24 }}>
        {content.sections.map((s, i) => {
          const reversed = i % 2 === 1;
          return (
            <Card
              key={s.title}
              className="rb-bienvenido-row"
              style={{
                padding: "24px",
                marginBottom: 14,
                display: "flex",
                flexDirection: reversed ? "row-reverse" : "row",
                alignItems: "center",
                gap: 26,
              }}
            >
              <div
                className="rb-bienvenido-illustration"
                style={{
                  flex: "none",
                  width: 96,
                  height: 96,
                  borderRadius: "var(--radius-lg)",
                  background: i % 2 === 0 ? "rgba(27,58,62,.06)" : "rgba(212,86,46,.07)",
                  padding: 20,
                }}
              >
                <BienvenidoIllustration icon={s.icon} color={i % 2 === 0 ? "var(--rb-teal)" : "var(--rb-orange)"} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Heading as="h3" size="sm">
                  {s.title}
                </Heading>
                <Text size={14} style={{ margin: "8px 0 0" }}>
                  {s.body}
                </Text>
                {s.links && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                    {s.links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "9px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(27,58,62,.09)",
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          fontSize: 13,
                          color: "var(--rb-teal)",
                        }}
                      >
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
