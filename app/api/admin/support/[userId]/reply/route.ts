import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { supportMessages } from "@/db/schema";
import { getCurrentAdmin } from "@/lib/adminAuth";

const bodySchema = z.object({ text: z.string().trim().min(1).max(2000) });

// A real human reply to a thread the FAQ responder couldn't answer (see
// needsHumanReply on supportMessages / lib/supportFaq.ts). Clears every open
// row for this user, same "resolve" pattern as /api/admin/escalations/[id].
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { userId } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });

  const [reply] = await db
    .insert(supportMessages)
    .values({ userId, from: "team", text: parsed.data.text })
    .returning();

  await db
    .update(supportMessages)
    .set({ needsHumanReply: false })
    .where(and(eq(supportMessages.userId, userId), eq(supportMessages.needsHumanReply, true)));

  return NextResponse.json({ reply });
}
