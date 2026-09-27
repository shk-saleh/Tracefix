/**
 * Investigation service — orchestrates the full pipeline.
 * Called from Next.js API route handlers (never from client components).
 */
import crypto from "crypto";
import os from "os";
import fs from "fs";
import path from "path";
import {
  Investigation,
  InvestigationStatus,
  TimelineStep,
  ProjectInfo,
} from "./types";
import {
  createInvestigation,
  updateInvestigation,
  getInvestigation,
} from "./store";
import { getRunner } from "../runner/runner";
import { detectProject } from "../runner/docker";

const WORKSPACE_BASE = path.join(os.tmpdir(), "tracefix-workspaces");
const activeInvestigations = new Set<string>();

function generateId(): string {
  return crypto.randomBytes(6).toString("hex");
}

function generateWorkspaceId(): string {
  return crypto.randomBytes(3).toString("hex");
}

function initialTimeline(): TimelineStep[] {
  return [
    { id: "t_connect", label: "Repository connected", status: "pending" },
    { id: "t_clone", label: "Cloning repository", status: "pending" },
    { id: "t_detect", label: "Detecting project type", status: "pending" },
    { id: "t_install", label: "Installing dependencies", status: "pending" },
    { id: "t_baseline", label: "Running baseline tests", status: "pending" },
    { id: "t_analyze", label: "Analyzing repository", status: "pending" },
    { id: "t_reproduce", label: "Reproducing bug", status: "pending" },
    { id: "t_rootcause", label: "Finding root cause", status: "pending" },
    { id: "t_regression", label: "Generating regression test", status: "pending" },
    { id: "t_fix", label: "Applying fix", status: "pending" },
    { id: "t_verify", label: "Verifying fix", status: "pending" },
  ];
}

function stepStatus(
  timeline: TimelineStep[],
  id: string,
  status: TimelineStep["status"],
  detail?: string
): TimelineStep[] {
  return timeline.map((s) =>
    s.id === id
      ? { ...s, status, timestamp: new Date().toISOString(), detail }
      : s
  );
}

function installCommands(
  packageManager: ProjectInfo["packageManager"],
  hasYarnConfig: boolean
): string[][] {
  switch (packageManager) {
    case "pnpm":
      return [
        ["pnpm", "install", "--frozen-lockfile", "--reporter=append-only"],
        ["pnpm", "install", "--no-frozen-lockfile", "--reporter=append-only"],
      ];
    case "yarn":
      return hasYarnConfig
        ? [["yarn", "install", "--immutable"], ["yarn", "install", "--non-interactive"]]
        : [["yarn", "install", "--frozen-lockfile"], ["yarn", "install", "--non-interactive"]];
    case "npm":
      return [
        ["npm", "ci", "--no-audit", "--no-fund", "--loglevel=error"],
        ["npm", "install", "--no-audit", "--no-fund", "--legacy-peer-deps", "--loglevel=error"],
      ];
    default:
      return [["npm", "install", "--no-audit", "--no-fund", "--legacy-peer-deps", "--loglevel=error"]];
  }
}

function installError(output: string): string {
  const lines = output
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() && !/^npm warn\b/i.test(line));
  return (lines.slice(-12).join("\n") || "No installer output was returned.").slice(0, 1_200);
}
export interface StartInvestigationInput {
  repositoryId: string;
  repositoryName: string;
  owner: string;
  branch: string;
  cloneUrl: string;
  bugDescription: string;
  githubAccessToken: string;
}

/**
 * Creates the investigation record and immediately starts the background pipeline.
 * The pipeline runs asynchronously — the caller does NOT await it.
 */
export function startInvestigation(input: StartInvestigationInput): Investigation {
  const id = generateId();
  const workspaceId = generateWorkspaceId();
  const now = new Date().toISOString();

  const investigation: Investigation = {
    id,
    repositoryId: input.repositoryId,
    repositoryName: input.repositoryName,
    owner: input.owner,
    branch: input.branch,
    cloneUrl: input.cloneUrl,
    bugDescription: input.bugDescription,
    status: "queued",
    createdAt: now,
    updatedAt: now,
    workspaceId,
    timeline: initialTimeline(),
  };

  createInvestigation(investigation);

  // Fire-and-forget pipeline
  activeInvestigations.add(id);
  runPipeline(id, input.githubAccessToken).catch((err) => {
    console.error(`[investigation ${id}] Unhandled pipeline error:`, err);
    updateInvestigation(id, {
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }).finally(() => activeInvestigations.delete(id));

  return investigation;
}

/**
 * The main pipeline — runs fully server-side in a fire-and-forget manner.
 */
async function runPipeline(
  investigationId: string,
  githubToken: string,
  retryFrom?: string
): Promise<void> {
  const runner = getRunner();

  // The ordered list of step IDs — used to decide which steps to skip on retry.
  const STEP_ORDER = [
    "t_connect", "t_clone", "t_detect", "t_install",
    "t_baseline", "t_analyze", "t_reproduce", "t_rootcause",
    "t_regression", "t_fix", "t_verify",
  ];
  const retryFromIndex = retryFrom ? STEP_ORDER.indexOf(retryFrom) : 0;
  // Returns true when the step should execute (i.e. at or after the retry point).
  function shouldRun(stepId: string): boolean {
    if (!retryFrom) return true;
    const idx = STEP_ORDER.indexOf(stepId);
    return idx < 0 || idx >= retryFromIndex;
  }

  function update(
    status: InvestigationStatus,
    timeline: TimelineStep[],
    extra: Partial<Investigation> = {}
  ) {
    updateInvestigation(investigationId, { status, timeline, ...extra });
  }

  function fail(timeline: TimelineStep[], error: string) {
    updateInvestigation(investigationId, {
      status: "failed",
      error,
      timeline: timeline.map((s) =>
        s.status === "running" ? { ...s, status: "failed" } : s
      ),
    });
  }

  const inv = getInvestigation(investigationId);
  if (!inv?.workspaceId) {
    updateInvestigation(investigationId, { status: "failed", error: "Missing workspace" });
    return;
  }

  let timeline = inv.timeline;
  const repoPath = path.join(WORKSPACE_BASE, inv.workspaceId, "repo");

  try {
    // ── Step: connected ───────────────────────────────────────────────────────
    if (shouldRun("t_connect")) {
      timeline = stepStatus(timeline, "t_connect", "completed");
      update("cloning", timeline);
    }

    // ── Step: clone ───────────────────────────────────────────────────────────
    if (shouldRun("t_clone")) {
      timeline = stepStatus(timeline, "t_clone", "running");
      update("cloning", timeline);

      const cloneResult = await runner.prepareRepository({
        workspaceId: inv.workspaceId,
        cloneUrl: inv.cloneUrl,
        branch: inv.branch,
        githubToken,
      });

      if (!cloneResult.success) {
        timeline = stepStatus(timeline, "t_clone", "failed", cloneResult.error);
        fail(timeline, `Cloning failed: ${cloneResult.error}`);
        return;
      }

      timeline = stepStatus(timeline, "t_clone", "completed");
      update("preparing", timeline);
    }

    // ── Step: detect project ──────────────────────────────────────────────────
    // Always resolve projectInfo — later steps need it regardless of retry point.
    // On retry we use the stored value; on first run we detect and persist it.
    if (shouldRun("t_detect")) {
      timeline = stepStatus(timeline, "t_detect", "running");
      update("preparing", timeline);

      const detected = detectProject(repoPath);
      timeline = stepStatus(
        timeline,
        "t_detect",
        "completed",
        `${detected.language} / ${detected.packageManager} / ${detected.testFramework}`
      );
      updateInvestigation(investigationId, { projectInfo: detected });
    }

    // After the detect block, read back the freshest stored value (detect may
    // have just written it, or it was already stored from a previous run).
    const effectiveProjectInfo = getInvestigation(investigationId)?.projectInfo ?? detectProject(repoPath);

    if (!effectiveProjectInfo.supported) {
      fail(
        stepStatus(timeline, "t_install", "failed"),
        "TRACEFIX currently supports Node.js/TypeScript repositories only."
      );
      return;
    }

    // ── Step: install dependencies ────────────────────────────────────────────
    if (shouldRun("t_install")) {
      timeline = stepStatus(timeline, "t_install", "running");
      update("preparing", timeline);

    // npm ci requires package-lock.json (lockfileVersion >= 1).
    // When only package.json is present (no lockfile), use npm install instead.
    // --loglevel=error suppresses deprecation warnings (npm warn) so only real
    // errors appear in the timeline detail — warnings never fail the build.
    const commandsToTry = installCommands(
      effectiveProjectInfo.packageManager,
      fs.existsSync(path.join(repoPath, ".yarnrc.yml"))
    );
    // Cache dirs must be inside the runner user's home — /tmp is root-owned
    // inside the container and causes EACCES (-13) for the non-root runner user.
    const installEnv = {
      npm_config_cache: "/tmp/tracefix-npm-cache",
      npm_config_update_notifier: "false",
      npm_config_audit: "false",
      npm_config_fund: "false",
      PNPM_HOME: "/tmp/tracefix-pnpm-store",
      YARN_CACHE_FOLDER: "/tmp/tracefix-yarn-cache",
    };

    let installResult = await runner.runCommand({
      workspaceId: inv.workspaceId,
      command: commandsToTry[0],
      timeoutMs: 600_000,
      allowNetwork: true,
      runAsRoot: true,
      env: installEnv,
    });

    // Imported repositories frequently contain a stale lockfile. Retry once
    // with the same package manager; the workspace is disposable.
    if (installResult.exitCode !== 0 && commandsToTry[1]) {
      const retry = await runner.runCommand({
        workspaceId: inv.workspaceId,
        command: commandsToTry[1],
        timeoutMs: 600_000,
        allowNetwork: true,
        runAsRoot: true,
        env: installEnv,
      });
      installResult = {
        ...retry,
        stdout: `${installResult.stdout}\n${retry.stdout}`,
        stderr: `${installResult.stderr}\n${retry.stderr}`,
      };
    }

      if (installResult.exitCode === 0) {
        // npm may have created root-owned node_modules on WSL/Windows bind mounts.
        // Restore ownership before non-root tests and analysis access the repo.
        await runner.runCommand({
          workspaceId: inv.workspaceId,
          command: ["sh", "-c", "chown -R 1001:1001 /workspace/repo 2>/dev/null || true"],
          timeoutMs: 60_000,
          runAsRoot: true,
        });
      }

      if (installResult.exitCode !== 0) {
        // Combine stdout + stderr for the best chance of capturing the real error line.
        // Filter out any remaining "npm warn" lines so the message is signal, not noise.
        const fullOutput = (installResult.stdout + "\n" + installResult.stderr).trim();
        const detail = installError(fullOutput);
        timeline = stepStatus(timeline, "t_install", "failed", detail.slice(0, 200));
        fail(timeline, `Failed to install dependencies: ${detail}`);
        return;
      }

      timeline = stepStatus(timeline, "t_install", "completed");
      update("testing", timeline);
    } // end if(shouldRun("t_install"))

    // ── Step: baseline tests ──────────────────────────────────────────────────
    if (shouldRun("t_baseline")) {
      timeline = stepStatus(timeline, "t_baseline", "running");
      update("testing", timeline);

      let baselineTests = { total: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0, exitCode: -1, stdout: "", stderr: "" };

      if (effectiveProjectInfo.testCommand) {
        const testResult = await runner.runTests({
          workspaceId: inv.workspaceId,
          testCommand: effectiveProjectInfo.testCommand.split(" "),
          timeoutMs: 120_000,
        });
        baselineTests = testResult;
      }

      timeline = stepStatus(
        timeline,
        "t_baseline",
        "completed",
        baselineTests.total > 0
          ? `${baselineTests.passed}/${baselineTests.total} tests passed`
          : "No tests found"
      );
      updateInvestigation(investigationId, { baselineTests });

      // Update project info with baseline test results
      update("analyzing", stepStatus(
        stepStatus(timeline, "t_analyze", "running"),
        "t_reproduce",
        "pending"
      ), { projectInfo: effectiveProjectInfo, baselineTests });
    } // end if(shouldRun("t_baseline"))

    // ── Step: AI investigation ────────────────────────────────────────────────
    // This runs the full AI agent asynchronously
    const { runInvestigationAgent } = await import("../ai/agent");
    await runInvestigationAgent(investigationId);

    // Cleanup workspace after completion (optional — keep for debugging)
    // await runner.cleanup(inv.workspaceId);
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown pipeline error";
    fail(timeline, error);
  }
}

export function retryInvestigation(id: string, githubToken: string): Investigation {
  if (activeInvestigations.has(id)) {
    throw new Error("This investigation is already running");
  }

  const investigation = getInvestigation(id);
  if (!investigation) throw new Error("Investigation not found");
  if (investigation.status !== "failed" && investigation.status !== "cancelled") {
    throw new Error("Only failed or cancelled investigations can be retried");
  }

  const failedIndex = investigation.timeline.findIndex((step) => step.status === "failed");
  const retryFrom = failedIndex >= 0 ? investigation.timeline[failedIndex].id : "t_clone";
  const timeline = investigation.timeline.map((step, index) =>
    index >= Math.max(failedIndex, 0)
      ? { ...step, status: "pending" as const, timestamp: undefined, detail: undefined }
      : step
  );

  const reset = updateInvestigation(id, {
    status: "queued",
    timeline,
    error: undefined,
    report: undefined,
    baselineTests: undefined,
  });
  if (!reset) throw new Error("Investigation could not be reset");

  activeInvestigations.add(id);
  runPipeline(id, githubToken, retryFrom)
    .catch((err) => {
      updateInvestigation(id, {
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown pipeline error",
      });
    })
    .finally(() => activeInvestigations.delete(id));

  return reset;
}

// Re-export store functions for convenience
export {
  getInvestigation,
  updateInvestigation,
};
export { listInvestigations } from "./store";



















