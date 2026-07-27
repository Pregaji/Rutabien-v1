import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, accessTokens } from "@/db/schema";
import { generateAccessToken } from "@/lib/auth";
import { sendAccessLinkEmail } from "@/lib/email";
import { deriveUserFields, isComplete } from "@/lib/intakeTree";
import { generateRoadmap } from "@/lib/roadmap";

const ACCESS_TOKEN_TTL_MINUTES = 20;

const answersSchema = z.object({
  euEeaCitizen: z.boolean().optional(),
  applicantType: z.enum(["new", "returning"]).optional(),
  currentPermitType: z.string().optional(),
  currentPermitExpiry: z.string().optional(),
  nationality: z.string().optional(),
  hasAcceptanceLetter: z.boolean().optional(),
  familyMembersAccompanying: z.boolean().optional(),
  spouseIncluded: z.boolean().optional(),
  childCount: z.number().int().min(0).max(10).optional(),
  familyMembers: z.array(z.object({ relationship: z.enum(["spouse", "child"]) })).optional(),
  plansPartTimeWork: z.boolean().optional(),
  housingStatus: z.enum(["signed", "temporary", "still_looking"]).optional(),
  sawHousingGuidance: z.boolean().optional(),
  arrivalDate: z.string().optional(),
  email: z.string().trim().toLowerCase().email(),
});

// The moment someone submits the intake questionnaire, create (or update,
// for a re-submitted/corrected intake) a user record server-side - keyed by
// email, storing their answers, case type, and issuing an access token.
// See MVP_Draft.md section 7, point 1.
export async function POST(req: NextRequest) {
  const parsed = answersSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid intake answers" }, { status: 400 });
  }
  const answers = parsed.data;

  if (!isComplete(answers)) {
    return NextResponse.json(
      { error: "Intake answers are incomplete for the path taken" },
      { status: 400 }
    );
  }

  const fields = deriveUserFields(answers);

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, answers.email))
    .limit(1);

  const values = { email: answers.email, ...fields, updatedAt: new Date() };

  const [user] = existing
    ? await db.update(users).set(values).where(eq(users.id, existing.id)).returning()
    : await db.insert(users).values(values).returning();

  // Only the two branches with a real visa roadmap generate one - EU/EEA
  // citizens and pre-acceptance applicants land on their own dedicated
  // screens instead (see redirectPath below) and never had a roadmap to
  // begin with. This was previously only wired up on /api/intake/update
  // (editing existing answers), so first-time submissions never generated
  // a roadmap at all.
  if (fields.caseType === "new_student_visa" || fields.caseType === "renewal") {
    await generateRoadmap(user.id);
  }

  // EU/EEA and pre-acceptance cases land on a dedicated lightweight screen
  // instead of the standard dashboard - there's no visa roadmap to show yet
  // (or ever, for the EU/EEA case).
  const redirectPath =
    fields.caseType === "eu_registration"
      ? "/eu-route"
      : fields.caseType === "pre_acceptance"
        ? "/before-apply"
        : undefined;

  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MINUTES * 60 * 1000);
  await db.insert(accessTokens).values({ userId: user.id, token, expiresAt, redirectPath });

  const accessUrl = `${process.env.APP_URL}/api/auth/verify?token=${token}`;
  await sendAccessLinkEmail({
    to: user.email,
    accessUrl,
    expiresInMinutes: ACCESS_TOKEN_TTL_MINUTES,
  });

  return NextResponse.json({
    caseType: fields.caseType,
    message: "Roadmap started - check your email for a link to access it.",
  });
}
