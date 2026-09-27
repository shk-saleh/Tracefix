/**
 * GET /api/auth/session
 * Returns the current session user (no sensitive data exposed).
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  // Never include githubAccessToken in the response
  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.githubUserId,
      login: session.githubLogin,
      name: session.githubName,
      avatarUrl: session.githubAvatarUrl,
    },
  });
}
