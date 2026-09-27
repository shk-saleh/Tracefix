/**
 * POST /api/investigations  — create a new investigation
 * GET  /api/investigations  — list all investigations
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { startInvestigation } from "@/lib/investigations/service";
import { listInvestigationsByUser } from "@/lib/investigations/store";

const CreateSchema = z.object({
  repositoryId: z.string().min(1),
  repositoryName: z.string().min(1),
  owner: z.string().min(1),
  branch: z.string().min(1),
  cloneUrl: z.string().url(),
  bugDescription: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const investigation = startInvestigation({
      ...data,
      githubUserId: session.githubUserId,
      githubAccessToken: session.githubAccessToken,
    });

    return NextResponse.json({ investigation }, { status: 201 });
  } catch (err) {
    console.error("[Create investigation error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create investigation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const investigations = listInvestigationsByUser(session.githubUserId);
  return NextResponse.json({ investigations });
}
