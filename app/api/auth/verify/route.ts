import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { accessTokens, sessions } from "@/db/schema";
import { generateAccessToken } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, matches lib/session.ts

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/auth/expired", req.url));
  }

  // Single-use, unexpired lookup — matching a used or expired token here
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

  const [session] = await db
    .insert(sessions)
    .values({
      userId: accessToken.userId,
      token: generateAccessToken(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    })
    .returning();

  const response = NextResponse.redirect(new URL("/roadmap", req.url));
  return setSessionCookie(response, {
    userId: accessToken.userId,
    sessionId: session.id,
  });
}
