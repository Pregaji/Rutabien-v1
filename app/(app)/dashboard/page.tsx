"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Sparkles, MessageCircle, Scale, Sprout } from "lucide-react";
import { Button, Card, Heading, PageShell, Text } from "@/components/ui";

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
};

type RoadmapData = {
  paymentStatus: "unpaid" | "essential" | "complete";
  nationality: string | null;
  arrivalDate: string | null;
  steps: Step[];
  documents: Doc[];
};

const STEP_ROUTE = "/roadmap";

export default function DashboardPage() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);

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

  if (!data) {
    return (
      <PageShell style={{ textAlign: "center" }}>
        <Text weight={500} size={15}>
          You need to access your roadmap first.
        </Text>
      </PageShell>
    );
  }

  const unlocked = data.paymentStatus !== "unpaid";
  const doneCount = data.steps.filter((s) => s.status === "done").length;
  const totalSteps = data.steps.length;
  const docsGrandTotal = data.documents.length;
  const docsDoneTotal = data.documents.filter((d) => d.status !== "needed").length;
  const firstUndone = data.steps.find((s) => s.status !== "done");

  const arrivalLabel = data.arrivalDate
    ? new Date(data.arrivalDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "Not set";
  const planLabel = data.paymentStatus === "unpaid" ? "Not unlocked" : data.paymentStatus === "essential" ? "Essential" : "Complete";

  const summarySegments = [
    { icon: MapPin, label: "From", value: data.nationality ?? "Not set" },
    { icon: MapPin, label: "To", value: "Barcelona, Spain" },
    { icon: CalendarDays, label: "Arrival", value: arrivalLabel },
    { icon: Sparkles, label: "Plan", value: planLabel },
  ];

  const checklistItems = [
    {
      n: 1,
      title: "Build your roadmap",
      desc: "Based on your nationality and situation.",
      detail: "We generated your document list and visa route from your intake answers - nationality, program, and dates. This part is already done.",
      done: true,
    },
    {
      n: 2,
      title: "Attach your documents",
      desc: `${docsGrandTotal} documents needed · ${docsDoneTotal} marked ready`,
      detail: `Upload each document from your roadmap into the Document Vault as you gather it. ${docsGrandTotal} document${docsGrandTotal === 1 ? "" : "s"} needed in total, ${docsDoneTotal} marked ready so far.`,
      done: docsGrandTotal > 0 && docsDoneTotal === docsGrandTotal,
      actionLabel: "Go to Documents",
      href: "/documents",
    },
    {
      n: 3,
      title: "Unlock your full roadmap",
      desc: unlocked ? `${data.paymentStatus} plan active` : "Full step detail, tracking, and reminders.",
      detail: unlocked
        ? `Your ${data.paymentStatus} plan is active - full step-by-step detail, document tracking, and deadline reminders are all unlocked.`
        : "Unlock full step-by-step detail for every roadmap item, document tracking, and deadline reminders. One-time payment, from €39.",
      done: unlocked,
      actionLabel: "See plans - from €39",
      href: "/paywall",
    },
    {
      n: 4,
      title: "Talk to a lawyer",
      desc: "Optional - only if you have questions about your case.",
      detail: "Optional, and only for steps with real case-specific complexity. Book a 30-minute consult with Rutabien's legal partner whenever you'd like a second opinion.",
      done: false,
      optional: true,
      actionLabel: "Book a consult",
      href: "/lawyer",
    },
  ];
  const activeItem = checklistItems[selected] ?? checklistItems[0];

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 48px 96px" }}>
      <Text size={13} weight={600} color="var(--rb-orange)" style={{ letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>
        Welcome back
      </Text>
      <Heading size="xl" style={{ margin: "12px 0 0" }}>
        Here&apos;s where things stand.
      </Heading>

      {/* Trip.com-style segmented summary bar - a read-only recap of the
          intake answers that generated this roadmap, not an editable
          search form. "Edit my answers" on the roadmap page is still the
          real way to change any of this. */}
      <div
        className="rb-summary-bar"
        style={{
          display: "flex",
          alignItems: "stretch",
          marginTop: 20,
          background: "#fff",
          border: "1px solid var(--rb-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {summarySegments.map((s, i) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 20px",
              borderLeft: i > 0 ? "1px solid var(--rb-border)" : "none",
              minWidth: 0,
            }}
          >
            <span style={{ flex: "none", color: "var(--rb-orange)" }}>
              <s.icon size={16} strokeWidth={1.75} />
            </span>
            <div style={{ minWidth: 0 }}>
              <Text size={11} weight={600} muted style={{ letterSpacing: ".3px", textTransform: "uppercase" }}>
                {s.label}
              </Text>
              <Text
                size={14}
                weight={600}
                color="var(--rb-text)"
                style={{ marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {s.value}
              </Text>
            </div>
            {i === 0 && (
              <span style={{ flex: "none", color: "var(--rb-text-muted)", marginLeft: "auto" }}>
                <ArrowRight size={15} strokeWidth={1.75} />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Primary CTA - the single most important thing on this page, so it
          leads immediately after the header instead of competing with the
          checklist and tile grid for attention further down. */}
      {firstUndone ? (
        <Card
          onClick={() => (window.location.href = STEP_ROUTE)}
          style={{ background: "rgba(212,86,46,.08)", border: "1.5px solid rgba(212,86,46,.3)", boxShadow: "none", padding: "26px 32px", marginTop: 28 }}
        >
          <Text size={11} weight={600} color="var(--rb-orange)" style={{ letterSpacing: ".5px", textTransform: "uppercase" }}>
            Next up
          </Text>
          <Heading as="h3" size="md" style={{ margin: "8px 0 6px" }}>
            {firstUndone.stepLabel}
          </Heading>
          <Text size={14.5} style={{ lineHeight: 1.55, maxWidth: 640 }}>
            This is the next step on your roadmap.
          </Text>
          <Text size={14} weight={600} color="var(--rb-teal)" style={{ marginTop: 14 }}>
            View in roadmap
          </Text>
        </Card>
      ) : (
        <Card style={{ background: "rgba(27,58,62,.08)", border: "1.5px solid rgba(27,58,62,.25)", boxShadow: "none", padding: "26px 32px", marginTop: 28 }}>
          <Heading as="h3" size="md" style={{ margin: "0 0 6px" }}>
            You&apos;re all set
          </Heading>
          <Text size={14.5} style={{ lineHeight: 1.55 }}>
            Every step on your roadmap is marked done. Check back before your renewal window opens.
          </Text>
        </Card>
      )}

      {/* Quick links - same icon-circle / title / description pattern on
          every tile, including the lawyer one (previously the odd one out
          with a name-and-avatar row instead of matching the rest). */}
      <div className="rb-dash-tiles" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginTop: 22 }}>
        <Card onClick={() => (window.location.href = "/roadmap")}>
          <span style={{ width: 38, height: 38, borderRadius: "var(--radius-full)", background: "var(--rb-teal)", color: "var(--rb-on-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>
            {totalSteps}
          </span>
          <Heading as="h4" size="sm" style={{ fontSize: 17, margin: "16px 0 4px" }}>
            Full roadmap
          </Heading>
          <Text size={13.5} muted>
            {doneCount} of {totalSteps} steps done
          </Text>
        </Card>
        <Card onClick={() => (window.location.href = "/documents")}>
          <span style={{ width: 38, height: 38, borderRadius: "var(--radius-full)", border: "2px solid var(--rb-orange)", color: "var(--rb-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>
            ✓
          </span>
          <Heading as="h4" size="sm" style={{ fontSize: 17, margin: "16px 0 4px" }}>
            Documents
          </Heading>
          <Text size={13.5} muted>
            {docsDoneTotal} of {docsGrandTotal} ready
          </Text>
        </Card>
        <Card onClick={() => (window.location.href = "/lawyer")}>
          <span style={{ width: 38, height: 38, borderRadius: "var(--radius-full)", border: "2px solid var(--rb-orange)", color: "var(--rb-orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Scale size={16} strokeWidth={1.75} />
          </span>
          <Heading as="h4" size="sm" style={{ fontSize: 17, margin: "16px 0 4px" }}>
            Talk to a lawyer
          </Heading>
          <Text size={13.5} muted>
            Book a 30-min consult with Ida, only if you&apos;d like.
          </Text>
        </Card>
        <Card onClick={() => (window.location.href = "/live-support")}>
          <span style={{ width: 38, height: 38, borderRadius: "var(--radius-full)", border: "2px solid var(--rb-orange)", color: "var(--rb-orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageCircle size={16} strokeWidth={1.75} />
          </span>
          <Heading as="h4" size="sm" style={{ fontSize: 17, margin: "16px 0 4px" }}>
            Live support
          </Heading>
          <Text size={13.5} muted>
            {unlocked
              ? "Navigation and document questions - legal judgment goes to Ida."
              : "Included with the Complete plan."}
          </Text>
        </Card>
        <Card onClick={() => (window.location.href = "/bienvenido")}>
          <span style={{ width: 38, height: 38, borderRadius: "var(--radius-full)", border: "2px solid var(--rb-orange)", color: "var(--rb-orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sprout size={16} strokeWidth={1.75} />
          </span>
          <Heading as="h4" size="sm" style={{ fontSize: 17, margin: "16px 0 4px" }}>
            Bienvenido guide
          </Heading>
          <Text size={13.5} muted>
            {data.paymentStatus === "complete" ? "Settling in - language, culture, everyday life." : "Included with the Complete plan."}
          </Text>
        </Card>
      </div>

      {/* Getting-started checklist - useful for onboarding, but secondary
          once there's a real "next up" step and quick links above it. */}
      <Card style={{ padding: 0, marginTop: 34, overflow: "hidden", display: "flex", maxWidth: 800 }} className="rb-getting-started">
        <div className="rb-getting-started-nav" style={{ flex: "0 0 300px", borderRight: "1px solid rgba(34,48,60,.08)", background: "var(--rb-bg)" }}>
          <div style={{ padding: "20px 22px 14px" }}>
            <Text size={15} weight={600} color="var(--rb-text)">
              Getting started
            </Text>
            <Text size={12.5} muted style={{ marginTop: 3 }}>
              {doneCount} of {totalSteps} roadmap steps done · ~5 min
            </Text>
          </div>
          {checklistItems.map((item, i) => {
            const isSelected = i === selected;
            return (
              <button
                key={item.n}
                onClick={() => setSelected(i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 22px",
                  background: isSelected ? "rgba(212,86,46,.08)" : "transparent",
                  borderLeft: isSelected ? "3px solid var(--rb-orange)" : "3px solid transparent",
                  border: "none",
                  borderLeftWidth: 3,
                  cursor: "pointer",
                }}
              >
                <span
                  style={
                    item.done
                      ? { width: 26, height: 26, flex: "none", borderRadius: "var(--radius-full)", background: "var(--rb-teal)", color: "var(--rb-on-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12 }
                      : { width: 26, height: 26, flex: "none", borderRadius: "var(--radius-full)", border: `2px solid ${item.optional ? "var(--rb-dashed-border)" : "var(--rb-orange)"}`, color: item.optional ? "var(--rb-text-muted)" : "var(--rb-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12 }
                  }
                >
                  {item.done ? "✓" : item.n}
                </span>
                <Text size={13.5} weight={isSelected ? 600 : 500} color={isSelected ? "var(--rb-text)" : "var(--rb-text-secondary)"}>
                  {item.title}
                </Text>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, padding: "32px 36px", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <span
            style={
              activeItem.done
                ? { width: 44, height: 44, borderRadius: "var(--radius-full)", background: "var(--rb-teal)", color: "var(--rb-on-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 17 }
                : { width: 44, height: 44, borderRadius: "var(--radius-full)", border: `2px solid ${activeItem.optional ? "var(--rb-dashed-border)" : "var(--rb-orange)"}`, color: activeItem.optional ? "var(--rb-text-muted)" : "var(--rb-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17 }
            }
          >
            {activeItem.done ? "✓" : activeItem.n}
          </span>
          <Heading as="h3" size="md" style={{ margin: "18px 0 0" }}>
            {activeItem.title}
          </Heading>
          <Text size={14.5} style={{ lineHeight: 1.6, margin: "10px 0 0" }}>
            {activeItem.detail}
          </Text>
          <div style={{ marginTop: 24 }}>
            {activeItem.done ? (
              <Text size={13} weight={600} color="var(--rb-teal)">
                Done
              </Text>
            ) : (
              activeItem.actionLabel && (
                <Button variant="secondary" style={{ padding: "12px 22px", fontSize: 14 }} href={activeItem.href}>
                  {activeItem.actionLabel}
                </Button>
              )
            )}
          </div>
          <Text size={12} muted style={{ marginTop: "auto", paddingTop: 20 }}>
            We&apos;ll email you before deadlines and if a document needs attention - no need to keep checking back.
          </Text>
        </div>
      </Card>
    </div>
  );
}
