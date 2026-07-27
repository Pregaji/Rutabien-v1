import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { documents, translationOrders } from "@/db/schema";
import { getSession } from "@/lib/session";
import { computeTranslationTotal } from "@/lib/translationPricing";

// Links an already-uploaded roadmap document to the user's pending
// translation order, so "attach a copy next to any document, then send it
// for translation" is one connected flow instead of two disconnected ones
// (roadmap documents vs. a standalone document-count stepper).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.userId)))
    .limit(1);
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  if (!doc.fileRef) return NextResponse.json({ error: "Upload the document first" }, { status: 400 });
  if (doc.translationOrderId) return NextResponse.json({ error: "Already attached" }, { status: 400 });

  let [order] = await db
    .select()
    .from(translationOrders)
    .where(and(eq(translationOrders.userId, session.userId), eq(translationOrders.status, "pending")))
    .limit(1);

  if (!order) {
    [order] = await db
      .insert(translationOrders)
      .values({ userId: session.userId, totalEur: 0, files: [] })
      .returning();
  }

  const files = [...order.files, { key: doc.fileRef, name: doc.name }];
  const totalEur = computeTranslationTotal(files.length, order.postalDelivery);

  const [updatedOrder] = await db
    .update(translationOrders)
    .set({ files, totalEur, updatedAt: new Date() })
    .where(eq(translationOrders.id, order.id))
    .returning();

  await db
    .update(documents)
    .set({ translationOrderId: order.id })
    .where(eq(documents.id, doc.id));

  return NextResponse.json({ order: updatedOrder });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.userId)))
    .limit(1);
  if (!doc || !doc.translationOrderId) return NextResponse.json({ error: "Not attached" }, { status: 400 });

  const [order] = await db
    .select()
    .from(translationOrders)
    .where(eq(translationOrders.id, doc.translationOrderId))
    .limit(1);

  if (order) {
    const files = order.files.filter((f) => f.key !== doc.fileRef);
    const totalEur = computeTranslationTotal(files.length, order.postalDelivery);
    await db
      .update(translationOrders)
      .set({ files, totalEur, updatedAt: new Date() })
      .where(eq(translationOrders.id, order.id));
  }

  await db.update(documents).set({ translationOrderId: null }).where(eq(documents.id, doc.id));

  return NextResponse.json({ ok: true });
}
