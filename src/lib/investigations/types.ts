/**
 * Core investigation types used across the service layer.
 * These are separate from the existing frontend UI types in src/types/investigation.ts.
 */

export type InvestigationStatus =
  | "queued"
  | "cloning"
  | "preparing"
  | "analyzing"
  | "testing"
  | "completed"
  | "failed"
  | "cancelled";

export interface TestResult {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  exitCode: number;
  stdout?: string;
  stderr?: string;
}

export interface ProjectInfo {
  language: "typescript" | "javascript" | "unknown";
  packageManager: "npm" | "npm-install" | "pnpm" | "yarn" | "unknown";
  framework?: string;
  testFramework?: "jest" | "vitest" | "unknown";
  testCommand?: string;
  supported: boolean;
}

export interface EvidenceItem {
  type: "file" | "code" | "git" | "test" | "reproduction" | "execution";
  source: string;
  description: string;
  confidence?: number;
  content?: string;
}

export interface RootCauseAnalysis {
  summary: string;
  files: string[];
  evidence: EvidenceItem[];
  confidence: number;
}

export interface InvestigationReport {
  summary: string;
  reproduction: {
    reproduced: boolean;
    details: string;
    regressionTestFile?: string;
    regressionTestCode?: string;
  };
  rootCause: RootCauseAnalysis;
  fix?: {
    filesChanged: string[];
    diff: string;
    linesAdded: number;
    linesRemoved: number;
  };
  verification: {
    testsBefore: TestResult;
    testsAfter?: TestResult;
    typecheck?: { passed: boolean; output?: string };
  };
  status: "verified" | "failed" | "partial";
}

export interface TimelineStep {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  timestamp?: string;
  detail?: string;
}

export interface Investigation {
  id: string;
  repositoryId: string;
  repositoryName: string;
  owner: string;
  branch: string;
  cloneUrl: string;
  bugDescription: string;

  status: InvestigationStatus;

  createdAt: string;
  updatedAt: string;

  workspaceId?: string;

  timeline: TimelineStep[];

  baselineTests?: TestResult;
  projectInfo?: ProjectInfo;
  report?: InvestigationReport;
  error?: string;
}
