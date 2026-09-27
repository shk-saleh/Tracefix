import { GitBranch, GitCommit, CheckCircle2 } from "lucide-react";

const STUB_REPOS = [
  {
    id: "repo-001",
    name: "acme-corp/payment-service",
    language: "TypeScript",
    branch: "main",
    lastCommit: "2025-01-15",
    status: "connected" as const,
    fileCount: 247,
    testCount: 84,
  },
  {
    id: "repo-002",
    name: "acme-corp/auth-service",
    language: "TypeScript",
    branch: "main",
    lastCommit: "2025-01-12",
    status: "connected" as const,
    fileCount: 132,
    testCount: 51,
  },
  {
    id: "repo-003",
    name: "acme-corp/realtime-service",
    language: "Go",
    branch: "develop",
    lastCommit: "2025-01-10",
    status: "connected" as const,
    fileCount: 89,
    testCount: 33,
  },
];

const LANG_COLOR: Record<string, string> = {
  TypeScript: "text-[#3b82f6] bg-[#3b82f6]/10",
  Go: "text-[#00acd7] bg-[#00acd7]/10",
  Python: "text-[#f59e0b] bg-[#f59e0b]/10",
};

export default function RepositoriesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-white">Repositories</h1>
        <p className="text-sm text-[#6b7280]">
          Connected repositories available for investigation.
        </p>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {STUB_REPOS.map((repo) => {
          const langCls = LANG_COLOR[repo.language] ?? "text-[#9ca3af] bg-[#9ca3af]/10";
          return (
            <div
              key={repo.id}
              className="flex items-center gap-4 px-5 py-4 bg-[#111118] border border-[#1e1e2e] rounded-xl hover:border-[#2a2a3a] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0f62fe]/10 flex items-center justify-center flex-shrink-0">
                <GitBranch size={15} className="text-[#0f62fe]" aria-hidden="true" />
              </div>

              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium text-white truncate">{repo.name}</span>
                <div className="flex items-center gap-3 text-[11px] text-[#6b7280]">
                  <span className="flex items-center gap-1">
                    <GitCommit size={10} aria-hidden="true" />
                    {repo.branch}
                  </span>
                  <span>{repo.fileCount} files</span>
                  <span>{repo.testCount} tests</span>
                  <span>Last commit {repo.lastCommit}</span>
                </div>
              </div>

              <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${langCls} flex-shrink-0`}>
                {repo.language}
              </span>

              <CheckCircle2 size={15} className="text-[#22c55e] flex-shrink-0" aria-hidden="true" />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#6b7280] px-1">
        Repository management and OAuth connection will be available in the next release.
      </p>
    </div>
  );
}
