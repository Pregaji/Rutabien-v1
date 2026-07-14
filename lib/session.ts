import { NextRequest, NextResponse } from "next/server";
import { signSessionToken, verifySessionToken, SessionPayload } from "./auth";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds, matches sessions.expiresAt

export async function setSessionCookie(
  response: NextResponse,
  payload: SessionPayload
): Promise<NextResponse> {
  const token = await signSessionToken(payload);

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

export async function getSession(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
