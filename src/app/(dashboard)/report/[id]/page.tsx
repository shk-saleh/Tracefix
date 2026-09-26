import { FileText, ExternalLink } from "lucide-react";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0f62fe]/10 flex items-center justify-center">
          <FileText size={16} className="text-[#0f62fe]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Investigation Report</h1>
          <p className="text-xs font-mono text-[#6b7280]">ID: {id}</p>
        </div>
      </div>

      {/* Placeholder card */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 flex flex-col gap-3">
        <p className="text-sm text-[#9ca3af]">
          The full downloadable investigation report will be available in the next release.
          It will include root cause analysis, code diff, regression test results, and
          a complete evidence chain.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#0f62fe] hover:text-[#93bbff] transition-colors"
        >
          <ExternalLink size={13} aria-hidden="true" />
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
