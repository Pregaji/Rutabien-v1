import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, accessTokens } from "@/db/schema";
import { getSession } from "@/lib/session";
import { captureSandboxOrder } from "@/lib/payments/paypal";
import { PRICING_TIERS, isPlanType } from "@/lib/pricing";
import { generateAccessToken } from "@/lib/auth";
import { sendPostPaymentAccessEmail } from "@/lib/email";

const bodySchema = z.object({ orderId: z.string(), plan: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isPlanType(parsed.data.plan)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const tier = PRICING_TIERS[parsed.data.plan];

  const capture = await captureSandboxOrder(parsed.data.orderId);
  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  const [user] = await db
    .update(users)
    .set({ paymentStatus: tier.id, paidAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, session.userId))
    .returning();

  // No gap between "I just paid" and "here's how I get back in" — see
  // MVP_Draft.md section 7, point 5.
  const token = generateAccessToken();
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
  await db.insert(accessTokens).values({ userId: user.id, token, expiresAt });
  await sendPostPaymentAccessEmail({
    to: user.email,
    accessUrl: `${process.env.APP_URL}/auth/verify?token=${token}`,
    expiresInMinutes: 20,
    planName: tier.name,
  });

  return NextResponse.json({ ok: true });
}
