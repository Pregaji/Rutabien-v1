import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "crypto";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return new TextEncoder().encode(secret);
};

// Session JWT — issued only after a magic link or step-up code has been
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

// Unguessable, single-use tokens for magic links (access_tokens table).
export function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

// Short one-time codes for step-up verification before viewing/downloading
// a document. Numeric so it's easy to type from an email on a phone.
export function generateStepUpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
