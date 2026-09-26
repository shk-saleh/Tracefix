import { Search, Clock, CheckCircle2, AlertCircle } from "lucide-react";

// Stub investigation history entries
const STUB_HISTORY = [
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

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-white">Investigation History</h1>
        <p className="text-sm text-[#6b7280]">
          All past investigations and their outcomes.
        </p>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {STUB_HISTORY.map((item) => {
          const cfg = STATUS_CONFIG[item.status];
          const Icon = cfg.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 px-5 py-4 bg-[#111118] border border-[#1e1e2e] rounded-xl hover:border-[#2a2a3a] transition-colors"
            >
              {/* Status icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <Icon size={15} className={cfg.color} aria-hidden="true" />
              </div>

              {/* Main info */}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium text-white truncate">
                  {item.title}
                </span>
                <div className="flex items-center gap-3 text-[11px] text-[#6b7280]">
                  <span className="flex items-center gap-1">
                    <Search size={10} aria-hidden="true" />
                    {item.repo}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} aria-hidden="true" />
                    {item.date}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span
                className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#6b7280] px-1">
        Full history and filtering will be available in the next release.
      </p>
    </div>
  );
}
