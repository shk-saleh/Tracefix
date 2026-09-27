/**
 * GET /api/auth/github/login
 * Redirects the user to GitHub for OAuth authorization.
 */
import { NextResponse } from "next/server";
import { buildGitHubAuthUrl, generateOAuthState } from "@/lib/github/oauth";

const STATE_COOKIE = "tracefix_oauth_state";

export async function GET() {
  if (!process.env.GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID." },
      { status: 503 }
    );
  }

  const state = generateOAuthState();
  const url = buildGitHubAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
