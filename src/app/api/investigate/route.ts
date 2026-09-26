import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl, bugDescription } = body as {
      repoUrl?: string;
      bugDescription?: string;
    };

    if (!repoUrl || !bugDescription) {
      return NextResponse.json(
        { error: "repoUrl and bugDescription are required" },
        { status: 400 }
      );
    }

    // In production: kick off the real investigation pipeline here.
    // For the MVP demo, we return a stable investigation ID immediately.
    return NextResponse.json(
      { investigationId: "demo-001" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
