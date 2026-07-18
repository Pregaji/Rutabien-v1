import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, roadmapProgress, documents, requirements } from "@/db/schema";
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

  // Left-joined with requirements for detail that isn't snapshotted onto
  // documents (official source link, lawyer-relevant fields) — safe to read
  // live since it's display-only, not requirement rules already locked in
  // at generation time.
  const docs = await db
    .select({
      id: documents.id,
      requirementId: documents.requirementId,
      name: documents.name,
      status: documents.status,
      translationRequired: documents.translationRequired,
      legalizationChain: documents.legalizationChain,
      notarizationRequired: documents.notarizationRequired,
      validityWindowDays: requirements.validityWindowDays,
      officialSourceLink: requirements.officialSourceLink,
    })
    .from(documents)
    .leftJoin(requirements, eq(documents.requirementId, requirements.id))
    .where(eq(documents.userId, session.userId));

  return NextResponse.json({
    paymentStatus: user.paymentStatus,
    caseType: user.caseType,
    nationality: user.nationality,
    arrivalDate: user.arrivalDate,
    steps,
    documents: docs,
  });
}
