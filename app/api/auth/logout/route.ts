import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { getSession, clearSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (session) {
    await db.delete(sessions).where(eq(sessions.id, session.sessionId));
  }

  const response = NextResponse.json({ ok: true });
  return clearSessionCookie(response);
}
