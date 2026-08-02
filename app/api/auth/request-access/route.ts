import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accessTokens, users } from "@/db/schema";
import { ACCESS_TOKEN_TTL_MINUTES, generateAccessToken } from "@/lib/auth";
import { sendAccessLinkEmail } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`request-access:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const { email } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Deliberately return the same response whether or not the account exists,
  // so this endpoint can't be used to enumerate registered emails.
  if (user) {
    const token = generateAccessToken();
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MINUTES * 60 * 1000);

    await db.insert(accessTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const accessUrl = `${process.env.APP_URL}/api/auth/verify?token=${token}`;
    await sendAccessLinkEmail({
      to: email,
      accessUrl,
      expiresInMinutes: ACCESS_TOKEN_TTL_MINUTES,
    });
  }

  return NextResponse.json({
    message: "If that email has a Rutabien roadmap, an access link is on its way.",
  });
}
