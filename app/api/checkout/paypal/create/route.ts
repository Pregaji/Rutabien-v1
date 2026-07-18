import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { createSandboxOrder } from "@/lib/payments/paypal";
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

  const order = await createSandboxOrder(
    tier.priceEur,
    `${session.userId}:${tier.id}`,
    `${process.env.APP_URL}/paywall/paypal-return?plan=${tier.id}`,
    `${process.env.APP_URL}/paywall`
  );
  const approveUrl = (order.links as { rel: string; href: string }[]).find(
    (l) => l.rel === "approve"
  )?.href;
  return NextResponse.json({ orderId: order.id, approveUrl });
}
