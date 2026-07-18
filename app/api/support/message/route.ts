import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { supportMessages, supportEscalationLog } from "@/db/schema";
import { getSession } from "@/lib/session";
import { checkEscalation, ESCALATION_REPLY, OPERATIONAL_FALLBACK_REPLY } from "@/lib/supportEscalation";

const bodySchema = z.object({ text: z.string().trim().min(1).max(2000) });

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const messages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.userId, session.userId))
    .orderBy(asc(supportMessages.createdAt));

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });

  await db.insert(supportMessages).values({
    userId: session.userId,
    from: "user",
    text: parsed.data.text,
  });

  const { escalate, reason } = checkEscalation(parsed.data.text);
  const replyText = escalate ? ESCALATION_REPLY : OPERATIONAL_FALLBACK_REPLY;

  const [reply] = await db
    .insert(supportMessages)
    .values({ userId: session.userId, from: "team", text: replyText })
    .returning();

  if (escalate) {
    await db.insert(supportEscalationLog).values({
      userId: session.userId,
      reason: reason ?? "other",
      triggerDetail: parsed.data.text,
    });
  }

  return NextResponse.json({ reply, escalated: escalate });
}
