import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { requirements, documents, countryProfiles, familyMembers, users } from "@/db/schema";

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

// Creates this one family member's applicable SLF documents - shared by
// generateRoadmap (bulk, from intake counts) and POST /api/family-members
// (a single dependent added after the fact), so both paths produce
// identical results. See db/schema.ts familyMembers comment.
export async function createFamilyMemberDocuments(
  userId: string,
  familyMemberId: string,
  relationship: "spouse" | "child"
): Promise<number> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || !user.caseType || !user.studentStatus) return 0;

  const visaType = VISA_TYPE_BY_CASE[user.caseType] ?? "student_visa";
  const answers = (user.intakeAnswers as Record<string, unknown>) ?? {};

  const rawSlfRows = await db
    .select()
    .from(requirements)
    .where(
      and(
        isNull(requirements.nationality),
        eq(requirements.visaType, visaType),
        eq(requirements.studentStatus, user.studentStatus),
        eq(requirements.appliesTo, relationship),
        eq(requirements.signedOff, true)
      )
    );

  let slfRows = rawSlfRows.filter(
    (r) => !r.conditions?.length || r.conditions.every((c) => evalCondition(c, answers))
  );

  // Same Hague Apostille override as the self-document path (lib/roadmap.ts).
  if (slfRows.length > 0 && user.nationality) {
    const [profile] = await db
      .select()
      .from(countryProfiles)
      .where(eq(countryProfiles.nationality, user.nationality))
      .limit(1);
    if (profile?.signedOff && profile.isHagueApostilleSignatory === true) {
      slfRows = slfRows.map((r) => ({ ...r, legalizationChain: "Apostille" }));
    }
  }

  if (slfRows.length === 0) return 0;

  // Idempotent per (familyMemberId, requirementId) - generateRoadmap calls
  // this again for every existing member on every regeneration (edited
  // intake answers, etc.), so without this check re-running it would
  // duplicate each member's documents every time (see lib/roadmap.ts).
  const existing = await db
    .select({ requirementId: documents.requirementId })
    .from(documents)
    .where(eq(documents.familyMemberId, familyMemberId));
  const existingReqIds = new Set(existing.map((d) => d.requirementId));
  const newRows = slfRows.filter((r) => !existingReqIds.has(r.id));
  if (newRows.length === 0) return 0;

  await db.insert(documents).values(
    newRows.map((r) => ({
      userId,
      requirementId: r.id,
      familyMemberId,
      name: r.documentName,
      translationRequired: r.translationRequired,
      legalizationChain: r.legalizationChain,
      notarizationRequired: r.notarizationRequired,
    }))
  );

  return newRows.length;
}

export async function createFamilyMember(
  userId: string,
  name: string,
  relationship: "spouse" | "child"
): Promise<{ id: string; documentCount: number }> {
  const [member] = await db.insert(familyMembers).values({ userId, name, relationship }).returning();
  const documentCount = await createFamilyMemberDocuments(userId, member.id, relationship);
  return { id: member.id, documentCount };
}
