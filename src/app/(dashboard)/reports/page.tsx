"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Investigation {
  id: string;
  repositoryName: string;
  owner: string;
  bugDescription: string;
  status: string;
  createdAt: string;
}

function statusConfig(status: string) {
  switch (status) {
    case "completed":
      return { Icon: CheckCircle2, label: "Verified", color: "text-[#22c55e]", bg: "bg-[#22c55e]/10" };
    case "failed":
      return { Icon: AlertCircle, label: "Failed", color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" };
    case "cancelled":
      return { Icon: XCircle, label: "Cancelled", color: "text-[#6F7078]", bg: "bg-white/[0.05]" };
    default:
      return { Icon: Loader2, label: "In Progress", color: "text-[#5865F2]", bg: "bg-[#5865F2]/10" };
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function ReportsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/investigations");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load reports");
        }
        const data = await res.json();
        // Only show completed investigations in reports
        setInvestigations(
          (data.investigations ?? []).filter((i: Investigation) =>
            ["completed", "failed"].includes(i.status)
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-[17px] font-semibold text-[#F5F5F5] tracking-tight">Reports</h1>
        <p className="text-[13px] text-[#6F7078]">
          Investigation reports and analysis summaries.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-[#ef4444]/8 border border-[#ef4444]/20 rounded-xl text-[13px] text-[#ef4444]">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-1.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-[64px] bg-[#19191C] border border-white/[0.06] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {investigations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <FileText size={18} className="text-[#6F7078]" />
              <p className="text-[13px] text-[#F5F5F5] font-medium">No reports yet</p>
              <p className="text-[12px] text-[#6F7078]">
                Completed investigations will appear here.
              </p>
              <Link href="/repositories" className="text-[12px] text-[#5865F2] hover:text-[#7c87f5] transition-colors">
                Start an Investigation →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {investigations.map((item) => {
                const cfg = statusConfig(item.status);
                const Icon = cfg.Icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-4 py-3.5 bg-[#19191C] border border-white/[0.07] rounded-xl hover:border-white/[0.12] transition-all duration-150"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#5865F2]/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-[#5865F2]" />
                    </div>

                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-[#F5F5F5] truncate">
                        {item.bugDescription.length > 80
                          ? item.bugDescription.slice(0, 80) + "…"
                          : item.bugDescription}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-[#6F7078]">
                        <span>{item.owner}/{item.repositoryName}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                      <Icon size={10} className="inline mr-1" />
                      {cfg.label}
                    </span>

                    <Link
                      href={`/report/${item.id}`}
                      className="flex items-center gap-1 text-[11px] text-[#5865F2] hover:text-[#7c87f5] transition-colors flex-shrink-0"
                    >
                      <ExternalLink size={12} />
                      View
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
