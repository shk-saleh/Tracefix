"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  XCircle,
  Play,
  GitBranch,
} from "lucide-react";
const Github = GitBranch;
import Link from "next/link";

interface Investigation {
  id: string;
  repositoryName: string;
  owner: string;
  branch: string;
  bugDescription: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusConfig(status: string) {
  switch (status) {
    case "completed":
      return { Icon: CheckCircle2, label: "Completed", color: "text-[#22c55e]", bg: "bg-[#22c55e]/10" };
    case "failed":
      return { Icon: AlertCircle, label: "Failed", color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" };
    case "cancelled":
      return { Icon: XCircle, label: "Cancelled", color: "text-[#6F7078]", bg: "bg-white/[0.05]" };
    default:
      return { Icon: Loader2, label: "Running", color: "text-[#5865F2]", bg: "bg-[#5865F2]/10" };
  }
}

export default function HistoryPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/investigations");
        if (res.status === 401) {
          setAuthenticated(false);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load investigations");
        }
        const data = await res.json();
        setAuthenticated(true);
        setInvestigations(data.investigations ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load investigations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = search.trim()
    ? investigations.filter(
        (i) =>
          i.bugDescription.toLowerCase().includes(search.toLowerCase()) ||
          `${i.owner}/${i.repositoryName}`.toLowerCase().includes(search.toLowerCase())
      )
    : investigations;

  if (authenticated === false) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="flex flex-col gap-1">
          <h1 className="text-[17px] font-semibold text-[#F5F5F5] tracking-tight">Investigation History</h1>
          <p className="text-[13px] text-[#6F7078]">Connect GitHub to see investigation history.</p>
        </div>
        <div className="flex flex-col items-center gap-4 py-12 bg-[#19191C] border border-white/[0.07] rounded-xl">
          <Github size={20} className="text-[#6F7078]" />
          <p className="text-[13px] text-[#6F7078]">Please connect your GitHub account first.</p>
          <a
            href="/api/auth/github/login"
            className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Github size={14} />
            Connect GitHub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-[17px] font-semibold text-[#F5F5F5] tracking-tight">Investigation History</h1>
        <p className="text-[13px] text-[#6F7078]">
          {loading
            ? "Loading investigations…"
            : `${investigations.length} investigation${investigations.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7078]" />
        <input
          type="text"
          placeholder="Search investigations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#19191C] border border-white/[0.07] rounded-xl text-[13px] text-[#F5F5F5] placeholder:text-[#6F7078] focus:outline-none focus:border-[#5865F2]/50 transition-colors"
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-[#ef4444]/8 border border-[#ef4444]/20 rounded-xl text-[13px] text-[#ef4444]">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[64px] bg-[#19191C] border border-white/[0.06] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Play size={18} className="text-[#6F7078]" />
              <p className="text-[13px] text-[#F5F5F5] font-medium">No investigations yet</p>
              <p className="text-[12px] text-[#6F7078]">
                Select a repository and start your first investigation.
              </p>
              <Link
                href="/repositories"
                className="text-[12px] text-[#5865F2] hover:text-[#7c87f5] transition-colors"
              >
                Browse Repositories →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filtered.map((item) => {
                const cfg = statusConfig(item.status);
                const Icon = cfg.Icon;
                const isRunning = !["completed", "failed", "cancelled"].includes(item.status);
                return (
                  <Link
                    key={item.id}
                    href={`/investigations/${item.id}`}
                    className="group flex items-center gap-4 px-4 py-3.5 bg-[#19191C] border border-white/[0.07] rounded-xl hover:border-white/[0.13] transition-all duration-150"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon
                        size={14}
                        className={`${cfg.color} ${isRunning ? "animate-spin" : ""}`}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-[#F5F5F5] truncate">
                        {item.bugDescription.length > 80
                          ? item.bugDescription.slice(0, 80) + "…"
                          : item.bugDescription}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-[#6F7078]">
                        <span className="flex items-center gap-1">
                          <Search size={10} />
                          {item.owner}/{item.repositoryName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0 capitalize`}>
                      {cfg.label}
                    </span>
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
