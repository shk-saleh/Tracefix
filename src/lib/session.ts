/**
 * Encrypted HTTP-only session cookie.
 * Uses HS256 JWT signed with SESSION_SECRET.
 * The GitHub access token never leaves the server.
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "tracefix_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  githubAccessToken: string;
  githubUserId: number;
  githubLogin: string;
  githubName: string | null;
  githubAvatarUrl: string;
}

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function decryptSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decryptSession(token);
}

export async function setSessionCookie(
  response: NextResponse,
  payload: SessionPayload
): Promise<void> {
  const token = await encryptSession(payload);
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
