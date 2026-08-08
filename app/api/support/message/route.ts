import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { supportMessages, supportEscalationLog } from "@/db/schema";
import { getSession } from "@/lib/session";
import { checkEscalation, ESCALATION_REPLY } from "@/lib/supportEscalation";
import { matchFaq } from "@/lib/supportFaq";

const PENDING_HUMAN_REPLY =
  "Thanks for the message - that's not one of our quick answers, so a member of the team will reply here shortly.";

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

  // Escalation always takes priority over the FAQ responder - a message
  // that happens to also match a nav-question pattern still routes to Ida
  // if it trips the outcome/sufficiency trigger.
  const { escalate, reason } = checkEscalation(parsed.data.text);
  const faqMatch = !escalate ? matchFaq(parsed.data.text) : null;
  const needsHumanReply = !escalate && !faqMatch;

  await db.insert(supportMessages).values({
    userId: session.userId,
    from: "user",
    text: parsed.data.text,
    needsHumanReply,
  });

  const replyText = escalate ? ESCALATION_REPLY : faqMatch ? faqMatch.answer : PENDING_HUMAN_REPLY;

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

  return NextResponse.json({ reply, escalated: escalate, needsHumanReply });
}
