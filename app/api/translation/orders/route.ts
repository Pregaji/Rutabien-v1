import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, translationOrders, accessTokens } from "@/db/schema";
import { generateAccessToken } from "@/lib/auth";
import { sendAccessLinkEmail } from "@/lib/email";
import { computeTranslationTotal } from "@/lib/translationPricing";
import { getSession } from "@/lib/session";

const ACCESS_TOKEN_TTL_MINUTES = 20;

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  documentCount: z.number().int().min(1).max(50),
  postalDelivery: z.boolean().default(false),
});

// Standalone entry point (MVP_Draft.md: "Just need a translation?") — no
// intake questionnaire, no nationality/visa-type gate, no Requirements-table
// dependency. Still uses the same passwordless email pattern for order
// tracking, sharing only the users/accessTokens/sessions infrastructure
// with the roadmap flow, nothing else.
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { email, documentCount, postalDelivery } = parsed.data;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const [user] = existing
    ? [existing]
    : await db.insert(users).values({ email, caseType: "translation_only" }).returning();

  const totalEur = computeTranslationTotal(documentCount, postalDelivery);
  const [order] = await db
    .insert(translationOrders)
    .values({ userId: user.id, postalDelivery, totalEur, files: [] })
    .returning();

  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MINUTES * 60 * 1000);
  await db.insert(accessTokens).values({
    userId: user.id,
    token,
    expiresAt,
    redirectPath: "/translation/orders",
  });

  await sendAccessLinkEmail({
    to: email,
    accessUrl: `${process.env.APP_URL}/auth/verify?token=${token}`,
    expiresInMinutes: ACCESS_TOKEN_TTL_MINUTES,
  });

  return NextResponse.json({
    orderId: order.id,
    totalEur,
    message: "Check your email for a link to upload your documents and pay.",
  });
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const orders = await db
    .select()
    .from(translationOrders)
    .where(eq(translationOrders.userId, session.userId));

  return NextResponse.json({ orders });
}
