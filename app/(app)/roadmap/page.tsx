"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Chip, Heading, PageShell, Text } from "@/components/ui";
import type { ChipTone } from "@/components/ui/Chip";

type Step = {
  id: string;
  stepKey: string;
  stepLabel: string;
  phase: string | null;
  status: "not_started" | "in_progress" | "done";
  position: number;
};

type Doc = {
  id: string;
  requirementId: string | null;
  name: string;
  status: string;
  translationRequired: boolean;
  legalizationChain: string | null;
  notarizationRequired: boolean;
  validityWindowDays: number | null;
  officialSourceLink: string | null;
};

type RoadmapData = {
  paymentStatus: "unpaid" | "essential" | "complete";
  arrivalDate: string | null;
  steps: Step[];
  documents: Doc[];
};

const STATUS_LABEL: Record<Step["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_TONE: Record<Step["status"], ChipTone> = {
  done: "teal",
  in_progress: "orange",
  not_started: "neutral",
};

function nextStatus(s: Step["status"]): Step["status"] {
  if (s === "not_started") return "in_progress";
  if (s === "in_progress") return "done";
  return "not_started";
}

function isArrivalNear(arrivalDate: string | null): boolean {
  if (!arrivalDate) return false;
  const days = (new Date(arrivalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return days <= 30 && days >= -7;
}

// A generic prompt to talk to a lawyer, shown for documents with real
// case-specific complexity (notarization or a multi-step legalization
// chain) - this is a UI trigger, not case-specific legal guidance itself.
function suggestsLawyer(doc: Doc | undefined): boolean {
  if (!doc) return false;
  return doc.notarizationRequired || !!doc.legalizationChain;
}

export default function RoadmapPage() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  async function cycle(step: Step) {
    if (!data) return;
    const status = nextStatus(step.status);
    const res = await fetch(`/api/roadmap/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setData({
        ...data,
        steps: data.steps.map((s) => (s.id === step.id ? { ...s, status } : s)),
      });
    }
  }

  if (loading) {
    return (
      <PageShell>
        <Text muted weight={500} size={15}>
          Loading your roadmap…
        </Text>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell style={{ textAlign: "center" }}>
        <div>
          <Text weight={500} size={15}>
            You need to access your roadmap first.
          </Text>
          <Link href="/access" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--rb-teal)" }}>
            Access your roadmap
          </Link>
        </div>
      </PageShell>
    );
  }

  const locked = data.paymentStatus === "unpaid";
  const doneCount = data.steps.filter((s) => s.status === "done").length;
  const total = data.steps.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const docByRequirement = new Map(data.documents.map((d) => [d.requirementId, d]));

  // Group steps by phase, preserving overall position order within each
  // phase and the order phases first appear in.
  const phaseOrder: string[] = [];
  const stepsByPhase = new Map<string, Step[]>();
  for (const step of data.steps) {
    const phase = step.phase ?? "Your roadmap";
    if (!stepsByPhase.has(phase)) {
      stepsByPhase.set(phase, []);
      phaseOrder.push(phase);
    }
    stepsByPhase.get(phase)!.push(step);
  }

  let globalIndex = 0;

  return (
    <div className="rb-roadmap-wrap" style={{ maxWidth: 820, margin: "0 auto", padding: "44px 48px 96px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Heading size="xl">Your roadmap</Heading>
        <Link href="/intake?edit=1" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--rb-teal)" }}>
          Edit my answers
        </Link>
      </div>

      {isArrivalNear(data.arrivalDate) && (
        <Link
          href="/bienvenido"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            marginTop: 16,
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            background: "rgba(27,58,62,.08)",
            border: "1px solid rgba(27,58,62,.2)",
          }}
        >
          <div>
            <Heading as="h4" size="sm" style={{ margin: "0 0 3px" }}>
              Arrival is coming up
            </Heading>
            <Text size={13} style={{ margin: 0 }}>
              Take a look at the Bienvenido guide - SIM cards, getting into the city, and settling in.
            </Text>
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--rb-teal)", whiteSpace: "nowrap" }}>
            Open guide
          </span>
        </Link>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
        <div style={{ flex: 1, height: 8, borderRadius: "var(--radius-full)", background: "rgba(34,48,60,.09)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--rb-gradient-orange)", borderRadius: "var(--radius-full)", transition: "width .4s ease" }} />
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--rb-teal)", whiteSpace: "nowrap" }}>
          {doneCount} of {total} done
        </span>
      </div>

      <Text size={12.5} style={{ lineHeight: 1.5, margin: "14px 0 0" }} muted>
        Guidance based on officially published requirements - not a guarantee of approval. The
        consulate makes the final decision.
      </Text>

      {total === 0 && (
        <Text size={14} muted style={{ marginTop: 24 }}>
          Your roadmap hasn&apos;t been generated yet.
        </Text>
      )}

      {phaseOrder.map((phase) => (
        <div key={phase} style={{ marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", background: "var(--rb-orange)" }} />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, letterSpacing: ".5px", textTransform: "uppercase", color: "var(--rb-teal)" }}>
              {phase}
            </span>
          </div>

          {stepsByPhase.get(phase)!.map((step) => {
            const i = globalIndex++;
            const doc = docByRequirement.get(step.stepKey);
            const isLocked = locked && i > 0;
            const isExpanded = expanded === step.id;
            const chain = doc?.legalizationChain?.split("→").map((s) => s.trim()).filter(Boolean) ?? [];

            return (
              <Card key={step.id} style={{ marginBottom: 14, overflow: "hidden", padding: 0 }}>
                <div
                  onClick={() => !isLocked && setExpanded(isExpanded ? null : step.id)}
                  style={{ padding: "18px 22px 16px", cursor: isLocked ? "default" : "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, letterSpacing: ".3px", textTransform: "uppercase", color: "var(--rb-text-muted)" }}>
                      Step {i + 1}
                    </span>
                    <Chip tone={STATUS_TONE[step.status]}>{STATUS_LABEL[step.status]}</Chip>
                  </div>
                  <Heading as="h3" size="sm" style={{ fontSize: 19, lineHeight: 1.3, margin: "9px 0 0" }}>
                    {step.stepLabel}
                  </Heading>
                  {!isLocked && (
                    <span style={{ display: "block", marginTop: 8, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--rb-teal)" }}>
                      {isExpanded ? "Hide detail ▲" : "View detail ▼"}
                    </span>
                  )}
                </div>

                {isLocked ? (
                  <div style={{ padding: "0 22px 22px" }}>
                    <div
                      style={{
                        background: "rgba(34,48,60,.04)",
                        border: "1.5px dashed var(--rb-dashed-border)",
                        borderRadius: "var(--radius-md)",
                        padding: 22,
                        textAlign: "center",
                      }}
                    >
                      <Text size={12} weight={600} muted style={{ letterSpacing: ".5px", textTransform: "uppercase", margin: "0 0 8px" }}>
                        Locked
                      </Text>
                      <Text size={14} style={{ lineHeight: 1.55, margin: "0 0 18px" }}>
                        Step-by-step detail and document tracking for this step are part of the full
                        roadmap.
                      </Text>
                      <Button variant="primary" href="/paywall">
                        See plans - from €39
                      </Button>
                    </div>
                  </div>
                ) : (
                  isExpanded && (
                    <div style={{ padding: "0 22px 22px", borderTop: "1px solid rgba(34,48,60,.07)" }}>
                      {doc && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: "var(--rb-text)" }}>
                              {doc.name}
                            </span>
                            {doc.translationRequired && (
                              <Link href="/translation">
                                <Chip tone="orange" style={{ padding: "2px 8px", fontSize: 10.5 }}>
                                  Translation required - get this translated
                                </Chip>
                              </Link>
                            )}
                            {doc.notarizationRequired && (
                              <Chip tone="teal" style={{ padding: "2px 8px", fontSize: 10.5 }}>
                                Notarization required
                              </Chip>
                            )}
                            {doc.validityWindowDays && (
                              <Chip tone="neutral" style={{ padding: "2px 8px", fontSize: 10.5 }}>
                                Valid {doc.validityWindowDays} days from issue
                              </Chip>
                            )}
                          </div>

                          {chain.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                              <Text size={11} weight={600} muted style={{ letterSpacing: ".5px", textTransform: "uppercase", margin: "0 0 8px" }}>
                                Legalization chain
                              </Text>
                              {chain.map((step2, idx) => (
                                <div key={idx} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "5px 0" }}>
                                  <span style={{ width: 20, height: 20, flex: "none", borderRadius: "var(--radius-full)", background: "rgba(27,58,62,.12)", color: "var(--rb-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11 }}>
                                    {idx + 1}
                                  </span>
                                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13.5, lineHeight: 1.4, color: "var(--rb-text-dense)" }}>
                                    {step2}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {doc.officialSourceLink && (
                            <a
                              href={doc.officialSourceLink}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 14,
                                padding: "9px 14px",
                                borderRadius: "var(--radius-sm)",
                                background: "rgba(27,58,62,.09)",
                                fontFamily: "var(--font-body)",
                                fontWeight: 600,
                                fontSize: 13,
                                color: "var(--rb-teal)",
                              }}
                            >
                              Official source ↗
                            </a>
                          )}

                          {suggestsLawyer(doc) && (
                            <Card variant="teal" style={{ marginTop: 16, padding: 18 }}>
                              <Text size={13.5} style={{ lineHeight: 1.5, color: "var(--rb-on-teal-body)", margin: 0 }}>
                                This step has case-specific rules. A vetted lawyer can review yours -
                                only if you&apos;d like.
                              </Text>
                              <Button variant="primary" style={{ marginTop: 12, padding: "10px 16px", fontSize: 13 }} href="/paywall">
                                Book a consult · from €45
                              </Button>
                            </Card>
                          )}
                        </div>
                      )}

                      <Button
                        variant="outline"
                        fullWidth
                        style={{ display: "block", marginTop: 16, padding: 12, fontSize: 14 }}
                        onClick={() => cycle(step)}
                      >
                        Mark as {STATUS_LABEL[nextStatus(step.status)]}
                      </Button>
                    </div>
                  )
                )}
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
