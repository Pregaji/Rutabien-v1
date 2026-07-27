"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Clock, MapPin } from "lucide-react";
import { computePath, getNextStep, type IntakeAnswers, type StepId } from "@/lib/intakeTree";
import HomeLink from "../HomeLink";
import { Button, Heading, PageShell, Text, TextInput } from "@/components/ui";

const card = { width: "100%", maxWidth: 560 } as const;

// Checkbox-row style option - a full-width list row with a square check
// indicator, not a pill grid. Matches the reference "which best describes
// you" pattern: one option per line, divider between rows.
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
      className="rb-option-row"
      style={{
        textAlign: "left",
        width: "100%",
        padding: "16px 18px",
        border: selected ? "1.5px solid var(--rb-orange)" : "1.5px solid var(--rb-border)",
        background: selected ? "rgba(212,86,46,.06)" : "#fff",
        fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "15.5px", lineHeight: "1.3",
        color: "var(--rb-text)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          flex: "none",
          borderRadius: "var(--radius-sm)",
          background: selected ? "var(--rb-orange)" : "#fff",
          border: selected ? "none" : "1.5px solid var(--rb-dashed-border)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <Check size={12} strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </button>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: 14,
  border: "1.5px solid var(--rb-border)",
  background: "#fff",
  fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "16px",
  color: "var(--rb-text)",
} as const;

const HOUSING_LINKS = [
  { label: "Idealista", url: "https://www.idealista.com/en/" },
  { label: "Fotocasa", url: "https://www.fotocasa.es/en/" },
  { label: "Badi", url: "https://badi.com/" },
  { label: "Pisos.com", url: "https://www.pisos.com/" },
  { label: "HousingAnywhere", url: "https://housinganywhere.com/" },
];

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
        // - the user reviews/confirms it, which also re-triggers submit.
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
        setError(data.error ?? "Something went wrong - please try again.");
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
      <PageShell>
        <Text weight={500} size={15} muted>
          Loading your answers…
        </Text>
      </PageShell>
    );
  }

  if (submitted) {
    return (
      <PageShell>
        <HomeLink />
        <div style={{ ...card, textAlign: "center" }}>
          <Heading>Check your inbox</Heading>
          <Text size={15} muted style={{ lineHeight: 1.5, margin: "12px 0 0" }}>
            We&apos;ve sent a link to {answers.email}. It&apos;ll take you straight to your
            roadmap - no password needed.
          </Text>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
            <Button variant="secondary" size="lg" fullWidth href="/">
              Back to homepage
            </Button>
            <Button variant="ghost" size="lg" fullWidth href="/access">
              Already have a link? Access your roadmap
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  const currentPath: StepId[] = computePath(answers).filter((s) => s !== "COMPLETE");
  const currentIndex = Math.max(0, currentPath.findIndex((s) => s === step));
  const totalSteps = currentPath.length || 1;

  return (
    <div className="rb-intake-shell">
      {/* Brand panel - desktop only (hidden below 900px), matches the
          reference two-panel onboarding: dark, illustrated, value-prop
          copy rather than a plain sidebar list. */}
      <div className="rb-intake-brand-panel">
        <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--rb-on-teal)" }}>
          Rutabien
        </Link>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Heading as="h2" size="lg" color="var(--rb-on-teal)" style={{ fontSize: 32, lineHeight: 1.2 }}>
            Every step, mapped.
          </Heading>
          <Text size={15} color="var(--rb-on-teal-soft)" style={{ lineHeight: 1.6, margin: "14px 0 0", maxWidth: 340 }}>
            A few quick questions so we can build the exact document list and visa route for your
            situation - nothing generic.
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 34, height: 34, flex: "none", borderRadius: "var(--radius-full)", background: "var(--rb-orange)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin size={16} strokeWidth={2.25} />
              </span>
              <Text size={13.5} color="var(--rb-on-teal-body)" weight={500}>
                Built with immigration lawyers practicing in Barcelona
              </Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 34, height: 34, flex: "none", borderRadius: "var(--radius-full)", background: "rgba(247,241,232,.14)", color: "var(--rb-on-teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={15} strokeWidth={1.75} />
              </span>
              <Text size={13.5} color="var(--rb-on-teal-body)" weight={500}>
                A handful of quick questions, roughly 2 minutes
              </Text>
            </div>
          </div>
        </div>
        <Text size={12} color="var(--rb-on-teal-faint)">
          No password, no account needed - just an email at the end.
        </Text>
      </div>

      <div className="rb-intake-form-panel">
        <div className="rb-intake-form-header">
          <button
            onClick={back}
            disabled={history.length === 0}
            aria-label="Back"
            style={{
              background: "none",
              border: "1.5px solid var(--rb-border)",
              borderRadius: "var(--radius-full)",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: history.length ? "pointer" : "default",
              color: "var(--rb-teal)",
              opacity: history.length ? 1 : 0.35,
            }}
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </button>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Text size={12} weight={600} muted style={{ letterSpacing: ".5px", textTransform: "uppercase" }}>
              Your roadmap
            </Text>
            <Text size={12} weight={600} muted>
              {currentIndex + 1}/{totalSteps}
            </Text>
          </div>
        </div>

        <div className="rb-intake-segments">
          {currentPath.map((s, i) => (
            <span
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: "var(--radius-full)",
                background: i <= currentIndex ? "var(--rb-orange)" : "var(--rb-border)",
                transition: "background .2s ease",
              }}
            />
          ))}
        </div>

        <div className="rb-intake-content">
          <div style={card}>
            {error && (
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "var(--rb-orange)", marginBottom: 12 }}>
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
          helpText="EU/EEA citizens don't need a student visa - just a short registration after arrival."
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
          helpText="Some nationalities need extra legalization/apostille steps for documents - we'll flag anything that applies once we know your roadmap."
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
          onSelect={(v) => onAnswer({ ...answers, familyMembersAccompanying: v === "Yes" })}
        />
      );
    case "FAMILY_DETAILS":
      return (
        <FamilyDetailsQ
          spouseIncluded={answers.spouseIncluded}
          childCount={answers.childCount ?? 0}
          onSubmit={(spouseIncluded, childCount) => onAnswer({ ...answers, spouseIncluded, childCount })}
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
          helpText="This determines your funds-formula requirement and whether we show general housing guidance."
          options={["Signed a rental", "Temporary / Airbnb", "Still looking"]}
          onSelect={(v) =>
            onAnswer({
              ...answers,
              housingStatus: v === "Signed a rental" ? "signed" : v === "Temporary / Airbnb" ? "temporary" : "still_looking",
            })
          }
        />
      );
    case "HOUSING_GUIDANCE":
      return (
        <div>
          <Heading>Before you sign anything</Heading>
          <Text size={15} muted style={{ lineHeight: 1.5, margin: "12px 0 0" }}>
            A few things worth knowing while you search - general guidance, not a referral to any
            specific listing or agency.
          </Text>
          <ul style={{ margin: "22px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <li style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--rb-text)" }}>
              Under Spanish tenant-protection law, agency/finder&apos;s fees on standard long-term
              leases are the landlord&apos;s responsibility, not yours - be wary of anyone charging
              you a percentage fee to find a place.
            </li>
            <li style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--rb-text)" }}>
              You&apos;ll need a signed rental contract (or host authorization letter) to register
              your address (empadronamiento) once you arrive - keep it on hand.
            </li>
            <li style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--rb-text)" }}>
              Never wire a deposit before seeing the place yourself or via a live video call with
              someone you trust.
            </li>
          </ul>

          <Text size={13} weight={600} color="var(--rb-text)" style={{ margin: "26px 0 10px" }}>
            A few listing sites students in Barcelona actually use
          </Text>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {HOUSING_LINKS.map((l) => (
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

          <Button
            variant="secondary"
            size="lg"
            style={{ marginTop: 28 }}
            onClick={() => onAnswer({ ...answers, sawHousingGuidance: true })}
          >
            Got it
          </Button>
        </div>
      );
    case "ARRIVAL_DATE":
      return (
        <DateQ q="When do you arrive in Spain?" onSubmit={(v) => onAnswer({ ...answers, arrivalDate: v })} />
      );
    case "EMAIL":
      return (
        <EmailQ
          q="Where should we save your roadmap?"
          helpText="No account needed - just an email so you can return to your plan."
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
      <Heading>{q}</Heading>
      {helpText && (
        <Text size={15} muted style={{ lineHeight: 1.5, margin: "12px 0 0" }}>
          {helpText}
        </Text>
      )}
      <div style={{ marginTop: 30 }}>
        {options.map((opt) => (
          <OptionButton key={opt} label={opt} selected={false} onClick={() => onSelect(opt)} />
        ))}
      </div>
    </div>
  );
}

function FamilyDetailsQ({
  spouseIncluded,
  childCount,
  onSubmit,
}: {
  spouseIncluded?: boolean;
  childCount: number;
  onSubmit: (spouseIncluded: boolean, childCount: number) => void;
}) {
  const [spouse, setSpouse] = useState(spouseIncluded ?? false);
  const [count, setCount] = useState(childCount);

  return (
    <div>
      <Heading>Tell us about your family</Heading>
      <Text size={15} muted style={{ lineHeight: 1.5, margin: "12px 0 0" }}>
        This affects your proof-of-funds requirement - Nigeria&apos;s formula, for example, adds
        75% IPREM for a first accompanying family member and 50% for each additional.
      </Text>

      <Text size={14} weight={600} color="var(--rb-text)" style={{ margin: "28px 0 10px" }}>
        Bringing a spouse or partner?
      </Text>
      <div style={{ display: "flex", gap: 12 }}>
        <OptionButton label="Yes" selected={spouse} onClick={() => setSpouse(true)} />
        <OptionButton label="No" selected={!spouse} onClick={() => setSpouse(false)} />
      </div>

      <Text size={14} weight={600} color="var(--rb-text)" style={{ margin: "26px 0 10px" }}>
        How many children are joining you?
      </Text>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", border: "1.5px solid var(--rb-border)", background: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 18, color: "var(--rb-text)", cursor: "pointer" }}
        >
          −
        </button>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--rb-text)", minWidth: 24, textAlign: "center" }}>
          {count}
        </span>
        <button
          onClick={() => setCount((c) => Math.min(6, c + 1))}
          style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", border: "1.5px solid var(--rb-border)", background: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 18, color: "var(--rb-text)", cursor: "pointer" }}
        >
          +
        </button>
      </div>

      <div style={{ marginTop: 30, display: "flex" }}>
        <Button variant="secondary" size="lg" onClick={() => onSubmit(spouse, count)}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function DateQ({ q, onSubmit }: { q: string; onSubmit: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <Heading>{q}</Heading>
      <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
        <input type="date" className="rb-date-input" value={value} onChange={(e) => setValue(e.target.value)} style={inputStyle} />
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
      <Heading>{q}</Heading>
      {helpText && (
        <Text size={15} muted style={{ lineHeight: 1.5, margin: "12px 0 0" }}>
          {helpText}
        </Text>
      )}
      <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
        <TextInput type="email" value={value} onChange={setValue} placeholder="you@email.com" style={{ width: "auto", flex: 1, padding: "16px 18px", borderRadius: "var(--radius-lg)", fontSize: 16 }} />
        <NextButton disabled={!value || submitting} onClick={() => onSubmit(value)} label={submitting ? "Saving…" : "Save my email"} />
      </div>
    </div>
  );
}

function NextButton({
  onClick,
  disabled,
  label = "Next",
}: {
  onClick: () => void;
  disabled: boolean;
  label?: string;
}) {
  return (
    <Button
      variant="secondary"
      disabled={disabled}
      style={{ flex: "none", borderRadius: "var(--radius-lg)", padding: "0 22px", fontSize: 15, height: 54 }}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
