import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { translationOrders } from "@/db/schema";
import { getSession } from "@/lib/session";
import { getUploadUrl } from "@/lib/storage";

const bodySchema = z.object({ fileName: z.string().min(1), contentType: z.string().min(1) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const [order] = await db
    .select()
    .from(translationOrders)
    .where(and(eq(translationOrders.id, id), eq(translationOrders.userId, session.userId)))
    .limit(1);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const key = `translation-orders/${order.id}/${Date.now()}-${parsed.data.fileName}`;
  const uploadUrl = await getUploadUrl(key, parsed.data.contentType);

  const files = [...order.files, { key, name: parsed.data.fileName }];
  await db.update(translationOrders).set({ files, updatedAt: new Date() }).where(eq(translationOrders.id, order.id));

  return NextResponse.json({ uploadUrl, files });
}
