/**
 * Runner interface and types.
 */

export interface RunnerInput {
  workspaceId: string;
  cloneUrl: string;
  branch: string;
  githubToken: string;
}

export interface CommandInput {
  workspaceId: string;
  command: string[];
  cwd?: string;
  timeoutMs?: number;
  env?: Record<string, string>;
  /** Allow network access inside the container (required for package installation). Default: false. */
  allowNetwork?: boolean;
  /** Use root only for dependency installation on bind-mounted WSL workspaces. */
  runAsRoot?: boolean;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export interface TestInput {
  workspaceId: string;
  testCommand: string[];
  cwd?: string;
  timeoutMs?: number;
}

export interface TestRunResult {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface RunnerResult {
  workspaceId: string;
  success: boolean;
  error?: string;
  stdout?: string;
  stderr?: string;
}

export interface Runner {
  /**
   * Clone repository and prepare the workspace (install deps, detect project type).
   */
  prepareRepository(input: RunnerInput): Promise<RunnerResult>;

  /**
   * Run an allowlisted command inside the isolated environment.
   */
  runCommand(input: CommandInput): Promise<CommandResult>;

  /**
   * Run the test suite and parse results.
   */
  runTests(input: TestInput): Promise<TestRunResult>;

  /**
   * Destroy the workspace/container after the investigation finishes.
   */
  cleanup(workspaceId: string): Promise<void>;

  /**
   * Check whether the runner backend is available.
   */
  isAvailable(): Promise<{ available: boolean; version?: string; error?: string }>;
}


