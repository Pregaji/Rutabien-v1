import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/adminAuth";
import { db } from "@/db";
import { users, roadmapProgress, documents, familyMembers, supportEscalationLog } from "@/db/schema";
import { Chip, Heading, Text } from "@/components/ui";
import type { ChipTone } from "@/components/ui/Chip";
import AdminLogoutButton from "../../AdminLogoutButton";
import ResolveEscalationButton from "./ResolveEscalationButton";

const PAYMENT_TONE: Record<string, ChipTone> = {
  complete: "orange",
  essential: "teal",
  unpaid: "neutral",
};

const STEP_STATUS_TONE: Record<string, ChipTone> = {
  done: "teal",
  in_progress: "orange",
  not_started: "neutral",
};

const DOC_STATUS_TONE: Record<string, ChipTone> = {
  verified: "teal",
  uploaded: "orange",
  needed: "neutral",
};

function formatDate(d: Date | string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const [student] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!student) notFound();

  const [steps, docs, members, escalations] = await Promise.all([
    db.select().from(roadmapProgress).where(eq(roadmapProgress.userId, id)).orderBy(roadmapProgress.position),
    db.select().from(documents).where(eq(documents.userId, id)),
    db.select().from(familyMembers).where(eq(familyMembers.userId, id)),
    db.select().from(supportEscalationLog).where(eq(supportEscalationLog.userId, id)).orderBy(desc(supportEscalationLog.escalatedAt)),
  ]);

  const memberById = new Map(members.map((m) => [m.id, m]));
  const doneSteps = steps.filter((s) => s.status === "done").length;
  const progress = steps.length ? Math.round((doneSteps / steps.length) * 100) : 0;
  const outstandingDocs = docs.filter((d) => d.status === "needed").length;
  const name = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email;
  const openEscalations = escalations.filter((e) => e.status !== "resolved");

  return (
    <div style={{ minHeight: "100vh", background: "var(--rb-table-header-bg)" }}>
      <div style={{ background: "var(--rb-text)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#fff" }}>Rutabien Admin</span>
          <AdminLogoutButton />
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "36px 40px 80px" }}>
        <Link href="/admin" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--rb-text-secondary)" }}>
          ‹ All students
        </Link>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
          <div>
            <Heading size="md" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 24 }}>
              {name}
            </Heading>
            <Text size={13.5} muted style={{ marginTop: 4 }}>
              {student.email}
            </Text>
          </div>
          <Chip tone={PAYMENT_TONE[student.paymentStatus]} style={{ fontSize: 13, padding: "6px 14px" }}>
            {student.paymentStatus}
          </Chip>
        </div>

        {/* Key facts - the fields explicitly named in the handoff (nationality,
            case type, progress %, payment tier, docs outstanding, flagged). */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 1,
            marginTop: 22,
            background: "var(--rb-table-row-border)",
            border: "1px solid var(--rb-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          {[
            { label: "Nationality", value: student.nationality ?? "-" },
            { label: "Case type", value: student.caseType ?? "-" },
            { label: "Progress", value: `${progress}% (${doneSteps}/${steps.length})` },
            { label: "Docs outstanding", value: String(outstandingDocs) },
            { label: "Arrival date", value: formatDate(student.arrivalDate) },
            { label: "Joined", value: formatDate(student.createdAt) },
            { label: "Last active", value: formatDate(student.lastActiveAt) },
            { label: "Family members", value: members.length ? members.map((m) => m.relationship).join(", ") : "None" },
          ].map((f) => (
            <div key={f.label} style={{ background: "#fff", padding: "14px 18px" }}>
              <Text size={11} weight={600} muted style={{ letterSpacing: ".3px", textTransform: "uppercase" }}>
                {f.label}
              </Text>
              <Text size={14} weight={500} color="var(--rb-text)" style={{ marginTop: 4 }}>
                {f.value}
              </Text>
            </div>
          ))}
        </div>

        {/* Legal-escalation queue - the actual point of the "flag" on the
            list page. Open ones lead; resolved ones stay visible below as
            an audit trail rather than disappearing. */}
        <Heading as="h2" size="sm" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 17, marginTop: 34 }}>
          Escalations {openEscalations.length > 0 && `(${openEscalations.length} open)`}
        </Heading>
        {escalations.length === 0 ? (
          <Text size={13.5} muted style={{ marginTop: 8 }}>
            None on record.
          </Text>
        ) : (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {escalations.map((e) => (
              <div
                key={e.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${e.status === "resolved" ? "var(--rb-border)" : "rgba(212,86,46,.35)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Chip tone={e.status === "resolved" ? "neutral" : "orange"} style={{ fontSize: 11 }}>
                      {e.status.replace("_", " ")}
                    </Chip>
                    <Text size={13.5} weight={600} color="var(--rb-text)" style={{ textTransform: "capitalize" }}>
                      {e.reason.replace(/_/g, " ")}
                    </Text>
                  </div>
                  {e.triggerDetail && (
                    <Text size={13} muted style={{ marginTop: 6, maxWidth: 520 }}>
                      {e.triggerDetail}
                    </Text>
                  )}
                  <Text size={12} muted style={{ marginTop: 6 }}>
                    Escalated {formatDate(e.escalatedAt)}
                    {e.resolvedAt && ` · Resolved ${formatDate(e.resolvedAt)} by ${e.resolvedBy ?? "-"}`}
                  </Text>
                </div>
                {e.status !== "resolved" && <ResolveEscalationButton escalationId={e.id} />}
              </div>
            ))}
          </div>
        )}

        {/* Roadmap */}
        <Heading as="h2" size="sm" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 17, marginTop: 34 }}>
          Roadmap ({doneSteps}/{steps.length} done)
        </Heading>
        {steps.length === 0 ? (
          <Text size={13.5} muted style={{ marginTop: 8 }}>
            No roadmap generated yet.
          </Text>
        ) : (
          <div style={{ marginTop: 12, background: "#fff", border: "1px solid var(--rb-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {steps.map((s, i) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 18px",
                  borderTop: i > 0 ? "1px solid var(--rb-table-row-border)" : "none",
                }}
              >
                <Text size={13.5} color="var(--rb-text)">
                  {s.stepLabel}
                </Text>
                <Chip tone={STEP_STATUS_TONE[s.status]} style={{ fontSize: 11 }}>
                  {s.status.replace("_", " ")}
                </Chip>
              </div>
            ))}
          </div>
        )}

        {/* Documents */}
        <Heading as="h2" size="sm" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 17, marginTop: 34 }}>
          Documents ({docs.length - outstandingDocs}/{docs.length} ready)
        </Heading>
        {docs.length === 0 ? (
          <Text size={13.5} muted style={{ marginTop: 8 }}>
            No documents yet.
          </Text>
        ) : (
          <div style={{ marginTop: 12, background: "#fff", border: "1px solid var(--rb-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {docs.map((d, i) => {
              const owner = d.familyMemberId ? memberById.get(d.familyMemberId) : null;
              return (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 18px",
                    borderTop: i > 0 ? "1px solid var(--rb-table-row-border)" : "none",
                  }}
                >
                  <div>
                    <Text size={13.5} color="var(--rb-text)">
                      {d.name}
                    </Text>
                    {owner && (
                      <Text size={11.5} muted style={{ textTransform: "capitalize" }}>
                        {owner.name} · {owner.relationship}
                      </Text>
                    )}
                  </div>
                  <Chip tone={DOC_STATUS_TONE[d.status]} style={{ fontSize: 11 }}>
                    {d.status}
                  </Chip>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
