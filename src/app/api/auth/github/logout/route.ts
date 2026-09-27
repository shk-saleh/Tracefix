/**
 * POST /api/auth/github/logout
 * Clears the session cookie.
 */
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  );
  clearSessionCookie(response);
  return response;
}
