import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stepUpVerifications, users } from "@/db/schema";
import { generateStepUpCode } from "@/lib/auth";
import { sendStepUpCodeEmail } from "@/lib/email";
import { getSession } from "@/lib/session";

const STEP_UP_TTL_MINUTES = 10;

const bodySchema = z.object({
  purpose: z.string().trim().min(1).default("document_access"),
});

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const code = generateStepUpCode();
  const expiresAt = new Date(Date.now() + STEP_UP_TTL_MINUTES * 60 * 1000);

  await db.insert(stepUpVerifications).values({
    userId: user.id,
    sessionId: session.sessionId,
    code,
    purpose: parsed.data.purpose,
    expiresAt,
  });

  await sendStepUpCodeEmail({
    to: user.email,
    code,
    expiresInMinutes: STEP_UP_TTL_MINUTES,
  });

  return NextResponse.json({
    message: "Verification code sent.",
    expiresInMinutes: STEP_UP_TTL_MINUTES,
  });
}
