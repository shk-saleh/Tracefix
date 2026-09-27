/**
 * GET  /api/investigations/[id]   — get investigation details
 * DELETE /api/investigations/[id] — cancel/delete an investigation
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getInvestigation, updateInvestigation } from "@/lib/investigations/store";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const investigation = getInvestigation(id);

  if (!investigation || investigation.githubUserId !== session.githubUserId) {
    return NextResponse.json({ error: "Investigation not found" }, { status: 404 });
  }

  return NextResponse.json({ investigation });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const investigation = getInvestigation(id);

  if (!investigation || investigation.githubUserId !== session.githubUserId) {
    return NextResponse.json({ error: "Investigation not found" }, { status: 404 });
  }

  // Only cancel if still running
  if (
    investigation.status !== "completed" &&
    investigation.status !== "failed" &&
    investigation.status !== "cancelled"
  ) {
    updateInvestigation(id, { status: "cancelled" });
  }

  return NextResponse.json({ ok: true });
}
