import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, accessTokens } from "@/db/schema";
import { generateAccessToken } from "@/lib/auth";
import { sendAccessLinkEmail } from "@/lib/email";
import { deriveUserFields, isComplete } from "@/lib/intakeTree";

const ACCESS_TOKEN_TTL_MINUTES = 20;

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

// The moment someone submits the intake questionnaire, create (or update,
// for a re-submitted/corrected intake) a user record server-side — keyed by
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

  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MINUTES * 60 * 1000);
  await db.insert(accessTokens).values({ userId: user.id, token, expiresAt });

  const accessUrl = `${process.env.APP_URL}/auth/verify?token=${token}`;
  await sendAccessLinkEmail({
    to: user.email,
    accessUrl,
    expiresInMinutes: ACCESS_TOKEN_TTL_MINUTES,
  });

  return NextResponse.json({
    caseType: fields.caseType,
    message: "Roadmap started — check your email for a link to access it.",
  });
}
