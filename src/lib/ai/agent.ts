/**
 * AI debugging agent orchestrator.
 * Lightweight — drives the investigation pipeline using controlled tools.
 */
import os from "os";
import path from "path";
import fs from "fs";
import { getAIProvider } from "./ollama";
import { getRunner } from "../runner/runner";
import {
  repositoryAnalystPrompt,
  codeInvestigatorPrompt,
  regressionTestPrompt,
} from "./prompts";
import { Investigation, InvestigationReport, EvidenceItem } from "../investigations/types";
import { updateInvestigation } from "../investigations/store";

const WORKSPACE_BASE = path.join(os.tmpdir(), "tracefix-workspaces");

function repoPath(workspaceId: string) {
  return path.join(WORKSPACE_BASE, workspaceId, "repo");
}

function listFilesRecursive(dir: string, depth = 4, base = ""): string[] {
  if (depth === 0) return [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const result: string[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
      const rel = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        result.push(...listFilesRecursive(path.join(dir, entry.name), depth - 1, rel));
      } else {
        result.push(rel);
      }
    }
    return result.slice(0, 200);
  } catch {
    return [];
  }
}

function readFileSafe(filePath: string, maxBytes = 8_000): string {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > maxBytes * 10) return "[file too large]";
    const content = fs.readFileSync(filePath, "utf-8");
    return content.length > maxBytes ? content.slice(0, maxBytes) + "\n... [truncated]" : content;
  } catch {
    return "[could not read file]";
  }
}

function safeJsonParse<T>(text: string, label?: string): T | null {
  try {
    // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonStr.trim()) as T;
  } catch (err) {
    if (label) {
      console.warn(`[tracefix] safeJsonParse failed for "${label}":`, err, "\nRaw text:\n", text.slice(0, 500));
    }
    return null;
  }
}

/**
 * Returns true when the string looks like a valid unified diff
 * (has at least one hunk header and at least one changed line).
 */
function isValidUnifiedDiff(diff: string): boolean {
  return /^@@\s+-\d+/m.test(diff) && /^[+-]/m.test(diff);
}

/**
 * Normalise a diff string from an LLM response:
 *  - Unescape literal \\n / \\t sequences that weren't decoded by JSON.parse
 *    (happens when the model double-encodes the string).
 *  - Strip Windows CRLF line endings (git apply rejects them).
 */
function normaliseDiff(diff: string): string {
  return diff
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

export async function runInvestigationAgent(
  investigationId: string
): Promise<void> {
  const ai = getAIProvider();
  const runner = getRunner();

  function addStep(label: string, status: "running" | "completed" | "failed", detail?: string) {
    const inv = getInvestigationSync(investigationId);
    if (!inv) return;
    const existing = inv.timeline.find((s) => s.label === label);
    if (existing) {
      updateInvestigation(investigationId, {
        timeline: inv.timeline.map((s) =>
          s.label === label ? { ...s, status, timestamp: new Date().toISOString(), detail } : s
        ),
      });
    } else {
      updateInvestigation(investigationId, {
        timeline: [
          ...inv.timeline,
          {
            id: `step_${Date.now()}`,
            label,
            status,
            timestamp: new Date().toISOString(),
            detail,
          },
        ],
      });
    }
  }

  try {
    const inv = getInvestigationSync(investigationId);
    if (!inv?.workspaceId) throw new Error("No workspace for investigation");

    const rp = repoPath(inv.workspaceId);

    // ── Step 1: Repository analysis ───────────────────────────────────────────
    addStep("Analyzing repository", "running");
    updateInvestigation(investigationId, { status: "analyzing" });

    const fileList = listFilesRecursive(rp);
    const pkgJsonContent = readFileSafe(path.join(rp, "package.json"));

    const analysisResponse = await ai.generate({
      prompt: repositoryAnalystPrompt({
        bugDescription: inv.bugDescription,
        fileList: fileList.join("\n"),
        packageJson: pkgJsonContent !== "[could not read file]" ? pkgJsonContent : undefined,
      }),
    });

    const analysis = safeJsonParse<{
      summary: string;
      suspectFiles: string[];
      investigationPlan: string;
      bugCategory: string;
    }>(analysisResponse.content);

    addStep("Analyzing repository", "completed", analysis?.summary);

    // ── Step 2: Code investigation ─────────────────────────────────────────────
    addStep("Investigating code", "running");

    const suspectFiles = analysis?.suspectFiles ?? fileList.filter(f => f.endsWith(".ts") || f.endsWith(".js")).slice(0, 5);
    const fileContents: Record<string, string> = {};
    for (const file of suspectFiles.slice(0, 6)) {
      fileContents[file] = readFileSafe(path.join(rp, file));
    }

    // Get git log
    const gitResult = await runner.runCommand({
      workspaceId: inv.workspaceId,
      command: ["git", "log", "--oneline", "-20"],
      timeoutMs: 10_000,
    });
    const gitLog = gitResult.exitCode === 0 ? gitResult.stdout : undefined;

    const codeResponse = await ai.generate({
      prompt: codeInvestigatorPrompt({
        bugDescription: inv.bugDescription,
        fileContents,
        gitLog,
      }),
    });

    const codeAnalysis = safeJsonParse<{
      rootCause: { summary: string; file: string; line: number; confidence: number };
      evidence: EvidenceItem[];
      fix: { description: string; diff: string };
    }>(codeResponse.content, "codeInvestigator");

    addStep("Investigating code", "completed");

    // ── Step 3: Regression test ────────────────────────────────────────────────
    addStep("Generating regression test", "running");

    let regressionTestFile: string | undefined;
    let regressionTestCode: string | undefined;

    if (codeAnalysis?.rootCause && inv.projectInfo?.testFramework) {
      const affectedContent = codeAnalysis.rootCause.file
        ? readFileSafe(path.join(rp, codeAnalysis.rootCause.file))
        : "";

      const testResponse = await ai.generate({
        prompt: regressionTestPrompt({
          bugDescription: inv.bugDescription,
          rootCause: codeAnalysis.rootCause.summary,
          affectedFile: codeAnalysis.rootCause.file,
          affectedCode: affectedContent,
          framework: inv.projectInfo.testFramework,
        }),
      });

      const testData = safeJsonParse<{
        testFileName: string;
        testCode: string;
        description: string;
      }>(testResponse.content);

      if (testData?.testCode && testData?.testFileName) {
        regressionTestFile = testData.testFileName;
        regressionTestCode = testData.testCode;

        // Write regression test to workspace
        const testDir = path.join(rp, "tracefix-tests");
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, testData.testFileName), testData.testCode);
      }
    }

    addStep("Generating regression test", "completed");

    // ── Step 4: Apply fix ──────────────────────────────────────────────────────
    addStep("Applying fix", "running");

    let fixApplied = false;
    const rawDiff = codeAnalysis?.fix?.diff ? normaliseDiff(codeAnalysis.fix.diff) : null;

    if (!rawDiff) {
      addStep("Applying fix", "failed", "No patch generated by AI");
    } else if (!isValidUnifiedDiff(rawDiff)) {
      // The model returned something in the diff field but it has no hunk headers.
      // Log it so we can inspect the actual content during debugging.
      console.warn("[tracefix] AI diff is not a valid unified diff:\n", rawDiff.slice(0, 400));
      addStep("Applying fix", "failed", "AI did not produce a valid unified diff (no @@ hunks found)");
    } else {
      const patchFile = path.join(WORKSPACE_BASE, inv.workspaceId, "fix.patch");
      fs.writeFileSync(patchFile, rawDiff);

      // Pass 1: strict check + apply (-p1 strips the a/ b/ prefix).
      const checkResult = await runner.runCommand({
        workspaceId: inv.workspaceId,
        command: ["sh", "-c", "git apply --check -p1 /workspace/fix.patch 2>&1"],
        timeoutMs: 15_000,
      });

      if (checkResult.exitCode === 0) {
        const applyResult = await runner.runCommand({
          workspaceId: inv.workspaceId,
          command: ["sh", "-c", "git apply -p1 /workspace/fix.patch 2>&1"],
          timeoutMs: 15_000,
        });
        if (applyResult.exitCode === 0) {
          fixApplied = true;
          addStep("Applying fix", "completed");
        } else {
          addStep("Applying fix", "failed",
            `git apply failed: ${(applyResult.stdout + applyResult.stderr).trim().slice(0, 200)}`);
        }
      } else {
        // Pass 2: 3-way merge — tolerates context lines that don't match exactly.
        const applyResult3way = await runner.runCommand({
          workspaceId: inv.workspaceId,
          command: ["sh", "-c", "git apply --3way -p1 /workspace/fix.patch 2>&1"],
          timeoutMs: 15_000,
        });
        if (applyResult3way.exitCode === 0) {
          fixApplied = true;
          addStep("Applying fix", "completed", "Applied via 3-way merge");
        } else {
          const reason = (checkResult.stdout + checkResult.stderr).trim().slice(0, 200);
          addStep("Applying fix", "failed", `Patch could not be applied: ${reason}`);
        }
      }
    }

    // ── Step 5: Verification ───────────────────────────────────────────────────
    addStep("Verifying fix", "running");

    let testsAfter = inv.baselineTests;
    if (fixApplied && inv.projectInfo?.testCommand) {
      const verifyResult = await runner.runTests({
        workspaceId: inv.workspaceId,
        testCommand: inv.projectInfo.testCommand.split(" "),
        timeoutMs: 120_000,
      });
      testsAfter = verifyResult;
    }

    addStep("Verifying fix", "completed");

    // ── Build report ───────────────────────────────────────────────────────────
    const report: InvestigationReport = {
      summary: analysis?.summary ?? "Investigation completed",
      reproduction: {
        reproduced: !!codeAnalysis?.rootCause,
        details: codeAnalysis?.rootCause?.summary ?? "Could not reproduce",
        regressionTestFile,
        regressionTestCode,
      },
      rootCause: {
        summary: codeAnalysis?.rootCause?.summary ?? "Unknown",
        files: codeAnalysis?.rootCause?.file ? [codeAnalysis.rootCause.file] : [],
        evidence: codeAnalysis?.evidence ?? [],
        confidence: codeAnalysis?.rootCause?.confidence ?? 0,
      },
      fix: codeAnalysis?.fix?.diff
        ? {
            filesChanged: codeAnalysis.rootCause?.file ? [codeAnalysis.rootCause.file] : [],
            diff: codeAnalysis.fix.diff,
            // Exclude the +++ / --- header lines from the counts
            linesAdded: (codeAnalysis.fix.diff.match(/^\+(?!\+\+)/gm) ?? []).length,
            linesRemoved: (codeAnalysis.fix.diff.match(/^-(?!--)/gm) ?? []).length,
          }
        : undefined,
      verification: {
        testsBefore: inv.baselineTests ?? { total: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0, exitCode: 0 },
        testsAfter,
      },
      status: fixApplied && testsAfter && testsAfter.failed === 0 ? "verified" : "partial",
    };

    updateInvestigation(investigationId, {
      status: "completed",
      report,
      timeline: getInvestigationSync(investigationId)?.timeline.map((s) => ({
        ...s,
        status: s.status === "running" ? "completed" : s.status,
      })),
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error during investigation";
    updateInvestigation(investigationId, {
      status: "failed",
      error,
      timeline: getInvestigationSync(investigationId)?.timeline.map((s) => ({
        ...s,
        status: s.status === "running" ? "failed" : s.status,
      })),
    });
  }
}

function getInvestigationSync(id: string): Investigation | null {
  // Inline import to avoid circular dependency
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getInvestigation } = require("../investigations/store") as typeof import("../investigations/store");
  return getInvestigation(id);
}
