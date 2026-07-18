import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { translationOrders } from "@/db/schema";
import { getSession } from "@/lib/session";
import { createSandboxOrder } from "@/lib/payments/paypal";

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

  const paypalOrder = await createSandboxOrder(
    order.totalEur,
    `translation:${order.id}`,
    `${process.env.APP_URL}/translation/orders/paypal-return?orderId=${order.id}`,
    `${process.env.APP_URL}/translation/orders`
  );
  const approveUrl = (paypalOrder.links as { rel: string; href: string }[]).find(
    (l) => l.rel === "approve"
  )?.href;

  return NextResponse.json({ paypalOrderId: paypalOrder.id, approveUrl });
}
