import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { verifyAdminPassword, createAdminSessionCookie } from "@/lib/adminAuth";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, parsed.data.email))
    .limit(1);

  // Same generic error whether the email doesn't exist or the password is
  // wrong, so this can't be used to enumerate admin accounts.
  if (!admin || !(await verifyAdminPassword(parsed.data.password, admin.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createAdminSessionCookie(admin.id);
  return NextResponse.json({ ok: true });
}
