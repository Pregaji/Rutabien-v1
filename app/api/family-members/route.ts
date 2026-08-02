import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, familyMembers } from "@/db/schema";
import { getSession } from "@/lib/session";
import { createFamilyMember } from "@/lib/familyMembers";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  relationship: z.enum(["spouse", "child"]),
});

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const members = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.userId, session.userId));

  return NextResponse.json({ familyMembers: members });
}

// Document Vault (and therefore family folders within it) is a Complete
// plan feature - matches the gate already on app/(app)/documents/page.tsx,
// enforced here too since this is a separate write endpoint.
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.paymentStatus !== "complete") {
    return NextResponse.json(
      { error: "Adding family members is a Complete plan feature." },
      { status: 403 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a name and relationship." }, { status: 400 });
  }

  if (parsed.data.relationship === "spouse") {
    const [existingSpouse] = await db
      .select()
      .from(familyMembers)
      .where(and(eq(familyMembers.userId, user.id), eq(familyMembers.relationship, "spouse")))
      .limit(1);
    if (existingSpouse) {
      return NextResponse.json(
        { error: "A spouse has already been added - only one is allowed." },
        { status: 400 }
      );
    }
  }

  const result = await createFamilyMember(user.id, parsed.data.name, parsed.data.relationship);
  return NextResponse.json(result);
}
