import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, requirements, documents, roadmapProgress, familyMembers as familyMembersTable } from "@/db/schema";
import type { FamilyMember } from "@/lib/intakeTree";
import { createFamilyMemberDocuments } from "@/lib/familyMembers";

const VISA_TYPE_BY_CASE: Record<string, string> = {
  new_student_visa: "student_visa",
  renewal: "student_visa_renewal",
  eu_registration: "eu_registration",
  pre_acceptance: "student_visa",
};

function evalCondition(
  cond: { field: string; operator: string; value: unknown },
  answers: Record<string, unknown>
): boolean {
  const actual = answers[cond.field];
  switch (cond.operator) {
    case "eq":
      return actual === cond.value;
    case "neq":
      return actual !== cond.value;
    case "lt":
      return typeof actual === "number" && actual < (cond.value as number);
    case "lte":
      return typeof actual === "number" && actual <= (cond.value as number);
    case "gt":
      return typeof actual === "number" && actual > (cond.value as number);
    case "gte":
      return typeof actual === "number" && actual >= (cond.value as number);
    default:
      return true;
  }
}

// Generates a roadmap by querying the requirements table (table 1) with the
// user's intake answers (table 2) - per CLAUDE.md, never hardcode
// nationality-specific logic here.
export async function generateRoadmap(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("User not found");
  if (!user.nationality || !user.caseType || !user.studentStatus) {
    throw new Error("User intake incomplete - cannot generate roadmap");
  }

  const visaType = VISA_TYPE_BY_CASE[user.caseType] ?? "student_visa";
  const answers = (user.intakeAnswers as Record<string, unknown>) ?? {};

  // SLU (self) rows - unchanged, scoped to this user's nationality.
  const selfRows = await db
    .select()
    .from(requirements)
    .where(
      and(
        eq(requirements.nationality, user.nationality),
        eq(requirements.visaType, visaType),
        eq(requirements.studentStatus, user.studentStatus),
        eq(requirements.appliesTo, "self"),
        eq(requirements.signedOff, true)
      )
    );

  const selfApplicable = selfRows.filter(
    (r) => !r.conditions?.length || r.conditions.every((c) => evalCondition(c, answers))
  );

  // SLF (family-member) document *types* are set by Spanish national law,
  // not per-nationality (see db/schema.ts countryProfiles comment) - so
  // these rows have nationality = null and apply to every nationality.
  // Only fetched at all when the user actually has family accompanying.
  // These are used for the roadmap CHECKLIST only (one step per type,
  // e.g. "Gather: Birth certificate (child)" regardless of child count) -
  // the actual document rows are created per named family member below,
  // via the same helper /api/family-members uses for a dependent added
  // after intake (see lib/familyMembers.ts).
  const familyMembers = (answers.familyMembers as FamilyMember[] | undefined) ?? [];
  const hasSpouse = familyMembers.some((m) => m.relationship === "spouse");
  const childCount = familyMembers.filter((m) => m.relationship === "child").length;

  let slfApplicable: (typeof selfRows)[number][] = [];
  if (hasSpouse || childCount > 0) {
    const rawSlfRows = await db
      .select()
      .from(requirements)
      .where(
        and(
          isNull(requirements.nationality),
          eq(requirements.visaType, visaType),
          eq(requirements.studentStatus, user.studentStatus),
          eq(requirements.signedOff, true)
        )
      );
    const slfRows = rawSlfRows.filter(
      (r) =>
        (r.appliesTo === "spouse" && hasSpouse) ||
        (r.appliesTo === "child" && childCount > 0)
    );
    slfApplicable = slfRows.filter(
      (r) => !r.conditions?.length || r.conditions.every((c) => evalCondition(c, answers))
    );
  }

  const applicable = [...selfApplicable, ...slfApplicable];
  if (applicable.length === 0) return { documentCount: 0, stepCount: 0 };

  // Idempotency guard (2026-08-02) - this function can legitimately run more
  // than once for the same user (edited intake answers via
  // /api/intake/update, a re-triggered /api/roadmap/generate, etc.), and
  // previously had no cleanup at all: every call blindly inserted a fresh
  // copy of every step/document on top of whatever already existed,
  // duplicating without bound (confirmed in production - one account
  // accumulated 55 roadmap sections). The fix inserts only what's missing
  // and removes what's no longer applicable, while never touching an
  // uploaded file (fileRef set) or a step's progress status/dates - editing
  // your answers should update the checklist, not erase what you'd already
  // done.
  const existingSelfDocs = await db
    .select()
    .from(documents)
    .where(and(eq(documents.userId, userId), isNull(documents.familyMemberId)));
  const existingSelfReqIds = new Set(existingSelfDocs.map((d) => d.requirementId));
  const applicableSelfReqIds = new Set(selfApplicable.map((r) => r.id));

  const staleSelfDocIds = existingSelfDocs
    .filter((d) => !d.fileRef && d.requirementId && !applicableSelfReqIds.has(d.requirementId))
    .map((d) => d.id);
  if (staleSelfDocIds.length > 0) {
    for (const id of staleSelfDocIds) {
      await db.delete(documents).where(eq(documents.id, id));
    }
  }

  const newSelfRows = selfApplicable.filter((r) => !existingSelfReqIds.has(r.id));
  if (newSelfRows.length > 0) {
    await db.insert(documents).values(
      newSelfRows.map((r) => ({
        userId,
        requirementId: r.id,
        name: r.documentName,
        translationRequired: r.translationRequired,
        legalizationChain: r.legalizationChain,
        notarizationRequired: r.notarizationRequired,
      }))
    );
  }

  // Family member rows are created by /api/intake/submit before this runs
  // (from the spouseIncluded/childCount counts) - generate each one's
  // actual documents now that the roadmap/requirements are known.
  // createFamilyMemberDocuments is itself idempotent per member (see
  // lib/familyMembers.ts), so re-running this for an existing member is safe.
  let familyDocumentCount = 0;
  if (hasSpouse || childCount > 0) {
    const members = await db.select().from(familyMembersTable).where(eq(familyMembersTable.userId, userId));
    for (const member of members) {
      familyDocumentCount += await createFamilyMemberDocuments(
        userId,
        member.id,
        member.relationship as "spouse" | "child"
      );
    }
  }

  const existingSteps = await db.select().from(roadmapProgress).where(eq(roadmapProgress.userId, userId));
  const existingStepKeys = new Set(existingSteps.map((s) => s.stepKey));
  const applicableStepKeys = new Set(applicable.map((r) => r.id));

  const staleStepIds = existingSteps.filter((s) => !applicableStepKeys.has(s.stepKey)).map((s) => s.id);
  if (staleStepIds.length > 0) {
    for (const id of staleStepIds) {
      await db.delete(roadmapProgress).where(eq(roadmapProgress.id, id));
    }
  }

  const newSteps = applicable.filter((r) => !existingStepKeys.has(r.id));
  if (newSteps.length > 0) {
    await db.insert(roadmapProgress).values(
      newSteps.map((r, i) => ({
        userId,
        stepKey: r.id,
        stepLabel: `Gather: ${r.documentName}`,
        phase: r.phase,
        position: r.sortOrder ?? i,
      }))
    );
  }

  return {
    documentCount: newSelfRows.length + familyDocumentCount,
    stepCount: newSteps.length,
  };
}
