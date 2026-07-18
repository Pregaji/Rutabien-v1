import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { translationOrders } from "@/db/schema";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/payments/stripe";

const bodySchema = z.object({ orderId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const [order] = await db
    .select()
    .from(translationOrders)
    .where(eq(translationOrders.id, parsed.data.orderId))
    .limit(1);
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: order.totalEur * 100,
          product_data: { name: `Rutabien — Sworn translation (${order.files.length} document(s))` },
        },
        quantity: 1,
      },
    ],
    metadata: { type: "translation", orderId: order.id },
    success_url: `${process.env.APP_URL}/checkout/success`,
    cancel_url: `${process.env.APP_URL}/checkout/cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
