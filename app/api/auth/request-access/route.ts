import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accessTokens, users } from "@/db/schema";
import { generateAccessToken } from "@/lib/auth";
import { sendAccessLinkEmail } from "@/lib/email";

const ACCESS_TOKEN_TTL_MINUTES = 20;

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(req: NextRequest) {
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

    const accessUrl = `${process.env.APP_URL}/auth/verify?token=${token}`;
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
