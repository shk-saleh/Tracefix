import { FileText, Clock, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

const STUB_REPORTS = [
  {
    id: "demo-001",
    title: "Race condition in PaymentService causing double-charges",
    repo: "acme-corp/payment-service",
    date: "2025-01-15",
    status: "verified" as const,
  },
  {
    id: "demo-002",
    title: "Null pointer in UserAuthService on token refresh",
    repo: "acme-corp/auth-service",
    date: "2025-01-12",
    status: "verified" as const,
  },
  {
    id: "demo-003",
    title: "Memory leak in WebSocket connection pool",
    repo: "acme-corp/realtime-service",
    date: "2025-01-10",
    status: "failed" as const,
  },
];

const STATUS_CONFIG = {
  verified: {
    icon: CheckCircle2,
    label: "Verified",
    color: "text-[#22c55e]",
    bg: "bg-[#22c55e]/10",
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    color: "text-[#ef4444]",
    bg: "bg-[#ef4444]/10",
  },
};

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-white">Reports</h1>
        <p className="text-sm text-[#6b7280]">
          Downloadable investigation reports and analysis summaries.
        </p>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {STUB_REPORTS.map((item) => {
          const cfg = STATUS_CONFIG[item.status];
          const Icon = cfg.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 px-5 py-4 bg-[#111118] border border-[#1e1e2e] rounded-xl hover:border-[#2a2a3a] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0f62fe]/10 flex items-center justify-center flex-shrink-0">
                <FileText size={15} className="text-[#0f62fe]" aria-hidden="true" />
              </div>

              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium text-white truncate">{item.title}</span>
                <div className="flex items-center gap-3 text-[11px] text-[#6b7280]">
                  <span>{item.repo}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} aria-hidden="true" />
                    {item.date}
                  </span>
                </div>
              </div>

              <span
                className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}
              >
                <Icon size={10} className="inline mr-1" aria-hidden="true" />
                {cfg.label}
              </span>

              <Link
                href={`/report/${item.id}`}
                className="flex items-center gap-1 text-[11px] text-[#0f62fe] hover:text-[#93bbff] transition-colors flex-shrink-0"
                aria-label={`View report for ${item.title}`}
              >
                <ExternalLink size={12} aria-hidden="true" />
                View
              </Link>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#6b7280] px-1">
        PDF export and report sharing will be available in the next release.
      </p>
    </div>
  );
}
