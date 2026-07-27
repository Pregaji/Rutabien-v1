"use client";

import { useEffect, useState } from "react";
import { Button, Card, Heading, PageShell, Text } from "@/components/ui";

type RouteData = {
  email: string;
};

const STEPS = [
  {
    due: "Within 2 weeks of arrival",
    title: "Register your address (empadronamiento)",
    body: "Register at your local town hall - you'll need this for almost every next step.",
  },
  {
    due: "Within 90 days of arrival",
    title: "Register with the Oficina de Extranjeros",
    body: "Bring your passport/ID, proof of address, and proof of funds or enrollment. You'll receive a Certificado de Registro - keep it with your ID for future paperwork.",
  },
];

export default function EuRoutePage() {
  const [data, setData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => setData({ email: d.email }))
      .catch(() => setData(null))
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

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 96px" }}>
      <Heading size="xl" style={{ textAlign: "center" }}>
        Good news - you don&apos;t need a student visa
      </Heading>
      <Text size={15} style={{ lineHeight: 1.6, margin: "14px 0 0", textAlign: "center" }}>
        EU/EEA citizens don&apos;t need a visa, but there&apos;s still a short route to follow -
        including recognizing your academic credentials in Spain.
      </Text>

      <div style={{ marginTop: 32, borderLeft: "2px dashed var(--rb-dashed-border)", marginLeft: 9, paddingLeft: 26 }}>
        {STEPS.map((s) => (
          <Card key={s.title} style={{ padding: "20px 22px", marginBottom: 14 }}>
            <Text size={11} weight={600} muted style={{ letterSpacing: ".3px", textTransform: "uppercase" }}>
              {s.due}
            </Text>
            <Heading as="h3" size="sm" style={{ margin: "8px 0 6px" }}>
              {s.title}
            </Heading>
            <Text size={14} style={{ lineHeight: 1.5 }}>
              {s.body}
            </Text>
          </Card>
        ))}

        <Card style={{ padding: "20px 22px", border: "1px solid rgba(212,86,46,.3)" }}>
          <Text size={11} weight={600} color="var(--rb-orange)" style={{ letterSpacing: ".3px", textTransform: "uppercase" }}>
            Before enrolling
          </Text>
          <Heading as="h3" size="sm" style={{ margin: "8px 0 6px" }}>
            Get your academic credentials recognized
          </Heading>
          <Text size={14} style={{ lineHeight: 1.5, margin: "0 0 14px" }}>
            Your diploma and transcripts usually need a certified Spanish translation, even for EU
            credentials - universities ask for this as part of enrollment.
          </Text>
          <Button variant="primary" style={{ padding: "11px 18px", fontSize: 13.5 }} href="/translation">
            See translation options
          </Button>
        </Card>
      </div>

      <Text size={12.5} muted style={{ margin: "18px 0 0", textAlign: "center" }}>
        No visa, no TIE card, no consulate appointment needed.
        {data?.email ? ` We've saved this route to ${data.email}.` : ""}
      </Text>
      <Button variant="secondary" size="lg" fullWidth style={{ marginTop: 22 }} href="/">
        Back to homepage
      </Button>
    </div>
  );
}
