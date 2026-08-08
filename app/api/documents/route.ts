import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents, users, familyMembers, requirements } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [rows, members] = await Promise.all([
    db
      .select({
        id: documents.id,
        requirementId: documents.requirementId,
        familyMemberId: documents.familyMemberId,
        name: documents.name,
        status: documents.status,
        fileRef: documents.fileRef,
        validityExpiryDate: documents.validityExpiryDate,
        translationRequired: documents.translationRequired,
        notarizationRequired: documents.notarizationRequired,
        translationOrderId: documents.translationOrderId,
        // Left join since requirementId can go null (onDelete: "set null")
        // if the authored requirement row is ever removed - a document a
        // user already has shouldn't just vanish from the page.
        category: requirements.category,
      })
      .from(documents)
      .leftJoin(requirements, eq(documents.requirementId, requirements.id))
      .where(eq(documents.userId, session.userId)),
    db.select().from(familyMembers).where(eq(familyMembers.userId, session.userId)),
  ]);

  return NextResponse.json({ paymentStatus: user.paymentStatus, documents: rows, familyMembers: members });
}
