import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getSession } from "@/lib/session";
import { deleteObject } from "@/lib/storage";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.userId)))
    .limit(1);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (doc.fileRef) await deleteObject(doc.fileRef);

  await db
    .update(documents)
    .set({ fileRef: null, status: "needed", uploadedAt: null, updatedAt: new Date() })
    .where(eq(documents.id, doc.id));

  return NextResponse.json({ ok: true });
}
