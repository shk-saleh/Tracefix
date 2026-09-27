import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getInvestigation } from "@/lib/investigations/store";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const investigation = getInvestigation(id);

  if (!investigation) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Link href="/reports" className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors">
          <ArrowLeft size={12} /> Back to Reports
        </Link>
        <div className="bg-[#111118] border border-[#ef4444]/20 rounded-xl p-6">
          <p className="text-sm text-[#ef4444]">Report not found for investigation ID: {id}</p>
        </div>
      </div>
    );
  }

  const report = investigation.report;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Back */}
      <Link href="/reports" className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors w-fit">
        <ArrowLeft size={12} /> Back to Reports
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0f62fe]/10 flex items-center justify-center">
          <FileText size={16} className="text-[#0f62fe]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Investigation Report</h1>
          <p className="text-xs font-mono text-[#6b7280]">
            {investigation.owner}/{investigation.repositoryName} · {investigation.branch}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Overview</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[11px] text-[#6b7280] block">Repository</span>
            <span className="text-white">{investigation.owner}/{investigation.repositoryName}</span>
          </div>
          <div>
            <span className="text-[11px] text-[#6b7280] block">Branch</span>
            <span className="text-white">{investigation.branch}</span>
          </div>
          <div>
            <span className="text-[11px] text-[#6b7280] block">Status</span>
            <span className={`capitalize font-medium ${investigation.status === "completed" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              {investigation.status}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#6b7280] block">Started</span>
            <span className="text-white">
              {new Date(investigation.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          </div>
        </div>
        <div>
          <span className="text-[11px] text-[#6b7280] block mb-1">Bug Description</span>
          <p className="text-sm text-[#9ca3af]">{investigation.bugDescription}</p>
        </div>
      </div>

      {!report ? (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6">
          <p className="text-sm text-[#6b7280]">
            {investigation.status === "failed"
              ? `Investigation failed: ${investigation.error ?? "Unknown error"}`
              : "Investigation is still in progress. Refresh to see the latest status."}
          </p>
          <Link
            href={`/investigations/${id}`}
            className="inline-flex items-center gap-1 mt-3 text-sm text-[#0f62fe] hover:text-[#93bbff] transition-colors"
          >
            View Investigation Progress →
          </Link>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Summary</h2>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                report.status === "verified" ? "bg-[#22c55e]/10 text-[#22c55e]" :
                report.status === "partial" ? "bg-[#f59e0b]/10 text-[#f59e0b]" :
                "bg-[#ef4444]/10 text-[#ef4444]"
              }`}>
                {report.status}
              </span>
            </div>
            <p className="text-sm text-[#9ca3af]">{report.summary}</p>
          </div>

          {/* Root cause */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Root Cause</h2>
            <p className="text-sm text-white">{report.rootCause.summary}</p>
            {report.rootCause.files.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {report.rootCause.files.map((f) => (
                  <span key={f} className="text-[11px] font-mono px-2 py-0.5 bg-[#1e1e2e] rounded text-[#9ca3af]">
                    {f}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6b7280]">Confidence:</span>
              <div className="flex-1 max-w-[100px] h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                <div className="h-full bg-[#0f62fe] rounded-full" style={{ width: `${report.rootCause.confidence}%` }} />
              </div>
              <span className="text-[11px] font-mono text-[#9ca3af]">{report.rootCause.confidence}%</span>
            </div>
          </div>

          {/* Evidence */}
          {report.rootCause.evidence.length > 0 && (
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Evidence</h2>
              <div className="flex flex-col gap-3">
                {report.rootCause.evidence.map((e, i) => (
                  <div key={i} className="border-l-2 border-[#0f62fe]/40 pl-3">
                    <p className="text-[11px] text-[#6b7280] uppercase tracking-wide">{e.type}</p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{e.description}</p>
                    {e.source && (
                      <p className="text-[11px] font-mono text-[#4b5563] mt-0.5">{e.source}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fix */}
          {report.fix && (
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                Fix (+{report.fix.linesAdded} / -{report.fix.linesRemoved} lines)
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {report.fix.filesChanged.map((f) => (
                  <span key={f} className="text-[11px] font-mono px-2 py-0.5 bg-[#1e1e2e] rounded text-[#9ca3af]">
                    {f}
                  </span>
                ))}
              </div>
              <pre className="text-[11px] font-mono text-[#9ca3af] overflow-x-auto whitespace-pre bg-[#0a0a0f] rounded-lg p-3 leading-5">
                {report.fix.diff.split("\n").map((line, i) => (
                  <div key={i} className={
                    line.startsWith("+") && !line.startsWith("+++") ? "text-[#22c55e]" :
                    line.startsWith("-") && !line.startsWith("---") ? "text-[#ef4444]" :
                    line.startsWith("@@") ? "text-[#0f62fe]" : ""
                  }>
                    {line}
                  </div>
                ))}
              </pre>
            </div>
          )}

          {/* Verification */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Tests</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b7280] uppercase tracking-wide">Before Fix</span>
                <span className="text-sm font-mono text-white">
                  {report.verification.testsBefore.passed}/{report.verification.testsBefore.total}
                </span>
                <span className="text-[11px] text-[#6b7280]">tests passed</span>
                {report.verification.testsBefore.failed > 0 && (
                  <span className="text-[11px] font-mono text-[#ef4444]">
                    {report.verification.testsBefore.failed} failed
                  </span>
                )}
              </div>
              {report.verification.testsAfter && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#6b7280] uppercase tracking-wide">After Fix</span>
                  <span className="text-sm font-mono text-[#22c55e]">
                    {report.verification.testsAfter.passed}/{report.verification.testsAfter.total}
                  </span>
                  <span className="text-[11px] text-[#6b7280]">tests passed</span>
                  {report.verification.testsAfter.failed > 0 && (
                    <span className="text-[11px] font-mono text-[#ef4444]">
                      {report.verification.testsAfter.failed} failed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Regression test */}
          {report.reproduction.regressionTestCode && (
            <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                Regression Test
                {report.reproduction.regressionTestFile && (
                  <span className="ml-2 font-mono font-normal normal-case text-[#4b5563]">
                    {report.reproduction.regressionTestFile}
                  </span>
                )}
              </h2>
              <pre className="text-[11px] font-mono text-[#9ca3af] overflow-x-auto whitespace-pre bg-[#0a0a0f] rounded-lg p-3 leading-5">
                {report.reproduction.regressionTestCode}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
