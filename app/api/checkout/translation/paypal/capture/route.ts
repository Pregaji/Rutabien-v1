import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { translationOrders } from "@/db/schema";
import { getSession } from "@/lib/session";
import { captureSandboxOrder } from "@/lib/payments/paypal";

const bodySchema = z.object({ orderId: z.string(), paypalOrderId: z.string() });

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

  const capture = await captureSandboxOrder(parsed.data.paypalOrderId);
  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  await db
    .update(translationOrders)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(translationOrders.id, order.id));

  return NextResponse.json({ ok: true });
}
