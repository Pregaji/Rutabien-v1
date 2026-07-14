import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, roadmapProgress, documents } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const steps = await db
    .select()
    .from(roadmapProgress)
    .where(eq(roadmapProgress.userId, session.userId))
    .orderBy(asc(roadmapProgress.position));

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, session.userId));

  return NextResponse.json({
    paymentStatus: user.paymentStatus,
    caseType: user.caseType,
    nationality: user.nationality,
    steps,
    documents: docs,
  });
}
