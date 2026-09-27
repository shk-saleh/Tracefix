/**
 * POST /api/investigations/[id]/cancel
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getInvestigation, updateInvestigation } from "@/lib/investigations/store";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const investigation = getInvestigation(id);

  if (!investigation || investigation.githubUserId !== session.githubUserId) {
    return NextResponse.json({ error: "Investigation not found" }, { status: 404 });
  }

  const terminal = new Set(["completed", "failed", "cancelled"]);
  if (terminal.has(investigation.status)) {
    return NextResponse.json(
      { error: `Cannot cancel investigation in status: ${investigation.status}` },
      { status: 409 }
    );
  }

  updateInvestigation(id, {
    status: "cancelled",
    timeline: investigation.timeline.map((s) =>
      s.status === "running" ? { ...s, status: "failed" as const } : s
    ),
  });

  return NextResponse.json({ ok: true });
}
