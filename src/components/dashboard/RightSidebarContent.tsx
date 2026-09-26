import {
  GitBranch,
  FileCode,
  GitCommit,
  Clock,
  Zap,
  Timer,
} from "lucide-react";
import { type InvestigationStatus } from "@/types/investigation";
import { StatusBadge, ProgressBar, SectionHeader } from "@/components/primitives";
import { Separator } from "@/components/ui/separator";

interface RightSidebarContentProps {
  status: InvestigationStatus | null;
}

// ── Skeleton placeholder row ─────────────────────────────────────────────────
function SkeletonRow({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`h-3 rounded bg-[#1a1a24] animate-pulse ${wide ? "w-full" : "w-2/3"}`}
    />
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#6b7280]">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function RightSidebarContent({ status }: RightSidebarContentProps) {
  // ── Loading / empty state ──────────────────────────────────────────────────
  if (!status) {
    return (
      <div className="flex flex-col gap-5 px-4 py-5">
        <SectionHeader title="Investigation Details" />
        <Separator className="bg-[#1e1e2e]" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <SkeletonRow />
            <SkeletonRow wide />
            <SkeletonRow />
          </div>
        ))}
      </div>
    );
  }

  const { repo, metadata } = status;

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <SectionHeader title="Investigation Details" />
      <Separator className="bg-[#1e1e2e]" />

      {/* ── Repository ──────────────────────────────────────────────────── */}
      {repo && (
        <>
          <Section title="Repository">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <GitBranch size={12} className="text-[#6b7280] flex-shrink-0" aria-hidden="true" />
                <span className="text-xs font-mono text-white truncate">{repo.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#6b7280]">
                <span
                  className="flex items-center gap-1"
                  title={`Language: ${repo.language}`}
                >
                  <span
                    className="w-2 h-2 rounded-full bg-[#3178c6]"
                    style={{
                      backgroundColor:
                        repo.language === "TypeScript" ? "#3178c6"
                        : repo.language === "Python"   ? "#3572A5"
                        : repo.language === "Go"       ? "#00ADD8"
                        : "#6b7280",
                    }}
                  />
                  {repo.language}
                </span>
                <span className="font-mono">/{repo.branch}</span>
              </div>
            </div>
          </Section>
          <Separator className="bg-[#1e1e2e]" />
        </>
      )}

      {/* ── Affected Files ───────────────────────────────────────────────── */}
      {metadata && metadata.affectedFiles.length > 0 && (
        <>
          <Section title="Affected Files">
            <div className="flex flex-col gap-1">
              {metadata.affectedFiles.map((file) => (
                <div key={file} className="flex items-center gap-1.5">
                  <FileCode size={11} className="text-[#6b7280] flex-shrink-0" aria-hidden="true" />
                  <span className="text-[11px] font-mono text-[#9ca3af] truncate" title={file}>
                    {file}
                  </span>
                </div>
              ))}
            </div>
          </Section>
          <Separator className="bg-[#1e1e2e]" />
        </>
      )}

      {/* ── Related Commits ──────────────────────────────────────────────── */}
      {metadata && metadata.relatedCommits.length > 0 && (
        <>
          <Section title="Related Commits">
            <div className="flex flex-col gap-2">
              {metadata.relatedCommits.map((commit) => (
                <div key={commit.hash} className="flex items-start gap-2">
                  <GitCommit size={11} className="text-[#6b7280] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] font-mono text-[#0f62fe]">
                      {commit.hash.slice(0, 7)}
                    </span>
                    <span className="text-[11px] text-[#9ca3af] leading-snug truncate" title={commit.message}>
                      {commit.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <Separator className="bg-[#1e1e2e]" />
        </>
      )}

      {/* ── Analysis Metrics ─────────────────────────────────────────────── */}
      {metadata && (
        <>
          <Section title="Analysis">
            <div className="flex flex-col gap-3">
              {/* Confidence */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6b7280]">Confidence</span>
                  <span className="text-[11px] font-mono text-white">
                    {metadata.confidence}%
                  </span>
                </div>
                <ProgressBar
                  value={metadata.confidence}
                  variant={
                    metadata.confidence >= 80
                      ? "success"
                      : metadata.confidence >= 50
                      ? "default"
                      : "error"
                  }
                />
              </div>

              {/* Risk Level */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap size={11} className="text-[#6b7280]" aria-hidden="true" />
                  <span className="text-[11px] text-[#6b7280]">Risk Level</span>
                </div>
                <StatusBadge
                  status={
                    metadata.riskLevel === "low"    ? "completed"
                    : metadata.riskLevel === "medium" ? "running"
                    : "failed"
                  }
                />
              </div>

              {/* Execution Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-[#6b7280]" aria-hidden="true" />
                  <span className="text-[11px] text-[#6b7280]">Execution Time</span>
                </div>
                <span className="text-[11px] font-mono text-white">
                  {(metadata.executionTimeMs / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          </Section>
          <Separator className="bg-[#1e1e2e]" />

          {/* ── Time Saved ─────────────────────────────────────────────────── */}
          <Section title="Estimated Time Saved">
            <div className="flex items-end gap-1.5">
              <Timer size={13} className="text-[#0f62fe] mb-0.5" aria-hidden="true" />
              <span className="text-2xl font-bold font-mono text-white leading-none">
                {metadata.estimatedTimeSavedHrs.toFixed(1)}
              </span>
              <span className="text-xs text-[#6b7280] mb-0.5">hrs</span>
            </div>
            <p className="text-[10px] text-[#6b7280]">
              vs. manual debugging estimate
            </p>
          </Section>
        </>
      )}

      {/* Empty metadata fallback */}
      {!metadata && (
        <p className="text-xs text-[#6b7280]">
          Analysis metadata will appear once the investigation progresses.
        </p>
      )}
    </div>
  );
}
