import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Protects every route inside app/(app)/ - previously these pages always
// rendered their shell for anyone and only the underlying API calls
// checked auth, so an unauthenticated visitor saw an empty-state message
// instead of being sent to log in. This is the safety net: nothing under
// these paths reaches the page component at all without a valid session.
//
// Self-contained JWT check (not importing lib/session.ts / lib/auth.ts)
// so this stays Edge-runtime safe - those files also pull in Node's
// `crypto` for token generation, which isn't needed here and isn't
// guaranteed to bundle cleanly for middleware.
const SESSION_COOKIE = "session";

const PROTECTED_PATHS = [
  "/dashboard",
  "/roadmap",
  "/documents",
  "/bienvenido",
  "/lawyer",
  "/live-support",
  "/eu-route",
  "/before-apply",
  "/translation/orders",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();

  if (await hasValidSession(req)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/access";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/roadmap/:path*",
    "/documents/:path*",
    "/bienvenido/:path*",
    "/lawyer/:path*",
    "/live-support/:path*",
    "/eu-route/:path*",
    "/before-apply/:path*",
    "/translation/orders/:path*",
  ],
};
