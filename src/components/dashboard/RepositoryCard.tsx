import { GitBranch, FileCode, FlaskConical, Globe } from "lucide-react";
import { type RepositoryInfo } from "@/types/investigation";
import { StatusBadge, SectionHeader } from "@/components/primitives";

interface RepositoryCardProps {
  repo: RepositoryInfo;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python:     "#3572A5",
  Go:         "#00ADD8",
  Rust:       "#dea584",
  Java:       "#b07219",
  Ruby:       "#701516",
  default:    "#6b7280",
};

export default function RepositoryCard({ repo }: RepositoryCardProps) {
  const langColor = LANGUAGE_COLORS[repo.language] ?? LANGUAGE_COLORS.default;

  // Map RepoStatus → StatusBadge status
  const badgeStatus =
    repo.status === "connected" ? "completed"
    : repo.status === "cloning"   ? "running"
    : repo.status === "error"     ? "failed"
    : "pending";

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-4">
      <SectionHeader
        title="Repository"
        right={<StatusBadge status={badgeStatus} />}
      />

      {/* Repo name + URL */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#1a1a24] border border-[#1e1e2e] flex items-center justify-center flex-shrink-0">
          <GitBranch size={16} className="text-[#9ca3af]" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-mono text-sm font-semibold text-white truncate">
            {repo.name}
          </span>
          <span className="text-xs text-[#6b7280] truncate">{repo.url}</span>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {/* Language */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: langColor }}
            aria-hidden="true"
          />
          <span className="text-xs text-[#9ca3af]">{repo.language}</span>
        </div>

        {/* Branch */}
        <div className="flex items-center gap-1.5">
          <Globe size={12} className="text-[#6b7280] flex-shrink-0" aria-hidden="true" />
          <span className="text-xs text-[#9ca3af] font-mono">{repo.branch}</span>
        </div>

        {/* Files */}
        <div className="flex items-center gap-1.5">
          <FileCode size={12} className="text-[#6b7280] flex-shrink-0" aria-hidden="true" />
          <span className="text-xs text-[#9ca3af]">
            <span className="text-white font-medium">{repo.fileCount.toLocaleString()}</span>{" "}
            files
          </span>
        </div>

        {/* Tests */}
        <div className="flex items-center gap-1.5">
          <FlaskConical size={12} className="text-[#6b7280] flex-shrink-0" aria-hidden="true" />
          <span className="text-xs text-[#9ca3af]">
            <span className="text-white font-medium">{repo.testCount.toLocaleString()}</span>{" "}
            tests
          </span>
        </div>
      </div>
    </div>
  );
}
