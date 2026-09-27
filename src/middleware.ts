/**
 * Route protection middleware.
 * Unauthenticated requests to protected routes are redirected to /login.
 */
import { NextRequest, NextResponse } from "next/server";
import { decryptSession } from "@/lib/session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/repositories",
  "/history",
  "/investigations",
  "/reports",
  "/settings",
];

const COOKIE_NAME = "tracefix_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await decryptSession(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/repositories/:path*",
    "/history/:path*",
    "/investigations/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
