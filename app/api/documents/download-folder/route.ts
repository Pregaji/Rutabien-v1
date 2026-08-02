import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import JSZip from "jszip";
import { db } from "@/db";
import { documents, familyMembers, users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { hasRecentStepUp } from "@/lib/stepUp";
import { getObjectBytes } from "@/lib/storage";
import { rateLimit } from "@/lib/rateLimit";

const bodySchema = z.object({ familyMemberId: z.string().uuid().nullable() });

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/heic": ".heic",
  "image/webp": ".webp",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9 _.-]/gi, "").trim() || "document";
}

// Bundles every uploaded file in one folder (the user's own documents, or
// one family member's) into a single zip - each original stays intact and
// individually extractable inside it, so this doesn't cross the "never
// merge into one PDF" line in CLAUDE.md (that rule is about combining
// document *contents*, not packaging separate files for convenient
// transfer). Document Vault is a Complete plan feature; this endpoint
// inherits that same gate plus the usual step-up requirement.
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const stepUpOk = await hasRecentStepUp(session.sessionId, "document_access");
  if (!stepUpOk) {
    return NextResponse.json({ error: "Step-up verification required" }, { status: 403 });
  }

  const limited = rateLimit(`download-folder:${session.sessionId}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many downloads. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user || user.paymentStatus !== "complete") {
    return NextResponse.json({ error: "Document Vault is a Complete plan feature." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { familyMemberId } = parsed.data;

  let folderLabel = "My documents";
  if (familyMemberId) {
    const [member] = await db
      .select()
      .from(familyMembers)
      .where(and(eq(familyMembers.id, familyMemberId), eq(familyMembers.userId, session.userId)))
      .limit(1);
    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
    folderLabel = member.name;
  }

  const docs = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.userId, session.userId),
        familyMemberId ? eq(documents.familyMemberId, familyMemberId) : isNull(documents.familyMemberId)
      )
    );

  const uploaded = docs.filter((d) => d.fileRef);
  if (uploaded.length === 0) {
    return NextResponse.json({ error: "No uploaded documents in this folder yet." }, { status: 400 });
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();
  for (const doc of uploaded) {
    const { bytes, contentType } = await getObjectBytes(doc.fileRef!);
    const ext = (contentType && EXTENSION_BY_CONTENT_TYPE[contentType]) ?? "";
    let filename = `${sanitizeFilename(doc.name)}${ext}`;
    let suffix = 2;
    while (usedNames.has(filename)) {
      filename = `${sanitizeFilename(doc.name)} (${suffix})${ext}`;
      suffix += 1;
    }
    usedNames.add(filename);
    zip.file(filename, bytes);
  }

  const zipBytes = await zip.generateAsync({ type: "arraybuffer" });
  return new NextResponse(new Blob([zipBytes]), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(folderLabel)}.zip"`,
    },
  });
}
