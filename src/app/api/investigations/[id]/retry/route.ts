import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { retryInvestigation } from "@/lib/investigations/service";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const investigation = retryInvestigation(id, session.githubAccessToken);
    return NextResponse.json({ investigation }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to retry investigation";
    const status = message === "Investigation not found" ? 404 : 409;
    return NextResponse.json({ error: message }, { status });
  }
}
