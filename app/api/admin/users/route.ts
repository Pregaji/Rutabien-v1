import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, roadmapProgress, documents, supportEscalationLog } from "@/db/schema";
import { getCurrentAdmin } from "@/lib/adminAuth";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const allUsers = await db.select().from(users);

  const rows = await Promise.all(
    allUsers.map(async (user) => {
      const steps = await db
        .select()
        .from(roadmapProgress)
        .where(eq(roadmapProgress.userId, user.id));
      const docsOutstanding = await db
        .select()
        .from(documents)
        .where(eq(documents.userId, user.id));
      const [openEscalation] = await db
        .select()
        .from(supportEscalationLog)
        .where(eq(supportEscalationLog.userId, user.id))
        .limit(1);

      const progress = steps.length
        ? Math.round((steps.filter((s) => s.status === "done").length / steps.length) * 100)
        : 0;
      const outstanding = docsOutstanding.filter((d) => d.status === "needed").length;

      return {
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        email: user.email,
        nationality: user.nationality,
        caseType: user.caseType,
        progress,
        payment: user.paymentStatus,
        docsOutstanding: outstanding,
        flagged: !!openEscalation,
        createdAt: user.createdAt,
      };
    })
  );

  return NextResponse.json({ users: rows });
}
