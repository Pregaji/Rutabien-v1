import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { stepUpVerifications } from "@/db/schema";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  code: z.string().trim().length(6),
  purpose: z.string().trim().min(1).default("document_access"),
});

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  const { code, purpose } = parsed.data;

  const [verification] = await db
    .select()
    .from(stepUpVerifications)
    .where(
      and(
        eq(stepUpVerifications.sessionId, session.sessionId),
        eq(stepUpVerifications.code, code),
        eq(stepUpVerifications.purpose, purpose),
        isNull(stepUpVerifications.usedAt),
        gt(stepUpVerifications.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!verification) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  await db
    .update(stepUpVerifications)
    .set({ usedAt: new Date() })
    .where(eq(stepUpVerifications.id, verification.id));

  return NextResponse.json({ ok: true });
}
