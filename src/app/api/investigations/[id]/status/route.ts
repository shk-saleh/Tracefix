/**
 * GET /api/investigations/[id]/status
 * Lightweight status polling endpoint.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getInvestigation } from "@/lib/investigations/store";

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

  if (!investigation) {
    return NextResponse.json({ error: "Investigation not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: investigation.id,
    status: investigation.status,
    timeline: investigation.timeline,
    projectInfo: investigation.projectInfo,
    baselineTests: investigation.baselineTests,
    report: investigation.report,
    error: investigation.error,
    updatedAt: investigation.updatedAt,
  });
}
