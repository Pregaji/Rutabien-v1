import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/payments/stripe";
import { PRICING_TIERS, isPlanType } from "@/lib/pricing";

const bodySchema = z.object({ plan: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isPlanType(parsed.data.plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const tier = PRICING_TIERS[parsed.data.plan];

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: tier.priceEur * 100,
          product_data: { name: `Rutabien — ${tier.name}` },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: session.userId, plan: tier.id },
    success_url: `${process.env.APP_URL}/checkout/success`,
    cancel_url: `${process.env.APP_URL}/checkout/cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
