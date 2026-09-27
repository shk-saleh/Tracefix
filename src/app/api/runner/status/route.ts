/**
 * GET /api/runner/status
 * Returns runner availability and Docker version.
 */
import { NextResponse } from "next/server";
import { getRunner } from "@/lib/runner/runner";

export async function GET() {
  const runner = getRunner();
  const mode = process.env.RUNNER_MODE ?? "local";

  const availability = await runner.isAvailable();

  return NextResponse.json({
    mode,
    available: availability.available,
    dockerVersion: availability.version,
    error: availability.error,
  });
}
