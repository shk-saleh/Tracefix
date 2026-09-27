/**
 * LocalDockerRunner
 *
 * Runs each investigation inside an isolated Docker container.
 * Security: memory/CPU limits, network disabled after clone, non-root user.
 */
import { execFile, exec } from "child_process";
import { promisify } from "util";
import os from "os";
import path from "path";
import fs from "fs";
import {
  Runner,
  RunnerInput,
  CommandInput,
  CommandResult,
  TestInput,
  TestRunResult,
  RunnerResult,
} from "./types";

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

const RUNNER_IMAGE = process.env.RUNNER_IMAGE ?? "tracefix-runner:latest";
const MEMORY_LIMIT = process.env.DOCKER_MEMORY_LIMIT ?? "2048m";
const CPU_LIMIT = process.env.DOCKER_CPU_LIMIT ?? "2";
const NETWORK_DISABLED = process.env.DOCKER_NETWORK_DISABLED === "true";
const WORKSPACE_BASE = path.join(os.tmpdir(), "tracefix-workspaces");

// Commands that are allowed to run inside the container
const ALLOWED_COMMANDS = new Set([
  "npm",
  "npx",
  "pnpm",
  "yarn",
  "node",
  "git",
  "ls",
  "cat",
  "find",
  "grep",
  "tsc",
  "sh",
  "bash",
]);

function ensureWorkspaceBase() {
  if (!fs.existsSync(WORKSPACE_BASE)) {
    fs.mkdirSync(WORKSPACE_BASE, { recursive: true });
  }
}

function validateCommand(command: string[]) {
  if (!command.length) throw new Error("Empty command");
  const bin = path.basename(command[0]);
  if (!ALLOWED_COMMANDS.has(bin)) {
    throw new Error(`Command not allowed: ${bin}`);
  }
}

function containerName(workspaceId: string) {
  return `tracefix_${workspaceId}`;
}

function hostWorkspacePath(workspaceId: string) {
  return path.join(WORKSPACE_BASE, workspaceId);
}

export class LocalDockerRunner implements Runner {
  async isAvailable(): Promise<{ available: boolean; version?: string; error?: string }> {
    try {
      const { stdout } = await execAsync("docker version --format {{.Server.Version}}", {
        timeout: 5000,
      });
      return { available: true, version: stdout.trim() };
    } catch (err) {
      return {
        available: false,
        error: err instanceof Error ? err.message : "Docker not available",
      };
    }
  }

  async prepareRepository(input: RunnerInput): Promise<RunnerResult> {
    const { workspaceId, cloneUrl, branch, githubToken } = input;
    ensureWorkspaceBase();

    const hostPath = hostWorkspacePath(workspaceId);
    if (!fs.existsSync(hostPath)) {
      fs.mkdirSync(hostPath, { recursive: true });
    }

    // Docker Desktop/Linux can preserve host ownership on the bind mount.
    // Make the disposable workspace writable for the non-root runner user.
    try {
      fs.chmodSync(hostPath, 0o777);
    } catch {
      // Windows may reject chmod; the container still enforces non-root use.
    }

    // Build authenticated clone URL
    const authenticatedUrl = cloneUrl.replace(
      "https://",
      `https://x-access-token:${githubToken}@`
    );

    // Clone runs as root so it can write into the bind-mounted host directory
    // regardless of ownership on the Windows/WSL2 host. After cloning we
    // immediately chown the entire tree to the runner user (uid 1001) so that
    // subsequent containers running as `runner` can read/write every file.
    const cloneCmd = [
      "docker",
      "run",
      "--rm",
      "--name",
      `${containerName(workspaceId)}_clone`,
      "--user",
      "root",
      "-v",
      `${hostPath}:/workspace`,
      "-e",
      `CLONE_URL=${authenticatedUrl}`,
      "-e",
      `BRANCH=${branch}`,
      "--memory",
      MEMORY_LIMIT,
      "--cpus",
      CPU_LIMIT,
      RUNNER_IMAGE,
      "sh",
      "-c",
      `git clone --depth=50 --branch "${branch}" "$CLONE_URL" /workspace/repo 2>&1 && chown -R 1001:1001 /workspace/repo`,
    ];

    try {
      const { stdout, stderr } = await execFileAsync(cloneCmd[0], cloneCmd.slice(1), {
        timeout: 120_000,
      });
      return { workspaceId, success: true, stdout, stderr };
    } catch (err: unknown) {
      const e = err as { message?: string; stdout?: string; stderr?: string };
      return {
        workspaceId,
        success: false,
        error: e.message ?? "Clone failed",
        stdout: e.stdout,
        stderr: e.stderr,
      };
    }
  }

  async runCommand(input: CommandInput): Promise<CommandResult> {
    const { workspaceId, command, cwd, timeoutMs = 60_000, env = {}, allowNetwork = false, runAsRoot = false } = input;
    validateCommand(command);

    const hostPath = hostWorkspacePath(workspaceId);
    const containerWorkdir = cwd ? `/workspace/repo/${cwd}` : "/workspace/repo";

    // Disable network unless the caller explicitly needs it (e.g. package install).
    // npm/pnpm/yarn need registry access; analysis/test steps must stay isolated.
    const networkFlag = NETWORK_DISABLED && !allowNetwork ? "--network=none" : "";
    const envFlags = Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]);

    const args = [
      "run",
      "--rm",
      "--name",
      `${containerName(workspaceId)}_cmd_${Date.now()}`,
      "-v",
      `${hostPath}:/workspace`,
      "-w",
      containerWorkdir,
      "--memory",
      MEMORY_LIMIT,
      "--cpus",
      CPU_LIMIT,
      "--security-opt",
      "no-new-privileges:true",
      ...(runAsRoot ? ["--user", "0:0"] : []),
      ...(networkFlag ? [networkFlag] : []),
      ...envFlags,
      RUNNER_IMAGE,
      ...command,
    ];

    const start = Date.now();
    try {
      const { stdout, stderr } = await execFileAsync("docker", args, {
        timeout: timeoutMs,
        // execFileAsync throws on non-zero exit; we need the full output
        // so we capture it via maxBuffer — 50 MB is enough for any install log
        maxBuffer: 50 * 1024 * 1024,
      });
      return {
        exitCode: 0,
        stdout,
        stderr,
        durationMs: Date.now() - start,
        timedOut: false,
      };
    } catch (err: unknown) {
      const e = err as {
        code?: number | string;
        killed?: boolean;
        stdout?: string;
        stderr?: string;
        message?: string;
      };
      // Node's execFile puts the numeric exit code in `code` but as a number,
      // and sets `killed = true` when the process was sent SIGTERM/SIGKILL (timeout).
      const exitCode = typeof e.code === "number" ? e.code : 1;
      return {
        exitCode,
        stdout: e.stdout ?? "",
        stderr: e.stderr ?? e.message ?? "",
        durationMs: Date.now() - start,
        timedOut: e.killed ?? false,
      };
    }
  }

  async runTests(input: TestInput): Promise<TestRunResult> {
    const { workspaceId, testCommand, cwd, timeoutMs = 120_000 } = input;

    const result = await this.runCommand({
      workspaceId,
      command: testCommand,
      cwd,
      timeoutMs,
    });

    // Parse test output
    const parsed = parseTestOutput(result.stdout + "\n" + result.stderr);

    return {
      ...parsed,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  }

  async cleanup(workspaceId: string): Promise<void> {
    const hostPath = hostWorkspacePath(workspaceId);

    // Kill any running containers
    try {
      await execAsync(`docker ps -q --filter "name=${containerName(workspaceId)}" | xargs -r docker kill`);
    } catch {
      // ignore
    }

    // Remove workspace directory
    if (fs.existsSync(hostPath)) {
      fs.rmSync(hostPath, { recursive: true, force: true });
    }
  }
}

/**
 * Best-effort parser for Jest/Vitest test output.
 */
function parseTestOutput(output: string): {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
} {
  // Jest: "Tests: 3 failed, 145 passed, 148 total"
  const jestMatch = output.match(
    /Tests:\s+(?:(\d+)\s+failed,\s*)?(?:(\d+)\s+skipped,\s*)?(?:(\d+)\s+passed,\s*)?(\d+)\s+total/
  );
  if (jestMatch) {
    const failed = parseInt(jestMatch[1] ?? "0", 10);
    const skipped = parseInt(jestMatch[2] ?? "0", 10);
    const passed = parseInt(jestMatch[3] ?? "0", 10);
    const total = parseInt(jestMatch[4] ?? "0", 10);
    return { total, passed, failed, skipped };
  }

  // Vitest: "✓ 5 tests | 5 passed"  or  "× 2 tests | 1 failed"
  const vitestMatch = output.match(/(\d+)\s+tests?\s+\|\s+(\d+)\s+passed(?:\s+\|\s+(\d+)\s+failed)?/);
  if (vitestMatch) {
    const total = parseInt(vitestMatch[1], 10);
    const passed = parseInt(vitestMatch[2], 10);
    const failed = parseInt(vitestMatch[3] ?? "0", 10);
    return { total, passed, failed, skipped: total - passed - failed };
  }

  // Fallback: try to count PASS/FAIL lines
  const passLines = (output.match(/^✓|PASS/gm) ?? []).length;
  const failLines = (output.match(/^✗|FAIL/gm) ?? []).length;
  if (passLines + failLines > 0) {
    return {
      total: passLines + failLines,
      passed: passLines,
      failed: failLines,
      skipped: 0,
    };
  }

  return { total: 0, passed: 0, failed: 0, skipped: 0 };
}




