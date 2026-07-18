import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";

const ADMIN_COOKIE = "admin_session";
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours — real login, shorter-lived than user sessions

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return new TextEncoder().encode(secret);
};

export async function hashAdminPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyAdminPassword(password: string, hashed: string): Promise<boolean> {
  return compare(password, hashed);
}

interface AdminTokenPayload {
  adminUserId: string;
  adminSessionId: string;
}

async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      adminUserId: payload.adminUserId as string,
      adminSessionId: payload.adminSessionId as string,
    };
  } catch {
    return null;
  }
}

export async function createAdminSessionCookie(adminUserId: string) {
  const [session] = await db
    .insert(adminSessions)
    .values({
      adminUserId,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + ADMIN_SESSION_TTL_MS),
    })
    .returning();

  const jwt = await signAdminToken({ adminUserId, adminSessionId: session.id });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAdminToken(token);
  if (!payload) return null;

  const [session] = await db
    .select()
    .from(adminSessions)
    .where(and(eq(adminSessions.id, payload.adminSessionId), gt(adminSessions.expiresAt, new Date())))
    .limit(1);
  if (!session) return null;

  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, payload.adminUserId)).limit(1);
  return admin ?? null;
}
