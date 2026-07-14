import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { verifySessionToken } from "@/lib/auth";

// Verifies the JWT *and* that the underlying session row still exists and
// hasn't expired, so revoking a session (e.g. logout) takes effect
// immediately instead of waiting out the JWT's own expiry.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.id, payload.sessionId), gt(sessions.expiresAt, new Date()))
    )
    .limit(1);
  if (!session) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  return user ?? null;
}
