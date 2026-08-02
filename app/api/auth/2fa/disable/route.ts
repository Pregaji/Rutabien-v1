import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/session";
import { verifyTotpCode } from "@/lib/totp";
import { rateLimit } from "@/lib/rateLimit";

const bodySchema = z.object({ code: z.string().trim().length(6) });

// Requires a current valid code to disable, not just an active session -
// otherwise a hijacked session alone could silently turn off the second
// factor it's protecting against.
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const limited = rateLimit(`2fa-disable:${session.userId}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user?.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: "Two-factor authentication isn't enabled" }, { status: 400 });
  }

  if (!verifyTotpCode(user.email, user.totpSecret, parsed.data.code)) {
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  await db
    .update(users)
    .set({ totpEnabled: false, totpSecret: null, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
