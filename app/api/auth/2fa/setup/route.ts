import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { generateTotpSecret, getTotpSetupQrCode } from "@/lib/totp";

// Generates and stores a new secret but does NOT enable 2FA yet - that only
// happens once /api/auth/2fa/confirm verifies the user actually scanned it
// and can produce a valid code. Calling this again before confirming just
// overwrites the pending secret, which is fine (no code was ever valid
// against it from the user's authenticator).
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (user.totpEnabled) {
    return NextResponse.json({ error: "Two-factor authentication is already enabled" }, { status: 400 });
  }

  const secret = generateTotpSecret();
  await db.update(users).set({ totpSecret: secret, updatedAt: new Date() }).where(eq(users.id, user.id));

  const { uri, qrCodeDataUrl } = await getTotpSetupQrCode(user.email, secret);
  return NextResponse.json({ secret, uri, qrCodeDataUrl });
}
