import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, requirements, documents, roadmapProgress } from "@/db/schema";

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
// user's intake answers (table 2) — per CLAUDE.md, never hardcode
// nationality-specific logic here.
export async function generateRoadmap(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("User not found");
  if (!user.nationality || !user.caseType || !user.studentStatus) {
    throw new Error("User intake incomplete — cannot generate roadmap");
  }

  const visaType = VISA_TYPE_BY_CASE[user.caseType] ?? "student_visa";
  const answers = (user.intakeAnswers as Record<string, unknown>) ?? {};

  const rows = await db
    .select()
    .from(requirements)
    .where(
      and(
        eq(requirements.nationality, user.nationality),
        eq(requirements.visaType, visaType),
        eq(requirements.studentStatus, user.studentStatus),
        eq(requirements.signedOff, true)
      )
    );

  const applicable = rows.filter(
    (r) => !r.conditions?.length || r.conditions.every((c) => evalCondition(c, answers))
  );

  if (applicable.length === 0) return { documentCount: 0, stepCount: 0 };

  await db.insert(documents).values(
    applicable.map((r) => ({
      userId,
      requirementId: r.id,
      name: r.documentName,
      translationRequired: r.translationRequired,
      legalizationChain: r.legalizationChain,
      notarizationRequired: r.notarizationRequired,
    }))
  );

  await db.insert(roadmapProgress).values(
    applicable.map((r, i) => ({
      userId,
      stepKey: r.id,
      stepLabel: `Gather: ${r.documentName}`,
      position: r.sortOrder ?? i,
    }))
  );

  return { documentCount: applicable.length, stepCount: applicable.length };
}
