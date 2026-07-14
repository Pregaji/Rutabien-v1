import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { roadmapProgress } from "@/db/schema";
import { getSession } from "@/lib/session";

const bodySchema = z.object({ status: z.enum(["not_started", "in_progress", "done"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const [step] = await db
    .update(roadmapProgress)
    .set({
      status: parsed.data.status,
      completedAt: parsed.data.status === "done" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(roadmapProgress.id, id), eq(roadmapProgress.userId, session.userId)))
    .returning();

  if (!step) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(step);
}
