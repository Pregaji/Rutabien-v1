import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, accessTokens } from "@/db/schema";
import { getStripe } from "@/lib/payments/stripe";
import { isPlanType, PRICING_TIERS } from "@/lib/pricing";
import { generateAccessToken } from "@/lib/auth";
import { sendPostPaymentAccessEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as { metadata?: Record<string, string> };
    const userId = checkoutSession.metadata?.userId;
    const plan = checkoutSession.metadata?.plan;
    if (userId && plan && isPlanType(plan)) {
      const tier = PRICING_TIERS[plan];
      const [user] = await db
        .update(users)
        .set({ paymentStatus: tier.id, paidAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      const token = generateAccessToken();
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
      await db.insert(accessTokens).values({ userId: user.id, token, expiresAt });
      await sendPostPaymentAccessEmail({
        to: user.email,
        accessUrl: `${process.env.APP_URL}/auth/verify?token=${token}`,
        expiresInMinutes: 20,
        planName: tier.name,
      });
    }
  }

  return NextResponse.json({ received: true });
}
