// ─── Repository ──────────────────────────────────────────────────────────────

export type RepoStatus = "connected" | "cloning" | "error" | "idle";

export interface RepositoryInfo {
  name: string;
  url: string;
  language: string;
  branch: string;
  fileCount: number;
  testCount: number;
  status: RepoStatus;
}

// ─── Bug Report ───────────────────────────────────────────────────────────────

export type BugReportStatus =
  | "draft"
  | "submitted"
  | "investigating"
  | "resolved"
  | "failed";

export interface BugReport {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  status: BugReportStatus;
  createdAt: string; // ISO date string
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export type AgentStatus = "pending" | "running" | "completed" | "failed";

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  currentTask: string;
  progress: number; // 0–100
  result?: string;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export type TimelineItemStatus = "pending" | "running" | "completed" | "failed";

export interface TimelineItem {
  id: string;
  label: string;
  status: TimelineItemStatus;
  timestamp?: string; // ISO date string
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export type EvidenceType =
  | "stack_trace"
  | "git_commit"
  | "related_file"
  | "missing_test"
  | "execution_trace";

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  content: string;
}

// ─── Root Cause ───────────────────────────────────────────────────────────────

export interface RootCause {
  file: string;
  line: number;
  issue: string;
  confidence: number; // 0–100
  evidenceIds: string[];
}

// ─── Regression Test ──────────────────────────────────────────────────────────

export type TestStatus = "pass" | "fail" | "pending";

export interface RegressionTest {
  testName: string;
  status: TestStatus;
  source: string; // raw test code
}

// ─── Verification ─────────────────────────────────────────────────────────────

export type VerificationStatus = "verified" | "failed" | "pending";

export interface Verification {
  bugReproduced: boolean;
  rootCauseVerified: boolean;
  regressionGenerated: boolean;
  existingTestsPassed: boolean;
  newTestsPassed: boolean;
  impactAnalyzed: boolean;
  overallStatus: VerificationStatus;
}

// ─── Investigation Metadata ───────────────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high";

export interface InvestigationMetadata {
  affectedFiles: string[];
  relatedCommits: { hash: string; message: string }[];
  confidence: number; // 0–100
  riskLevel: RiskLevel;
  executionTimeMs: number;
  estimatedTimeSavedHrs: number;
}

// ─── Investigation Phase ──────────────────────────────────────────────────────

export type InvestigationPhase =
  | "idle"
  | "cloning"
  | "indexing"
  | "reproducing"
  | "analyzing"
  | "patching"
  | "verifying"
  | "completed"
  | "failed";

// ─── Full Investigation Status ────────────────────────────────────────────────

export interface InvestigationStatus {
  investigationId: string;
  phase: InvestigationPhase;
  agents: Agent[];
  timeline: TimelineItem[];
  rootCause?: RootCause;
  diff?: string;
  regressionTest?: RegressionTest;
  verification?: Verification;
  evidence?: Evidence[];
  metadata?: InvestigationMetadata;
  repo?: RepositoryInfo;
  error?: string;
}
