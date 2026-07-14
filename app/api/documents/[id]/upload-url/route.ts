import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getSession } from "@/lib/session";
import { getUploadUrl, documentObjectKey } from "@/lib/storage";

const bodySchema = z.object({ contentType: z.string().min(1) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.userId)))
    .limit(1);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const key = documentObjectKey(session.userId, doc.id);
  const uploadUrl = await getUploadUrl(key, parsed.data.contentType);

  await db
    .update(documents)
    .set({ fileRef: key, status: "uploaded", uploadedAt: new Date(), updatedAt: new Date() })
    .where(eq(documents.id, doc.id));

  return NextResponse.json({ uploadUrl });
}
