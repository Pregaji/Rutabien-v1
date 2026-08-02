import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { accessTokens, sessions, users } from "@/db/schema";
import { generateAccessToken, signPendingTwoFactorToken, PENDING_2FA_TTL_MINUTES } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, matches lib/session.ts

export async function GET(req: NextRequest) {
  // Tokens are 32-byte random hex (see generateAccessToken), so brute force
  // is infeasible either way, but this still blocks naive scripted guessing.
  const ip = getClientIp(req);
  const limited = rateLimit(`verify-token:${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.redirect(new URL("/auth/expired", req.url));
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/auth/expired", req.url));
  }

  // Single-use, unexpired lookup - matching a used or expired token here
  // is treated the same as no match, so no distinction leaks to the caller.
  const [accessToken] = await db
    .select()
    .from(accessTokens)
    .where(
      and(
        eq(accessTokens.token, token),
        isNull(accessTokens.usedAt),
        gt(accessTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!accessToken) {
    return NextResponse.redirect(new URL("/auth/expired", req.url));
  }

  await db
    .update(accessTokens)
    .set({ usedAt: new Date() })
    .where(eq(accessTokens.id, accessToken.id));

  // Real "activity" signal for Document Vault retention - the user actually
  // came back, not just that their account exists.
  const [user] = await db
    .update(users)
    .set({ lastActiveAt: new Date(), retentionWarnedAt: null })
    .where(eq(users.id, accessToken.userId))
    .returning();

  // Optional TOTP second factor (see lib/totp.ts) - a valid magic link only
  // proves email access, not the second factor, so this issues a
  // short-lived pending token instead of a real session and sends the user
  // to enter their code. getSession()/proxy.ts never accept this cookie.
  if (user.totpEnabled) {
    const pendingToken = await signPendingTwoFactorToken(user.id);
    const redirectUrl = new URL("/verify-2fa", req.url);
    if (accessToken.redirectPath) redirectUrl.searchParams.set("redirect", accessToken.redirectPath);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("pending_2fa", pendingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PENDING_2FA_TTL_MINUTES * 60,
    });
    return response;
  }

  const [session] = await db
    .insert(sessions)
    .values({
      userId: accessToken.userId,
      token: generateAccessToken(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    })
    .returning();

  const response = NextResponse.redirect(new URL(accessToken.redirectPath ?? "/dashboard", req.url));
  return setSessionCookie(response, {
    userId: accessToken.userId,
    sessionId: session.id,
  });
}
