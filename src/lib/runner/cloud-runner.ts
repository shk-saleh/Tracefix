/**
 * CloudRunner — delegates all work to a remote runner service.
 * Implement the interface but leave the actual network calls stubbed
 * until CLOUD_RUNNER_URL is configured.
 */
import {
  Runner,
  RunnerInput,
  CommandInput,
  CommandResult,
  TestInput,
  TestRunResult,
  RunnerResult,
} from "./types";

export class CloudRunner implements Runner {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.CLOUD_RUNNER_URL ?? "";
    this.token = process.env.CLOUD_RUNNER_TOKEN ?? "";
    if (!this.baseUrl) {
      throw new Error("CLOUD_RUNNER_URL is not configured");
    }
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Cloud runner error ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async isAvailable(): Promise<{ available: boolean; version?: string; error?: string }> {
    try {
      const data = await this.request<{ version: string }>("/health");
      return { available: true, version: data.version };
    } catch (err) {
      return {
        available: false,
        error: err instanceof Error ? err.message : "Cloud runner unavailable",
      };
    }
  }

  async prepareRepository(input: RunnerInput): Promise<RunnerResult> {
    const result = await this.request<RunnerResult>(
      `/runner/workspaces/${input.workspaceId}/clone`,
      {
        method: "POST",
        body: JSON.stringify({
          cloneUrl: input.cloneUrl,
          branch: input.branch,
          githubToken: input.githubToken,
        }),
      }
    );
    return result;
  }

  async runCommand(input: CommandInput): Promise<CommandResult> {
    return this.request<CommandResult>(
      `/runner/workspaces/${input.workspaceId}/command`,
      {
        method: "POST",
        body: JSON.stringify({
          command: input.command,
          cwd: input.cwd,
          timeoutMs: input.timeoutMs,
          env: input.env,
          allowNetwork: input.allowNetwork ?? false,
          runAsRoot: input.runAsRoot ?? false,
        }),
      }
    );
  }

  async runTests(input: TestInput): Promise<TestRunResult> {
    return this.request<TestRunResult>(
      `/runner/workspaces/${input.workspaceId}/tests`,
      {
        method: "POST",
        body: JSON.stringify({
          testCommand: input.testCommand,
          cwd: input.cwd,
          timeoutMs: input.timeoutMs,
        }),
      }
    );
  }

  async cleanup(workspaceId: string): Promise<void> {
    await this.request(`/runner/workspaces/${workspaceId}`, {
      method: "DELETE",
    });
  }
}


