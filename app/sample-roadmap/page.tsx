"use client";

import { useState } from "react";
import HomeLink from "../HomeLink";
import { Button, Card, Chip, Heading, Text } from "@/components/ui";

// Static illustrative content - no login, no real user data. Deliberately
// NOT claimed as "based on officially published requirements" (that line
// is reserved for the real roadmap, backed by signed-off Requirements-table
// content) since this is example copy, not real guidance for anyone's case.
const SAMPLE_STEPS = [
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

export default function SampleRoadmapPage() {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((doneCount / SAMPLE_STEPS.length) * 100);

  return (
    <div className="rb-roadmap-wrap" style={{ maxWidth: 820, margin: "0 auto", padding: "44px 48px 96px" }}>
      <HomeLink />
      <Chip tone="orange" style={{ letterSpacing: "1px", padding: "6px 14px", fontSize: 12, background: "rgba(212,86,46,.08)", border: "1px solid rgba(212,86,46,.2)" }}>
        Example roadmap
      </Chip>
      <Heading size="xl" style={{ margin: "14px 0 0" }}>
        Non-EU student visa - illustrative example
      </Heading>
      <Text size={13.5} muted style={{ lineHeight: 1.6, margin: "10px 0 0", maxWidth: 560 }}>
        This is a static example to show what a generated roadmap looks like - not real guidance
        for your case. Answer the real questionnaire to get your own.
      </Text>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 24 }}>
        <div style={{ flex: 1, height: 8, borderRadius: "var(--radius-full)", background: "rgba(34,48,60,.09)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--rb-gradient-orange)", borderRadius: "var(--radius-full)", transition: "width .4s ease" }} />
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--rb-teal)", whiteSpace: "nowrap" }}>
          {doneCount} of {SAMPLE_STEPS.length} done
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 14px" }}>
        <span style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", background: "var(--rb-orange)" }} />
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, letterSpacing: ".5px", textTransform: "uppercase", color: "var(--rb-teal)" }}>
          Before you fly
        </span>
      </div>

      {SAMPLE_STEPS.map((step, i) => (
        <Card
          key={step.name}
          onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
          style={{ marginBottom: 14, padding: "18px 22px" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, letterSpacing: ".3px", textTransform: "uppercase", color: "var(--rb-text-muted)" }}>
              Step {i + 1}
            </span>
            <Chip tone={done[i] ? "teal" : "neutral"}>{done[i] ? "Done" : "Not started"}</Chip>
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
      ))}

      <Button variant="primary" style={{ marginTop: 12 }} href="/intake">
        Get my real roadmap
      </Button>
    </div>
  );
}
