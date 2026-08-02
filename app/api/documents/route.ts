import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents, users, familyMembers } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [docs, members] = await Promise.all([
    db.select().from(documents).where(eq(documents.userId, session.userId)),
    db.select().from(familyMembers).where(eq(familyMembers.userId, session.userId)),
  ]);

  return NextResponse.json({ paymentStatus: user.paymentStatus, documents: docs, familyMembers: members });
}
