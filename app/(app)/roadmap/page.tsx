"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const STATUS_CHIP: Record<Step["status"], React.CSSProperties> = {
  done: { background: "rgba(27,58,62,.12)", color: "var(--rb-teal)" },
  in_progress: { background: "rgba(212,86,46,.15)", color: "var(--rb-orange)" },
  not_started: { background: "rgba(34,48,60,.07)", color: "#6B7A85" },
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
// chain) — this is a UI trigger, not case-specific legal guidance itself.
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
      <Centered>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "15px", color: "var(--rb-text-muted)" }}>
          Loading your roadmap…
        </p>
      </Centered>
    );
  }

  if (!data) {
    return (
      <Centered>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "15px", color: "var(--rb-text-secondary)" }}>
            You need to access your roadmap first.
          </p>
          <Link href="/access" style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "14px", color: "var(--rb-teal)" }}>
            Access your roadmap →
          </Link>
        </div>
      </Centered>
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
        <h1 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "34px", color: "var(--rb-text)", margin: 0, letterSpacing: "-.3px" }}>
          Your roadmap
        </h1>
        <Link href="/intake?edit=1" style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, color: "var(--rb-teal)" }}>
          Edit my answers →
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
            borderRadius: 14,
            background: "rgba(27,58,62,.08)",
            border: "1px solid rgba(27,58,62,.2)",
          }}
        >
          <div>
            <h4 style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 15, color: "var(--rb-text)", margin: "0 0 3px" }}>
              Arrival is coming up
            </h4>
            <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: 13, color: "var(--rb-text-secondary)", margin: 0 }}>
              Take a look at the Bienvenido guide — SIM cards, getting into the city, and settling in.
            </p>
          </div>
          <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 13, color: "var(--rb-teal)", whiteSpace: "nowrap" }}>
            Open guide →
          </span>
        </Link>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(34,48,60,.09)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #E2733F, #D4562E)", borderRadius: 999, transition: "width .4s ease" }} />
        </div>
        <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "13px", color: "var(--rb-teal)", whiteSpace: "nowrap" }}>
          {doneCount} of {total} done
        </span>
      </div>

      <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "12.5px", lineHeight: "1.5", color: "var(--rb-text-muted)", margin: "14px 0 0" }}>
        Guidance based on officially published requirements — not a guarantee of approval. The
        consulate makes the final decision.
      </p>

      {total === 0 && (
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "14px", color: "var(--rb-text-muted)", marginTop: 24 }}>
          Your roadmap hasn&apos;t been generated yet.
        </p>
      )}

      {phaseOrder.map((phase) => (
        <div key={phase} style={{ marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--rb-orange)" }} />
            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "13px", letterSpacing: ".5px", textTransform: "uppercase", color: "var(--rb-teal)" }}>
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
              <div
                key={step.id}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(34,48,60,.08)",
                  borderRadius: 16,
                  marginBottom: 14,
                  boxShadow: "0 8px 18px -13px rgba(34,48,60,.3)",
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => !isLocked && setExpanded(isExpanded ? null : step.id)}
                  style={{ padding: "18px 22px 16px", cursor: isLocked ? "default" : "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "11px", letterSpacing: ".3px", textTransform: "uppercase", color: "var(--rb-text-muted)" }}>
                      Step {i + 1}
                    </span>
                    <span style={{ ...STATUS_CHIP[step.status], display: "inline-flex", alignItems: "center", padding: "4px 11px", borderRadius: 999, fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "11px", letterSpacing: ".3px" }}>
                      {STATUS_LABEL[step.status]}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "19px", lineHeight: "1.3", color: "var(--rb-text)", margin: "9px 0 0" }}>
                    {step.stepLabel}
                  </h3>
                  {!isLocked && (
                    <span style={{ display: "block", marginTop: 8, fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "13px", color: "var(--rb-teal)" }}>
                      {isExpanded ? "Hide detail ▲" : "View detail ▼"}
                    </span>
                  )}
                </div>

                {isLocked ? (
                  <div style={{ padding: "0 22px 22px" }}>
                    <div
                      style={{
                        background: "rgba(34,48,60,.04)",
                        border: "1.5px dashed #D8CDB8",
                        borderRadius: 14,
                        padding: 22,
                        textAlign: "center",
                      }}
                    >
                      <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "12px", letterSpacing: ".5px", textTransform: "uppercase", color: "var(--rb-text-muted)", margin: "0 0 8px" }}>
                        Locked
                      </p>
                      <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "14px", lineHeight: "1.55", color: "var(--rb-text-secondary)", margin: "0 0 18px" }}>
                        Step-by-step detail and document tracking for this step are part of the full
                        roadmap.
                      </p>
                      <Link
                        href="/paywall"
                        style={{
                          background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
                          color: "#fff",
                          borderRadius: 11,
                          padding: "12px 22px",
                          fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "14px",
                          display: "inline-block",
                          boxShadow: "0 12px 24px -12px rgba(212,86,46,.5)",
                        }}
                      >
                        See plans — from €39
                      </Link>
                    </div>
                  </div>
                ) : (
                  isExpanded && (
                    <div style={{ padding: "0 22px 22px", borderTop: "1px solid rgba(34,48,60,.07)" }}>
                      {doc && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "14px", color: "var(--rb-text)" }}>
                              {doc.name}
                            </span>
                            {doc.translationRequired && (
                              <Link href="/translation">
                                <Chip label="Translation required — get this translated →" bg="rgba(212,86,46,.12)" color="var(--rb-orange)" />
                              </Link>
                            )}
                            {doc.notarizationRequired && (
                              <Chip label="Notarization required" bg="rgba(27,58,62,.1)" color="var(--rb-teal)" />
                            )}
                            {doc.validityWindowDays && (
                              <Chip label={`Valid ${doc.validityWindowDays} days from issue`} bg="rgba(34,48,60,.07)" color="#6B7A85" />
                            )}
                          </div>

                          {chain.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                              <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "11px", letterSpacing: ".5px", textTransform: "uppercase", color: "var(--rb-text-muted)", margin: "0 0 8px" }}>
                                Legalization chain
                              </p>
                              {chain.map((step2, idx) => (
                                <div key={idx} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "5px 0" }}>
                                  <span style={{ width: 20, height: 20, flex: "none", borderRadius: 999, background: "rgba(27,58,62,.12)", color: "var(--rb-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: 11 }}>
                                    {idx + 1}
                                  </span>
                                  <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "13.5px", lineHeight: "1.4", color: "#3A4A54" }}>
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
                                borderRadius: 10,
                                background: "rgba(27,58,62,.09)",
                                fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "13px",
                                color: "var(--rb-teal)",
                              }}
                            >
                              Official source ↗
                            </a>
                          )}

                          {suggestsLawyer(doc) && (
                            <div
                              style={{
                                marginTop: 16,
                                background: "linear-gradient(135deg, var(--rb-teal) 0%, #234b50 100%)",
                                borderRadius: 16,
                                padding: 18,
                              }}
                            >
                              <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "13.5px", lineHeight: "1.5", color: "#DCE7E5", margin: 0 }}>
                                This step has case-specific rules. A vetted lawyer can review yours —
                                only if you&apos;d like.
                              </p>
                              <Link
                                href="/paywall"
                                style={{
                                  display: "inline-block",
                                  marginTop: 12,
                                  background: "linear-gradient(135deg, #E2733F 0%, #D4562E 55%, #B23F1F 100%)",
                                  color: "#fff",
                                  borderRadius: 10,
                                  padding: "10px 16px",
                                  fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "13px",
                                }}
                              >
                                Book a consult · from €45
                              </Link>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => cycle(step)}
                        style={{
                          display: "block",
                          width: "100%",
                          marginTop: 16,
                          padding: 12,
                          borderRadius: 12,
                          border: "1.5px solid var(--rb-border)",
                          background: "#fff",
                          fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "14px",
                          color: "var(--rb-text)",
                          cursor: "pointer",
                        }}
                      >
                        Mark as {STATUS_LABEL[nextStatus(step.status)]}
                      </button>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Chip({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 999, fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "10.5px" }}>
      {label}
    </span>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      {children}
    </div>
  );
}
