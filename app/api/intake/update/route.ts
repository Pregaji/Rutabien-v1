import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, documents, roadmapProgress } from "@/db/schema";
import { getSession } from "@/lib/session";
import { deriveUserFields, isComplete, type IntakeAnswers } from "@/lib/intakeTree";
import { generateRoadmap } from "@/lib/roadmap";

const answersSchema = z.object({
  euEeaCitizen: z.boolean().optional(),
  applicantType: z.enum(["new", "returning"]).optional(),
  currentPermitType: z.string().optional(),
  currentPermitExpiry: z.string().optional(),
  nationality: z.string().optional(),
  hasAcceptanceLetter: z.boolean().optional(),
  familyMembersAccompanying: z.boolean().optional(),
  familyMembers: z.array(z.object({ relationship: z.string() })).optional(),
  plansPartTimeWork: z.boolean().optional(),
  hasHousingArranged: z.boolean().optional(),
  arrivalDate: z.string().optional(),
  email: z.string().trim().toLowerCase().email(),
});

// Editable intake (MVP_Draft.md section 6: "every document/answer should
// stay correctable"). Unlike /api/intake/submit, this is for an already
// signed-in user correcting their answers — no new access token/email, and
// the roadmap is regenerated from scratch against the corrected answers.
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = answersSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid intake answers" }, { status: 400 });
  const answers: IntakeAnswers = parsed.data;

  if (!isComplete(answers)) {
    return NextResponse.json(
      { error: "Intake answers are incomplete for the path taken" },
      { status: 400 }
    );
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const fields = deriveUserFields(answers);
  await db
    .update(users)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  // Regenerate the roadmap from scratch against the corrected answers —
  // stale documents/steps from the old answer set shouldn't linger.
  await db.delete(documents).where(eq(documents.userId, user.id));
  await db.delete(roadmapProgress).where(eq(roadmapProgress.userId, user.id));
  const result = await generateRoadmap(user.id);

  return NextResponse.json({ caseType: fields.caseType, ...result });
}
