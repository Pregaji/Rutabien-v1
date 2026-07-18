import { NextRequest, NextResponse } from "next/server";
import { runRetentionCheck } from "@/lib/retention";

// Same shared-secret pattern as /api/reminders/run — called by an external
// scheduler, not tied to a user session.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runRetentionCheck();
  return NextResponse.json(result);
}
