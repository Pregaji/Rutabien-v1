import { NextRequest, NextResponse } from "next/server";
import { runAllReminders } from "@/lib/reminders";

// Called by an external scheduler (e.g. Vercel Cron) — not tied to any user
// session. Guarded by a shared secret rather than left open.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runAllReminders();
  return NextResponse.json(result);
}
