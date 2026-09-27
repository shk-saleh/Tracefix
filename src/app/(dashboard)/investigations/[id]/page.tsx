"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Play,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface TimelineStep {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  timestamp?: string;
  detail?: string;
}

interface TestResult {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  exitCode: number;
}

interface InvestigationStatus {
  id: string;
  status: string;
  timeline: TimelineStep[];
  projectInfo?: {
    language: string;
    packageManager: string;
    testFramework?: string;
  };
  baselineTests?: TestResult;
  report?: {
    summary: string;
    reproduction: { reproduced: boolean; details: string; regressionTestFile?: string; regressionTestCode?: string };
    rootCause: { summary: string; files: string[]; confidence: number };
    fix?: { diff: string; filesChanged: string[]; linesAdded: number; linesRemoved: number };
    verification: { testsBefore: TestResult; testsAfter?: TestResult };
    status: string;
  };
  error?: string;
  updatedAt: string;
}

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);
const POLL_INTERVAL = 2000;

const STATUS_ICON = {
  pending: <span className="w-2 h-2 rounded-full bg-[#374151]" />,
  running: <Loader2 size={14} className="text-[#0f62fe] animate-spin" />,
  completed: <CheckCircle2 size={14} className="text-[#22c55e]" />,
  failed: <XCircle size={14} className="text-[#ef4444]" />,
};

const STATUS_COLOR: Record<string, string> = {
  queued: "text-[#6b7280]",
  cloning: "text-[#0f62fe]",
  preparing: "text-[#0f62fe]",
  analyzing: "text-[#f59e0b]",
  testing: "text-[#f59e0b]",
  completed: "text-[#22c55e]",
  failed: "text-[#ef4444]",
  cancelled: "text-[#6b7280]",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function InvestigationPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<InvestigationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/investigations/${id}/status`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/repositories");
          return;
        }
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Status request failed: ${res.status}`);
      }
      const status: InvestigationStatus = await res.json();
      setData(status);
      setLoading(false);

      if (TERMINAL_STATUSES.has(status.status)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Polling error");
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void poll();
    intervalRef.current = setInterval(
      () => { void poll(); },
      POLL_INTERVAL
    );
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  const retry = useCallback(async () => {
    setRetrying(true);
    setError(null);
    try {
      const res = await fetch(`/api/investigations/${id}/retry`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Retry failed: ${res.status}`);
      setData((current) => current ? { ...current, ...body.investigation, status: "queued" } : current);
      void poll();
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => { void poll(); }, POLL_INTERVAL);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setRetrying(false);
    }
  }, [id, poll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="animate-spin text-[#6b7280]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Link href="/history" className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors">
          <ArrowLeft size={12} /> Back to History
        </Link>
        <div className="flex items-start gap-3 px-4 py-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl">
          <AlertCircle size={15} className="text-[#ef4444] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#ef4444]">{error ?? "Investigation not found"}</p>
        </div>
      </div>
    );
  }

  const isTerminal = TERMINAL_STATUSES.has(data.status);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Back */}
      <Link href="/history" className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors w-fit">
        <ArrowLeft size={12} /> Back to History
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0f62fe]/10 flex items-center justify-center flex-shrink-0">
          <Play size={15} className="text-[#0f62fe]" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-white">Investigation</h1>
            <span className="font-mono text-xs text-[#6b7280]">{id}</span>
          </div>
          <span className={`text-xs font-medium capitalize ${STATUS_COLOR[data.status] ?? "text-[#6b7280]"}`}>
            {data.status}
            {!isTerminal && <Loader2 size={10} className="inline ml-1.5 animate-spin" />}
          </span>
        </div>
      </div>

      {isTerminal && (data.status === "failed" || data.status === "cancelled") && (
        <button
          onClick={() => void retry()}
          disabled={retrying}
          className="w-fit inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f62fe] text-white text-xs font-medium hover:bg-[#2878ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw size={13} className={retrying ? "animate-spin" : ""} />
          {retrying ? "Retrying…" : "Retry from failed stage"}
        </button>
      )}

      {/* Timeline */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
          Progress
        </h2>
        <div className="flex flex-col gap-2">
          {data.timeline.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-5 h-5 mt-0.5 flex-shrink-0">
                {STATUS_ICON[step.status]}
              </div>
              <div className="flex flex-col gap-0 flex-1 min-w-0">
                <span
                  className={`text-sm ${
                    step.status === "completed"
                      ? "text-[#9ca3af]"
                      : step.status === "running"
                      ? "text-white font-medium"
                      : step.status === "failed"
                      ? "text-[#ef4444]"
                      : "text-[#4b5563]"
                  }`}
                >
                  {step.label}
                </span>
                {step.detail && (
                  <span className="text-[11px] text-[#6b7280]">{step.detail}</span>
                )}
              </div>
              {step.timestamp && step.status === "completed" && (
                <span className="text-[11px] text-[#4b5563] flex-shrink-0 flex items-center gap-1">
                  <Clock size={9} />
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Project info */}
      {data.projectInfo && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
            Project
          </h2>
          <div className="flex gap-4 flex-wrap">
            <span className="text-xs text-[#9ca3af]">
              <span className="text-[#6b7280]">Language: </span>
              {data.projectInfo.language}
            </span>
            <span className="text-xs text-[#9ca3af]">
              <span className="text-[#6b7280]">Package Manager: </span>
              {data.projectInfo.packageManager}
            </span>
            {data.projectInfo.testFramework && (
              <span className="text-xs text-[#9ca3af]">
                <span className="text-[#6b7280]">Tests: </span>
                {data.projectInfo.testFramework}
              </span>
            )}
          </div>
          {data.baselineTests && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-[#6b7280]">Baseline:</span>
              <span className="text-xs font-mono text-[#22c55e]">
                {data.baselineTests.passed}/{data.baselineTests.total} passed
              </span>
              {data.baselineTests.failed > 0 && (
                <span className="text-xs font-mono text-[#ef4444]">
                  {data.baselineTests.failed} failed
                </span>
              )}
              <span className="text-xs text-[#6b7280]">
                ({(data.baselineTests.durationMs / 1000).toFixed(1)}s)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {data.error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl">
          <AlertCircle size={15} className="text-[#ef4444] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#ef4444]">{data.error}</p>
        </div>
      )}

      {/* Report */}
      {data.report && (
        <div className="flex flex-col gap-4">
          {/* Summary */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                Investigation Summary
              </h2>
              <span
                className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
                  data.report.status === "verified"
                    ? "bg-[#22c55e]/10 text-[#22c55e]"
                    : data.report.status === "partial"
                    ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                    : "bg-[#ef4444]/10 text-[#ef4444]"
                }`}
              >
                {data.report.status}
              </span>
            </div>
            <p className="text-sm text-[#9ca3af]">{data.report.summary}</p>
          </div>

          {/* Root cause */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
              Root Cause
            </h2>
            <p className="text-sm text-white">{data.report.rootCause.summary}</p>
            {data.report.rootCause.files.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.report.rootCause.files.map((f) => (
                  <span
                    key={f}
                    className="text-[11px] font-mono px-2 py-0.5 bg-[#1e1e2e] rounded text-[#9ca3af]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6b7280]">Confidence:</span>
              <div className="flex-1 max-w-[120px] h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0f62fe] rounded-full"
                  style={{ width: `${data.report.rootCause.confidence}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-[#9ca3af]">
                {data.report.rootCause.confidence}%
              </span>
            </div>
          </div>

          {/* Verification */}
          {data.report.verification && (
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                Verification
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#6b7280] uppercase tracking-wide">Before</span>
                  <span className="text-sm font-mono text-white">
                    {data.report.verification.testsBefore.passed}/
                    {data.report.verification.testsBefore.total}
                  </span>
                  <span className="text-[11px] text-[#6b7280]">tests passed</span>
                </div>
                {data.report.verification.testsAfter && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#6b7280] uppercase tracking-wide">After</span>
                    <span className="text-sm font-mono text-[#22c55e]">
                      {data.report.verification.testsAfter.passed}/
                      {data.report.verification.testsAfter.total}
                    </span>
                    <span className="text-[11px] text-[#6b7280]">tests passed</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fix diff */}
          {data.report.fix?.diff && (
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowDiff(!showDiff)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#1a1a24] transition-colors"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                  Fix Diff (+{data.report.fix.linesAdded} / -{data.report.fix.linesRemoved})
                </span>
                {showDiff ? (
                  <ChevronUp size={14} className="text-[#6b7280]" />
                ) : (
                  <ChevronDown size={14} className="text-[#6b7280]" />
                )}
              </button>
              {showDiff && (
                <pre className="px-5 pb-4 text-[11px] font-mono text-[#9ca3af] overflow-x-auto whitespace-pre bg-[#0a0a0f] leading-5">
                  {data.report.fix.diff.split("\n").map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith("+") && !line.startsWith("+++")
                          ? "text-[#22c55e]"
                          : line.startsWith("-") && !line.startsWith("---")
                          ? "text-[#ef4444]"
                          : line.startsWith("@@")
                          ? "text-[#0f62fe]"
                          : ""
                      }
                    >
                      {line}
                    </div>
                  ))}
                </pre>
              )}
            </div>
          )}

          {/* Regression test */}
          {data.report.reproduction.regressionTestCode && (
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowTest(!showTest)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#1a1a24] transition-colors"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                  Regression Test
                  {data.report.reproduction.regressionTestFile && (
                    <span className="ml-2 font-mono font-normal normal-case text-[#4b5563]">
                      {data.report.reproduction.regressionTestFile}
                    </span>
                  )}
                </span>
                {showTest ? (
                  <ChevronUp size={14} className="text-[#6b7280]" />
                ) : (
                  <ChevronDown size={14} className="text-[#6b7280]" />
                )}
              </button>
              {showTest && (
                <pre className="px-5 pb-4 text-[11px] font-mono text-[#9ca3af] overflow-x-auto whitespace-pre bg-[#0a0a0f] leading-5">
                  {data.report.reproduction.regressionTestCode}
                </pre>
              )}
            </div>
          )}

          {/* Link to full report */}
          <Link
            href={`/report/${id}`}
            className="flex items-center gap-1.5 text-xs text-[#0f62fe] hover:text-[#93bbff] transition-colors"
          >
            <FileText size={12} />
            View Full Report
          </Link>
        </div>
      )}
    </div>
  );
}



