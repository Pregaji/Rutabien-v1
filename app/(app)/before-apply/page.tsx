"use client";

import { useEffect, useState } from "react";
import { Button, Heading, PageShell, Text } from "@/components/ui";
import { BeforeApplyScene } from "@/components/illustrations/BeforeApplyScene";

const CHECKLIST = [
  "Apply to your chosen Spanish universities and wait for an offer.",
  "Once accepted, request your official acceptance/admission letter.",
  "Start gathering proof of funds and private health insurance - both take time.",
];

export default function BeforeApplyPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((d) => setEmail(d.email ?? null))
      .catch(() => setEmail(null))
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
    <PageShell style={{ textAlign: "center" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <BeforeApplyScene width={220} height={157} className="rb-empty-illustration" />
        <Heading size="lg" style={{ marginTop: 8 }}>We&apos;ll be in touch</Heading>
        <Text size={15} style={{ lineHeight: 1.6, margin: "14px 0 0" }}>
          We&apos;ve saved {email ?? "your email"} - we&apos;ll follow up once it&apos;s a good
          time to pick this back up. In the meantime:
        </Text>
        <ul style={{ textAlign: "left", margin: "18px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {CHECKLIST.map((item) => (
            <li key={item} style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--rb-text-dense)" }}>
              {item}
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="lg" fullWidth style={{ marginTop: 24 }} href="/">
          Back to homepage
        </Button>
        <Button variant="ghost" size="lg" fullWidth style={{ marginTop: 10 }} href="/access">
          Already have a roadmap? Access it here
        </Button>
      </div>
    </PageShell>
  );
}
