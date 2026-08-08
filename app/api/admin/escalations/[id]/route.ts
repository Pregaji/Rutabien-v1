import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { supportEscalationLog } from "@/db/schema";
import { getCurrentAdmin } from "@/lib/adminAuth";

// Marks an escalation resolved - the "flag" on a student's row (see
// /api/admin/users) clears once every one of their escalations is
// resolved, so this is the actual action behind the legal-escalation
// queue, not just a status label.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const [updated] = await db
    .update(supportEscalationLog)
    .set({ status: "resolved", resolvedAt: new Date(), resolvedBy: admin.name ?? admin.email })
    .where(eq(supportEscalationLog.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ escalation: updated });
}
