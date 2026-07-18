"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getNextStep, type IntakeAnswers, type StepId } from "@/lib/intakeTree";
import HomeLink from "../HomeLink";

const card = { width: "100%", maxWidth: 560 } as const;
const heading = { fontFamily: "var(--font-spectral)", fontWeight: 600, fontSize: "34px", lineHeight: "1.2", color: "var(--rb-text)", margin: 0, letterSpacing: "-.3px" } as const;
const help = { fontFamily: "var(--font-figtree)", fontWeight: 400, fontSize: "15px", lineHeight: "1.5", color: "var(--rb-text-muted)", margin: "12px 0 0" } as const;

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rb-option-btn"
      style={{
        textAlign: "left",
        padding: "15px 18px",
        borderRadius: 14,
        border: selected ? "1.5px solid var(--rb-orange)" : "1.5px solid var(--rb-border)",
        background: selected ? "rgba(212,86,46,.09)" : "#fff",
        fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "16px", lineHeight: "1.3",
        color: "var(--rb-text)",
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flex: "1 1 220px",
        minWidth: 170,
      }}
    >
      <span>{label}</span>
      <span
        style={{
          width: 20,
          height: 20,
          flex: "none",
          borderRadius: 999,
          background: selected ? "var(--rb-orange)" : "transparent",
          border: selected ? "none" : "1.5px solid #D8CDB8",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
        }}
      >
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: 14,
  border: "1.5px solid var(--rb-border)",
  background: "#fff",
  fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "16px",
  color: "var(--rb-text)",
} as const;

const NATIONALITIES = [
  "Brazil",
  "India",
  "United States",
  "Mexico",
  "China",
  "Colombia",
  "Nigeria",
  "South Korea",
  "Vietnam",
  "Other",
];

const STEP_LABELS: Record<StepId, string> = {
  EU_EEA_CITIZEN: "EU/EEA status",
  APPLICANT_TYPE: "New or returning",
  RENEWAL_PERMIT_TYPE: "Current permit",
  RENEWAL_PERMIT_EXPIRY: "Permit expiry",
  NATIONALITY: "Nationality",
  ACCEPTANCE_LETTER: "Acceptance letter",
  FAMILY_MEMBERS: "Family members",
  PART_TIME_WORK: "Part-time work",
  HOUSING: "Housing",
  ARRIVAL_DATE: "Arrival date",
  EMAIL: "Email",
  COMPLETE: "Done",
};

export default function IntakePage() {
  return (
    <Suspense fallback={null}>
      <IntakePageInner />
    </Suspense>
  );
}

function IntakePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editing = searchParams.get("edit") === "1";

  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const [history, setHistory] = useState<IntakeAnswers[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    fetch("/api/intake/current")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        // Loaded answers are already "complete" (they generated the
        // existing roadmap), which would make getNextStep return COMPLETE
        // immediately. Drop email so the tree re-lands on the last question
        // — the user reviews/confirms it, which also re-triggers submit.
        // Known limitation: Back is disabled until they've re-answered at
        // least one question, since we don't reconstruct full step history
        // from a flat answers object.
        const loaded = { ...(data.answers ?? {}) };
        delete loaded.email;
        setAnswers(loaded);
      })
      .catch(() => setError("Could not load your current answers."))
      .finally(() => setLoadingCurrent(false));
  }, [editing]);

  const step = getNextStep(answers);

  async function commit(next: IntakeAnswers) {
    setHistory((h) => [...h, answers]);
    setAnswers(next);

    if (getNextStep(next) === "COMPLETE") {
      setSubmitting(true);
      setError(null);
      const res = await fetch(editing ? "/api/intake/update" : "/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      setSubmitting(false);
      if (res.ok) {
        if (editing) {
          router.push("/roadmap");
        } else {
          setSubmitted(true);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong — please try again.");
      }
    }
  }

  function back() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const copy = [...h];
      const prev = copy.pop()!;
      setAnswers(prev);
      return copy;
    });
  }

  if (loadingCurrent) {
    return (
      <Centered>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: 15, color: "var(--rb-text-muted)" }}>
          Loading your answers…
        </p>
      </Centered>
    );
  }

  if (submitted) {
    return (
      <Centered>
        <HomeLink />
        <div style={{ ...card, textAlign: "center" }}>
          <h2 style={heading}>Check your inbox</h2>
          <p style={help}>
            We&apos;ve sent a link to {answers.email}. It&apos;ll take you straight to your
            roadmap — no password needed.
          </p>
        </div>
      </Centered>
    );
  }

  // The tree branches, so there's no fixed step count — this is a rough
  // estimate against the 9-question full path, just for a progress bar.
  const ESTIMATED_TOTAL = 9;
  const progressPct = Math.min(100, Math.round((history.length / ESTIMATED_TOTAL) * 100));

  return (
    <div className="rb-intake-shell">
      <div className="rb-intake-sidebar">
        <Link
          href="/"
          style={{
            display: "block",
            fontFamily: "var(--font-spectral)",
            fontWeight: 600,
            fontSize: 16,
            color: "#F5F2EC",
            marginBottom: 18,
          }}
        >
          Rutabien
        </Link>
        <button
          onClick={back}
          disabled={history.length === 0}
          style={{
            background: "none",
            border: "none",
            padding: "2px 0 24px",
            cursor: history.length ? "pointer" : "default",
            fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "15px",
            color: "#F5F2EC",
            opacity: history.length ? 1 : 0.4,
          }}
        >
          ‹ Back
        </button>
        <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "12px", color: "#B8CFCC", letterSpacing: ".5px", textTransform: "uppercase", margin: 0 }}>
          {STEP_LABELS[step]}
        </p>
        <div className="rb-intake-desktop-rail" />
        <div className="rb-intake-mobile-progress">
          <div style={{ height: 4, borderRadius: 999, background: "rgba(245,242,236,.2)", overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: "linear-gradient(90deg, #E2733F, #D4562E)", borderRadius: 999, transition: "width .3s ease" }} />
          </div>
        </div>
      </div>

      <div className="rb-intake-content">
        <div style={card}>
          {error && (
            <p style={{ fontFamily: "var(--font-figtree)", fontWeight: 500, fontSize: "13px", color: "var(--rb-orange)", marginBottom: 12 }}>
              {error}
            </p>
          )}
          <StepQuestion
            step={step}
            answers={answers}
            onAnswer={commit}
            submitting={submitting}
          />
        </div>
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

function StepQuestion({
  step,
  answers,
  onAnswer,
  submitting,
}: {
  step: StepId;
  answers: IntakeAnswers;
  onAnswer: (a: IntakeAnswers) => void;
  submitting: boolean;
}) {
  switch (step) {
    case "EU_EEA_CITIZEN":
      return (
        <Choice
          q="Are you an EU/EEA citizen?"
          helpText="EU/EEA citizens don't need a student visa — just a short registration after arrival."
          options={["Yes", "No"]}
          onSelect={(v) => onAnswer({ ...answers, euEeaCitizen: v === "Yes" })}
        />
      );
    case "APPLICANT_TYPE":
      return (
        <Choice
          q="New applicant, or already in Spain and renewing/changing status?"
          options={["New applicant", "Returning or already in Spain"]}
          onSelect={(v) =>
            onAnswer({ ...answers, applicantType: v === "New applicant" ? "new" : "returning" })
          }
        />
      );
    case "RENEWAL_PERMIT_TYPE":
      return (
        <Choice
          q="What permit do you currently hold?"
          options={["Student visa (not yet exchanged)", "TIE residence card", "Other / not sure"]}
          onSelect={(v) => onAnswer({ ...answers, currentPermitType: v })}
        />
      );
    case "RENEWAL_PERMIT_EXPIRY":
      return (
        <DateQ
          q="When does it expire?"
          onSubmit={(v) => onAnswer({ ...answers, currentPermitExpiry: v })}
        />
      );
    case "NATIONALITY":
      return (
        <Choice
          q="Where are you moving from?"
          helpText="Some nationalities need extra legalization/apostille steps for documents — we'll flag anything that applies once we know your roadmap."
          options={NATIONALITIES}
          onSelect={(v) => onAnswer({ ...answers, nationality: v })}
        />
      );
    case "ACCEPTANCE_LETTER":
      return (
        <Choice
          q="Do you have your university acceptance letter yet?"
          options={["Yes", "No"]}
          onSelect={(v) => onAnswer({ ...answers, hasAcceptanceLetter: v === "Yes" })}
        />
      );
    case "FAMILY_MEMBERS":
      return (
        <Choice
          q="Will any family members (spouse/children) be accompanying you?"
          options={["Yes", "No"]}
          onSelect={(v) =>
            onAnswer({
              ...answers,
              familyMembersAccompanying: v === "Yes",
              familyMembers: v === "Yes" ? [{ relationship: "accompanying family member" }] : [],
            })
          }
        />
      );
    case "PART_TIME_WORK":
      return (
        <Choice
          q="Do you plan to work part-time while studying?"
          options={["Yes", "No"]}
          onSelect={(v) => onAnswer({ ...answers, plansPartTimeWork: v === "Yes" })}
        />
      );
    case "HOUSING":
      return (
        <Choice
          q="Do you already have housing arranged?"
          options={["Yes", "No"]}
          onSelect={(v) => onAnswer({ ...answers, hasHousingArranged: v === "Yes" })}
        />
      );
    case "ARRIVAL_DATE":
      return (
        <DateQ q="When do you arrive in Spain?" onSubmit={(v) => onAnswer({ ...answers, arrivalDate: v })} />
      );
    case "EMAIL":
      return (
        <EmailQ
          q="Where should we save your roadmap?"
          helpText="No account needed — just an email so you can return to your plan."
          submitting={submitting}
          onSubmit={(v) => onAnswer({ ...answers, email: v })}
        />
      );
    default:
      return null;
  }
}

function Choice({
  q,
  helpText,
  options,
  onSelect,
}: {
  q: string;
  helpText?: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <h2 style={heading}>{q}</h2>
      {helpText && <p style={help}>{helpText}</p>}
      <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 12 }}>
        {options.map((opt) => (
          <OptionButton key={opt} label={opt} selected={false} onClick={() => onSelect(opt)} />
        ))}
      </div>
    </div>
  );
}

function DateQ({ q, onSubmit }: { q: string; onSubmit: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <h2 style={heading}>{q}</h2>
      <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
        <input type="date" value={value} onChange={(e) => setValue(e.target.value)} style={inputStyle} />
        <NextButton disabled={!value} onClick={() => onSubmit(value)} />
      </div>
    </div>
  );
}

function EmailQ({
  q,
  helpText,
  submitting,
  onSubmit,
}: {
  q: string;
  helpText?: string;
  submitting: boolean;
  onSubmit: (v: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div>
      <h2 style={heading}>{q}</h2>
      {helpText && <p style={help}>{helpText}</p>}
      <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
        <input
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="you@email.com"
          style={inputStyle}
        />
        <NextButton disabled={!value || submitting} onClick={() => onSubmit(value)} label={submitting ? "Saving…" : "Save my email →"} />
      </div>
    </div>
  );
}

function NextButton({
  onClick,
  disabled,
  label = "Next →",
}: {
  onClick: () => void;
  disabled: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: "none",
        background: disabled ? "#C7CDD0" : "linear-gradient(135deg, #234b50 0%, var(--rb-teal) 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 14,
        padding: "0 22px",
        fontFamily: "var(--font-figtree)", fontWeight: 600, fontSize: "15px",
        cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : "0 12px 26px -14px rgba(27,58,62,.55)",
      }}
    >
      {label}
    </button>
  );
}
