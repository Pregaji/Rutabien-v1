import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "crypto";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return new TextEncoder().encode(secret);
};

// Session JWT - issued only after a magic link or step-up code has been
// redeemed. There is no password anywhere in this flow (see CLAUDE.md).
export interface SessionPayload {
  userId: string;
  sessionId: string;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      sessionId: payload.sessionId as string,
    };
  } catch {
    return null;
  }
}

// Pending-2FA JWT - issued in place of a real session when a magic link is
// redeemed for a user with TOTP enabled. Deliberately a separate token type
// (not a "half-authenticated" SessionPayload) so it can never be mistaken
// for or accepted as a real session by getSession()/proxy.ts - it only
// proves "this access link was valid," not "this user is signed in."
export interface PendingTwoFactorPayload {
  userId: string;
  pending2fa: true;
}

export const PENDING_2FA_TTL_MINUTES = 5;

export async function signPendingTwoFactorToken(userId: string): Promise<string> {
  return new SignJWT({ userId, pending2fa: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_2FA_TTL_MINUTES}m`)
    .sign(getSecret());
}

export async function verifyPendingTwoFactorToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.pending2fa !== true || typeof payload.userId !== "string") return null;
    return payload.userId;
  } catch {
    return null;
  }
}

// Unguessable, single-use tokens for magic links (access_tokens table).
export function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

// Single source of truth for how long an access link stays valid -
// previously duplicated as a hardcoded 20 across 6 different route files,
// a real drift risk. Shortened from 20 to 10 minutes (2026-08-02, narrowing
// the window an intercepted/leaked email link stays usable).
export const ACCESS_TOKEN_TTL_MINUTES = 10;

// Short one-time codes for step-up verification before viewing/downloading
// a document. Numeric so it's easy to type from an email on a phone.
export function generateStepUpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
