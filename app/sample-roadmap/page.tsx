"use client";

import { useState } from "react";
import HomeLink from "../HomeLink";
import { Button, Card, Chip, Heading, Text } from "@/components/ui";
import { RoadmapReadyScene } from "@/components/illustrations/RoadmapReadyScene";

// Static illustrative content - no login, no real user data. Deliberately
// NOT claimed as "based on officially published requirements" (that line
// is reserved for the real roadmap, backed by signed-off Requirements-table
// content) since this is example copy, not real guidance for anyone's case.
const SAMPLE_STEPS_NON_EU = [
  {
    name: "Valid passport",
    detail: "A passport valid for the full length of your stay, with at least two blank pages.",
    chips: [],
  },
  {
    name: "University acceptance letter",
    detail: "Official admission letter confirming your enrolment dates.",
    chips: ["Translation required"],
  },
  {
    name: "Academic transcript",
    detail: "Certified transcript of your most recent qualification.",
    chips: ["Translation required", "Notarization required"],
  },
  {
    name: "Police certificate",
    detail: "A criminal record certificate, legalized through your home country's chain.",
    chips: ["Translation required", "Valid 90 days from issue"],
  },
  {
    name: "Proof of funds",
    detail: "Bank statement or scholarship letter showing you can cover living costs.",
    chips: [],
  },
];

// Mirrors the real EU/EEA registration path (see app/(app)/eu-route/page.tsx)
// - deliberately shorter than the non-EU list, since that's the actual
// point: no visa, just a short registration route.
const SAMPLE_STEPS_EU = [
  {
    name: "Register your address (empadronamiento)",
    detail: "Register at your local town hall - you'll need this for almost every next step.",
    chips: ["Within 2 weeks of arrival"],
  },
  {
    name: "Register with the Oficina de Extranjeros",
    detail: "Bring your passport/ID, proof of address, and proof of funds or enrollment. You'll receive a Certificado de Registro.",
    chips: ["Within 90 days of arrival"],
  },
  {
    name: "Get academic credentials recognized",
    detail: "Your diploma and transcripts usually need a certified Spanish translation, even for EU credentials.",
    chips: ["Translation required"],
  },
];

const TABS = [
  { key: "non-eu" as const, label: "Non-EU student visa", steps: SAMPLE_STEPS_NON_EU },
  { key: "eu" as const, label: "EU/EEA registration", steps: SAMPLE_STEPS_EU },
];

export default function SampleRoadmapPage() {
  const [tab, setTab] = useState<"non-eu" | "eu">("non-eu");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const activeSteps = TABS.find((t) => t.key === tab)!.steps;
  const doneCount = activeSteps.filter((_, i) => done[`${tab}-${i}`]).length;
  const pct = Math.round((doneCount / activeSteps.length) * 100);

  return (
    <div className="rb-roadmap-wrap" style={{ maxWidth: 820, margin: "0 auto", padding: "44px 48px 96px" }}>
      <HomeLink />
      <div style={{ maxWidth: 220, margin: "0 auto 4px" }}>
        <RoadmapReadyScene width="100%" height="auto" />
      </div>
      <Chip tone="orange" style={{ letterSpacing: "1px", padding: "6px 14px", fontSize: 12, background: "rgba(212,86,46,.08)", border: "1px solid rgba(212,86,46,.2)" }}>
        Sample roadmap
      </Chip>
      <Heading size="xl" style={{ margin: "14px 0 0" }}>
        See what your roadmap could look like
      </Heading>
      <Text size={13.5} muted style={{ lineHeight: 1.6, margin: "10px 0 0", maxWidth: 560 }}>
        This is a static example to show what a generated roadmap looks like - not real guidance
        for your case. Answer the real questionnaire to get your own.
      </Text>

      <div style={{ display: "flex", gap: 6, marginTop: 22 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "9px 16px",
              borderRadius: "var(--radius-full)",
              border: tab === t.key ? "1.5px solid var(--rb-teal)" : "1.5px solid var(--rb-border)",
              background: tab === t.key ? "rgba(20,24,26,.08)" : "#fff",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--rb-teal)",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
        <div style={{ flex: 1, height: 8, borderRadius: "var(--radius-full)", background: "rgba(34,48,60,.09)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--rb-gradient-orange)", borderRadius: "var(--radius-full)", transition: "width .4s ease" }} />
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--rb-teal)", whiteSpace: "nowrap" }}>
          {doneCount} of {activeSteps.length} done
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 14px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", background: "var(--rb-orange)" }} />
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, letterSpacing: ".5px", textTransform: "uppercase", color: "var(--rb-teal)" }}>
          {tab === "eu" ? "Your registration route" : "Before you fly"}
        </span>
      </div>

      {activeSteps.map((step, i) => {
        const key = `${tab}-${i}`;
        return (
          <Card
            key={key}
            onClick={() => setDone((d) => ({ ...d, [key]: !d[key] }))}
            style={{ marginBottom: 14, padding: "18px 22px" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, letterSpacing: ".3px", textTransform: "uppercase", color: "var(--rb-text-muted)" }}>
                Step {i + 1}
              </span>
              <Chip tone={done[key] ? "teal" : "neutral"}>{done[key] ? "Done" : "Not started"}</Chip>
            </div>
            <Heading as="h3" size="sm" style={{ fontSize: 19, margin: "9px 0 4px" }}>
              {step.name}
            </Heading>
            <Text size={13.5} style={{ lineHeight: 1.5, margin: "0 0 8px" }}>
              {step.detail}
            </Text>
            {step.chips.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {step.chips.map((c) => (
                  <Chip key={c} tone="orange" style={{ padding: "2px 8px", fontSize: 10.5 }}>
                    {c}
                  </Chip>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      <Button variant="primary" style={{ marginTop: 12 }} href="/intake">
        Get my real roadmap
      </Button>
    </div>
  );
}
