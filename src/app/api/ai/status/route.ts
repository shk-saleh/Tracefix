/**
 * GET /api/ai/status
 * Returns Ollama availability.
 */
import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/ollama";

export async function GET() {
  const ai = getAIProvider();
  const status = await ai.isAvailable();

  return NextResponse.json({
    provider: "ollama",
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
    model: process.env.OLLAMA_MODEL ?? "llama3.2",
    // Indicate whether an API key is configured — never expose the key itself
    apiKeyConfigured: !!(process.env.OLLAMA_API_KEY),
    ...status,
  });
}
