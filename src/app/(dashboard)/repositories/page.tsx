"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  GitBranch,
  Star,
  Lock,
  Globe,
  Search,
  RefreshCw,
  ArrowRight,
  Clock,
} from "lucide-react";
const Github = GitBranch;
import Link from "next/link";

interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  language: string | null;
  stars: number;
  updatedAt: string | null;
  visibility: string;
}

const LANG_COLOR: Record<string, string> = {
  TypeScript: "text-[#3b82f6] bg-[#3b82f6]/10",
  JavaScript: "text-[#f59e0b] bg-[#f59e0b]/10",
  Python: "text-[#f59e0b] bg-[#f59e0b]/10",
  Go: "text-[#00acd7] bg-[#00acd7]/10",
  Rust: "text-[#f97316] bg-[#f97316]/10",
  Java: "text-[#ef4444] bg-[#ef4444]/10",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return repos;
    const q = search.toLowerCase();
    return repos.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.language ?? "").toLowerCase().includes(q)
    );
  }, [search, repos]);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github/repositories");
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setAuthenticated(true);
      setRepos(data.repositories ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchRepos();
  }, [fetchRepos]);

  // Not authenticated
  if (authenticated === false) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-white">Repositories</h1>
          <p className="text-sm text-[#6b7280]">
            Connect your GitHub account to see repositories.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 py-12 bg-[#111118] border border-[#1e1e2e] rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-[#1e1e2e] flex items-center justify-center">
            <Github size={22} className="text-[#6b7280]" />
          </div>
          <div className="text-center">
            <p className="text-sm text-white font-medium">GitHub not connected</p>
            <p className="text-xs text-[#6b7280] mt-1">
              Connect your GitHub account to browse and investigate repositories.
            </p>
          </div>
          <a
            href="/api/auth/github/login"
            className="flex items-center gap-2 px-4 py-2 bg-[#0f62fe] hover:bg-[#0f62fe]/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Github size={15} />
            Connect GitHub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-white">Repositories</h1>
          <p className="text-sm text-[#6b7280]">
            {loading
              ? "Loading repositories…"
              : `${repos.length} repository${repos.length !== 1 ? "s" : ""} available for investigation`}
          </p>
        </div>
        <button
          onClick={fetchRepos}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6b7280] hover:text-white border border-[#1e1e2e] hover:border-[#2a2a3a] rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search repositories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#111118] border border-[#1e1e2e] rounded-xl text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:border-[#0f62fe] transition-colors"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="px-4 py-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-sm text-[#ef4444]">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[72px] bg-[#111118] border border-[#1e1e2e] rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Repository list */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Search size={20} className="text-[#6b7280]" />
              <p className="text-sm text-[#6b7280]">
                {search ? `No repositories matching "${search}"` : "No repositories found"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((repo) => {
                const langCls =
                  repo.language && LANG_COLOR[repo.language]
                    ? LANG_COLOR[repo.language]
                    : "text-[#9ca3af] bg-[#9ca3af]/10";
                return (
                  <Link
                    key={repo.id}
                    href={`/repositories/${repo.owner}/${repo.name}`}
                    className="group flex items-center gap-4 px-5 py-4 bg-[#111118] border border-[#1e1e2e] rounded-xl hover:border-[#0f62fe]/40 hover:bg-[#111118]/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0f62fe]/10 flex items-center justify-center flex-shrink-0">
                      <GitBranch size={15} className="text-[#0f62fe]" aria-hidden="true" />
                    </div>

                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {repo.fullName}
                        </span>
                        {repo.private ? (
                          <Lock size={11} className="text-[#6b7280] flex-shrink-0" />
                        ) : (
                          <Globe size={11} className="text-[#6b7280] flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#6b7280]">
                        <span className="flex items-center gap-1">
                          <GitBranch size={10} aria-hidden="true" />
                          {repo.defaultBranch}
                        </span>
                        {repo.stars > 0 && (
                          <span className="flex items-center gap-1">
                            <Star size={10} aria-hidden="true" />
                            {repo.stars}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={10} aria-hidden="true" />
                          {formatDate(repo.updatedAt)}
                        </span>
                        {repo.description && (
                          <span className="truncate max-w-[200px]">{repo.description}</span>
                        )}
                      </div>
                    </div>

                    {repo.language && (
                      <span
                        className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${langCls} flex-shrink-0`}
                      >
                        {repo.language}
                      </span>
                    )}

                    <ArrowRight
                      size={14}
                      className="text-[#6b7280] group-hover:text-[#0f62fe] flex-shrink-0 transition-colors"
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
