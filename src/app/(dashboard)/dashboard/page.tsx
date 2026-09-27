"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  GitBranch,
  ArrowRight,
  Play,
  FileText,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface SessionUser {
  login: string;
  name: string | null;
  avatarUrl: string;
}

interface Investigation {
  id: string;
  repositoryName: string;
  owner: string;
  bugDescription: string;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  completed: number;
  failed: number;
  running: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 bg-[#19191C] border border-white/[0.07] rounded-xl hover:border-white/[0.11] transition-colors duration-150">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#6F7078] font-medium tracking-wide uppercase">
          {label}
        </span>
        <span className={`p-1.5 rounded-md bg-white/[0.05] ${color}`}>
          <Icon size={12} aria-hidden="true" />
        </span>
      </div>
      <span className="font-mono text-[22px] font-bold text-[#F5F5F5] leading-none">{value}</span>
    </div>
  );
}

function statusConfig(status: string) {
  switch (status) {
    case "completed":
      return { Icon: CheckCircle2, label: "Completed", color: "text-[#22c55e]" };
    case "failed":
      return { Icon: AlertCircle, label: "Failed", color: "text-[#ef4444]" };
    case "cancelled":
      return { Icon: XCircle, label: "Cancelled", color: "text-[#6F7078]" };
    default:
      return { Icon: Loader2, label: "Running", color: "text-[#5865F2]" };
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, failed: 0, running: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sessionRes, invRes] = await Promise.allSettled([
        fetch("/api/auth/session"),
        fetch("/api/investigations"),
      ]);

      if (sessionRes.status === "fulfilled" && sessionRes.value.ok) {
        const d = await sessionRes.value.json();
        if (d.authenticated) setUser(d.user);
      }

      if (invRes.status === "fulfilled" && invRes.value.ok) {
        const d = await invRes.value.json();
        const list: Investigation[] = d.investigations ?? [];
        setInvestigations(list.slice(0, 5));
        setStats({
          total: list.length,
          completed: list.filter((i) => i.status === "completed").length,
          failed: list.filter((i) => i.status === "failed").length,
          running: list.filter((i) => i.status === "running" || i.status === "pending").length,
        });
      }

      setLoading(false);
    }
    void load();
  }, []);

  return (
    <div className="flex flex-col gap-7 max-w-4xl">
      {/* Welcome header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[17px] font-semibold text-[#F5F5F5] tracking-tight">
          {user ? `Welcome back, ${user.name ?? user.login}` : "Dashboard"}
        </h1>
        <p className="text-[13px] text-[#6F7078]">
          AI-powered bug investigation and root-cause analysis.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard
          label="Total"
          value={loading ? "—" : stats.total}
          icon={Search}
          color="text-[#9A9AA3]"
        />
        <StatCard
          label="Completed"
          value={loading ? "—" : stats.completed}
          icon={CheckCircle2}
          color="text-[#22c55e]"
        />
        <StatCard
          label="Running"
          value={loading ? "—" : stats.running}
          icon={Clock}
          color="text-[#5865F2]"
        />
        <StatCard
          label="Failed"
          value={loading ? "—" : stats.failed}
          icon={AlertCircle}
          color="text-[#ef4444]"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6F7078]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Start new audit */}
          <button
            onClick={() => router.push("/repositories")}
            className="group flex items-center gap-3 px-4 py-3.5 bg-[#5865F2] hover:bg-[#4752c4] rounded-xl transition-all duration-200 text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <Play size={14} className="text-white" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-[13px] font-semibold text-white">Start Audit</span>
              <span className="text-[11px] text-white/60">
                Select a repo &amp; describe the bug
              </span>
            </div>
            <ArrowRight
              size={13}
              className="text-white/50 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
              aria-hidden="true"
            />
          </button>

          {/* View investigations */}
          <Link
            href="/history"
            className="group flex items-center gap-3 px-4 py-3.5 bg-[#19191C] hover:bg-[#1C1C20] border border-white/[0.07] hover:border-white/[0.12] rounded-xl transition-all duration-150"
          >
            <span className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
              <Search size={14} className="text-[#6F7078]" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-[13px] font-medium text-[#F5F5F5]">Investigations</span>
              <span className="text-[11px] text-[#6F7078]">Browse all runs</span>
            </div>
            <ArrowRight
              size={13}
              className="text-[#6F7078] group-hover:text-[#9A9AA3] flex-shrink-0 transition-colors"
              aria-hidden="true"
            />
          </Link>

          {/* Reports */}
          <Link
            href="/reports"
            className="group flex items-center gap-3 px-4 py-3.5 bg-[#19191C] hover:bg-[#1C1C20] border border-white/[0.07] hover:border-white/[0.12] rounded-xl transition-all duration-150"
          >
            <span className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
              <FileText size={14} className="text-[#6F7078]" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-[13px] font-medium text-[#F5F5F5]">Reports</span>
              <span className="text-[11px] text-[#6F7078]">Verified fix reports</span>
            </div>
            <ArrowRight
              size={13}
              className="text-[#6F7078] group-hover:text-[#9A9AA3] flex-shrink-0 transition-colors"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      {/* Recent investigations */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6F7078]">
            Recent Investigations
          </h2>
          <Link
            href="/history"
            className="text-[11px] text-[#5865F2] hover:text-[#7c87f5] transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[58px] bg-[#19191C] border border-white/[0.06] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : investigations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 bg-[#19191C] border border-white/[0.07] rounded-xl text-center">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center">
              <GitBranch size={16} className="text-[#6F7078]" />
            </div>
            <div>
              <p className="text-[13px] text-[#F5F5F5] font-medium">No investigations yet</p>
              <p className="text-[12px] text-[#6F7078] mt-1">
                Click &ldquo;Start Audit&rdquo; to investigate your first bug.
              </p>
            </div>
            <button
              onClick={() => router.push("/repositories")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5865F2] hover:bg-[#4752c4] text-white text-[12px] font-medium rounded-lg transition-colors"
            >
              <Play size={12} />
              Start Audit
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {investigations.map((inv) => {
              const { Icon, label, color } = statusConfig(inv.status);
              return (
                <Link
                  key={inv.id}
                  href={`/investigations/${inv.id}`}
                  className="group flex items-center gap-4 px-4 py-3 bg-[#19191C] border border-white/[0.07] hover:border-white/[0.13] rounded-xl transition-all duration-150"
                >
                  <Icon
                    size={14}
                    className={`${color} flex-shrink-0 ${inv.status === "running" || inv.status === "pending" ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-[#F5F5F5] truncate">
                      {inv.owner}/{inv.repositoryName}
                    </span>
                    <span className="text-[11px] text-[#6F7078] truncate">
                      {inv.bugDescription}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[11px] font-medium ${color}`}>{label}</span>
                    <span className="text-[11px] text-[#6F7078]/60">{formatDate(inv.createdAt)}</span>
                    <ArrowRight
                      size={13}
                      className="text-[#6F7078] group-hover:text-[#9A9AA3] transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
