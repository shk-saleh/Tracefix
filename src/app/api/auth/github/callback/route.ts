/**
 * GET /api/auth/github/callback
 * Handles the OAuth callback from GitHub.
 */
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getGitHubUser } from "@/lib/github/oauth";
import { setSessionCookie } from "@/lib/session";
import { cookies } from "next/headers";

const STATE_COOKIE = "tracefix_oauth_state";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // GitHub returned an error
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=github_auth_denied`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(`/login?error=missing_params`, request.url)
    );
  }

  // Validate OAuth state
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  if (!expectedState || expectedState !== state) {
    return NextResponse.redirect(
      new URL(`/login?error=state_mismatch`, request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Fetch the authenticated user
    const user = await getGitHubUser(tokenData.access_token);

    // Build response — redirect to dashboard after successful login
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );

    await setSessionCookie(response, {
      githubAccessToken: tokenData.access_token,
      githubUserId: user.id,
      githubLogin: user.login,
      githubName: user.name,
      githubAvatarUrl: user.avatar_url,
    });

    // Clear the state cookie
    response.cookies.set(STATE_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[GitHub callback error]", err);
    const message =
      err instanceof Error ? encodeURIComponent(err.message) : "unknown_error";
    return NextResponse.redirect(
      new URL(`/login?error=${message}`, request.url)
    );
  }
}
