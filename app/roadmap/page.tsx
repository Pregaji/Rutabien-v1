"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Step = {
  id: string;
  stepLabel: string;
  status: "not_started" | "in_progress" | "done";
  position: number;
};

type Doc = {
  id: string;
  name: string;
  status: string;
  translationRequired: boolean;
  legalizationChain: string | null;
};

type RoadmapData = {
  paymentStatus: "unpaid" | "essential" | "complete";
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

export default function RoadmapPage() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "44px 48px 96px" }}>
      <h1 style={{ fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "34px", color: "var(--rb-text)", margin: 0, letterSpacing: "-.3px" }}>
        Your roadmap
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(34,48,60,.09)", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--rb-orange)", borderRadius: 999, transition: "width .4s ease" }} />
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

      <div style={{ marginTop: 24 }}>
        {data.steps.map((step, i) => {
          const doc = data.documents[i];
          const isLocked = locked && i > 0;
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
                padding: "18px 22px 16px",
              }}
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

              {isLocked ? (
                <div
                  style={{
                    marginTop: 16,
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
                      background: "var(--rb-orange)",
                      color: "#fff",
                      borderRadius: 11,
                      padding: "12px 22px",
                      fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "14px",
                      display: "inline-block",
                    }}
                  >
                    See plans — from €39
                  </Link>
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  {doc && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={{ fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "13.5px", color: "var(--rb-text-secondary)" }}>
                        {doc.name}
                      </span>
                      {doc.translationRequired && (
                        <span
                          style={{
                            background: "rgba(212,86,46,.12)",
                            color: "var(--rb-orange)",
                            padding: "2px 8px",
                            borderRadius: 999,
                            fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "10.5px",
                          }}
                        >
                          Translation required
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => cycle(step)}
                    style={{
                      display: "block",
                      width: "100%",
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      {children}
    </div>
  );
}
