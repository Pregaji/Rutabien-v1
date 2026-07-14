import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getSession } from "@/lib/session";
import { hasRecentStepUp } from "@/lib/stepUp";
import { getDownloadUrl } from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Step-up verification required specifically before viewing/downloading a
  // document, even within an active session — see CLAUDE.md "Auth".
  const stepUpOk = await hasRecentStepUp(session.sessionId, "document_access");
  if (!stepUpOk) {
    return NextResponse.json({ error: "Step-up verification required" }, { status: 403 });
  }

  const { id } = await params;
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.userId)))
    .limit(1);
  if (!doc || !doc.fileRef) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const downloadUrl = await getDownloadUrl(doc.fileRef);
  return NextResponse.json({ downloadUrl });
}
