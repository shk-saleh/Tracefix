/**
 * Ollama AI provider.
 */

export interface AIRequest {
  system?: string;
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  model: string;
  durationMs: number;
}

export interface AIProvider {
  generate(input: AIRequest): Promise<AIResponse>;
  isAvailable(): Promise<{ available: boolean; models?: string[]; error?: string }>;
}

export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private defaultModel: string;
  private apiKey: string | undefined;

  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/$/, "");
    this.defaultModel = process.env.OLLAMA_MODEL ?? "llama3.2";
    // OLLAMA_API_KEY is required for cloud-hosted Ollama endpoints.
    // Left undefined for local instances — no Authorization header is sent.
    this.apiKey = process.env.OLLAMA_API_KEY || undefined;
  }

  /** Build headers, adding Authorization only when an API key is set. */
  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    return headers;
  }

  async isAvailable(): Promise<{ available: boolean; models?: string[]; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : undefined,
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return { available: false, error: `Ollama returned ${res.status}` };
      const data = await res.json() as { models: Array<{ name: string }> };
      const models = data.models?.map((m) => m.name) ?? [];
      return { available: true, models };
    } catch (err) {
      return {
        available: false,
        error: err instanceof Error ? err.message : "Ollama unreachable",
      };
    }
  }

  async generate(input: AIRequest): Promise<AIResponse> {
    const model = input.model ?? this.defaultModel;
    const start = Date.now();

    const body: Record<string, unknown> = {
      model,
      prompt: input.system ? `${input.system}\n\n${input.prompt}` : input.prompt,
      stream: false,
    };
    if (input.temperature !== undefined) body.temperature = input.temperature;
    if (input.maxTokens !== undefined) body.num_predict = input.maxTokens;

    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Ollama error ${res.status}: ${text}`);
    }

    const data = await res.json() as { response: string; model: string };
    return {
      content: data.response,
      model: data.model ?? model,
      durationMs: Date.now() - start,
    };
  }
}

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!_provider) {
    _provider = new OllamaProvider();
  }
  return _provider;
}
