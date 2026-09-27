/**
 * GitHub OAuth helpers.
 */
import crypto from "crypto";

const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

// Scopes needed for reading repositories
const SCOPES = "read:user repo";

export function buildGitHubAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID ?? "",
    redirect_uri: process.env.GITHUB_CALLBACK_URL ?? "",
    scope: SCOPES,
    state,
  });
  return `${GITHUB_OAUTH_URL}?${params.toString()}`;
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export async function exchangeCodeForToken(
  code: string
): Promise<GitHubTokenResponse> {
  const res = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description ?? data.error}`);
  }

  return data as GitHubTokenResponse;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const res = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub user: ${res.status}`);
  }

  return res.json() as Promise<GitHubUser>;
}
