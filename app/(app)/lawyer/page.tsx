"use client";

import { useEffect, useState } from "react";
import { Clock, GraduationCap, Lock } from "lucide-react";
import { Card, Heading, PageShell, Text } from "@/components/ui";
import { LegalPartnerScene } from "@/components/illustrations/LegalPartnerScene";

type Step = {
  id: string;
  stepLabel: string;
  status: "not_started" | "in_progress" | "done";
};

type Doc = {
  id: string;
  requirementId: string | null;
  notarizationRequired: boolean;
  legalizationChain: string | null;
};

type RoadmapData = {
  steps: Step[];
  documents: Doc[];
};

const BADGES = [
  { icon: Lock, label: "Confidential - only shared with you" },
  { icon: GraduationCap, label: "10 years, student visa cases" },
  { icon: Clock, label: "30-min focused consults" },
];

export default function LawyerPage() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
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

  const docByRequirement = new Map((data?.documents ?? []).map((d) => [d.requirementId, d]));
  const lawyerSteps = (data?.steps ?? []).filter((s) => {
    const doc = docByRequirement.get(s.id);
    return doc?.notarizationRequired || !!doc?.legalizationChain;
  });

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 48px 96px" }}>
      <div style={{ maxWidth: 200, margin: "0 0 4px" }}>
        <LegalPartnerScene width="100%" height="auto" />
      </div>
      <Heading size="xl">Talk to a lawyer</Heading>
      <Text size={15.5} style={{ lineHeight: 1.6, margin: "12px 0 0", maxWidth: 560 }}>
        Most of your roadmap you can handle yourself. A few steps have case-specific rules -
        that&apos;s when it&apos;s worth a second opinion.
      </Text>

      <div style={{ background: "var(--rb-teal)", borderRadius: "var(--radius-xl)", padding: 32, marginTop: 30, color: "var(--rb-on-teal)" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {BADGES.map((b) => (
            <span
              key={b.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(247,241,232,.08)",
                border: "1px solid rgba(247,241,232,.18)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 14px 8px 10px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 12.5,
                color: "var(--rb-on-teal-body)",
              }}
            >
              <b.icon size={13} strokeWidth={2} />
              {b.label}
            </span>
          ))}
        </div>
        <Heading as="h2" size="md" color="var(--rb-on-teal)" style={{ letterSpacing: "-.2px" }}>
          Rutabien&apos;s Legal Partner
        </Heading>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
          <span style={{ width: 56, height: 56, flex: "none", borderRadius: "var(--radius-full)", background: "rgba(247,241,232,.16)", color: "var(--rb-on-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>
            IQ
          </span>
          <div>
            <Text size={16} weight={600} color="#fff">
              Ida Quintián Pacheco
            </Text>
            <Text size={13} color="var(--rb-on-teal-muted)">
              Immigration lawyer · ICAB Barcelona
            </Text>
          </div>
        </div>
        <Text size={15} color="var(--rb-on-teal-body)" style={{ lineHeight: 1.6, margin: "20px 0 0", maxWidth: 560 }}>
          Ida has spent a decade helping international students through Spain&apos;s student visa
          and residence process. Consults are 30 minutes, one-on-one, focused on your specific
          case.
        </Text>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24, flexWrap: "wrap" }}>
          <a
            href="https://calendly.com/rutabien-ida/consult"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "var(--rb-orange)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "15px 24px",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 15,
              display: "inline-block",
            }}
          >
            Open booking page - from €45 ↗
          </a>
          <Text size={13} weight={500} color="var(--rb-on-teal-muted)">
            No pressure - cancel anytime
          </Text>
        </div>
        <Text size={12.5} color="var(--rb-on-teal-faint)" style={{ lineHeight: 1.5, margin: "16px 0 0" }}>
          Fees range €45–400 depending on the service - you&apos;ll see exact pricing before
          booking. Hosted on a dedicated business scheduling page that Ida controls herself,
          showing only the hours she&apos;s opened for consults - never her personal calendar.
        </Text>
      </div>

      <Text size={12} weight={600} muted style={{ letterSpacing: "1px", textTransform: "uppercase", margin: "34px 0 14px" }}>
        Good moments to bring one in
      </Text>
      {lawyerSteps.length === 0 && (
        <Text size={14} muted>
          Nothing flagged yet - case-specific steps will show up here once your roadmap is generated.
        </Text>
      )}
      {lawyerSteps.map((step) => (
        <Card key={step.id} style={{ padding: "18px 20px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Heading as="h4" size="sm" style={{ fontSize: 16 }}>
              {step.stepLabel}
            </Heading>
            <Text size={13} weight={600} color="var(--rb-teal)">
              View this step
            </Text>
          </div>
        </Card>
      ))}
    </div>
  );
}
