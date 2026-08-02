import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { generateAccessToken, verifyPendingTwoFactorToken } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { verifyTotpCode } from "@/lib/totp";
import { rateLimit } from "@/lib/rateLimit";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, matches lib/session.ts
const bodySchema = z.object({ code: z.string().trim().length(6) });

// Completes login for a user with TOTP enabled - takes over from
// /api/auth/verify, which issues the pending_2fa cookie this reads instead
// of a real session, once a magic link is redeemed.
export async function POST(req: NextRequest) {
  const pendingToken = req.cookies.get("pending_2fa")?.value;
  if (!pendingToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = await verifyPendingTwoFactorToken(pendingToken);
  if (!userId) return NextResponse.json({ error: "This step has expired - please sign in again." }, { status: 401 });

  // A 6-digit code is only 1M possibilities - this is the tightest limit
  // in the app for exactly that reason (matches step-up verify).
  const limited = rateLimit(`2fa-login:${userId}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please request a new access link." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!verifyTotpCode(user.email, user.totpSecret, parsed.data.code)) {
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  const [session] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      token: generateAccessToken(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    })
    .returning();

  const response = NextResponse.json({ ok: true });
  response.cookies.set("pending_2fa", "", { path: "/", maxAge: 0 });
  return setSessionCookie(response, { userId: user.id, sessionId: session.id });
}
