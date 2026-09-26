import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: "up" | "down";
  className?: string;
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  className = "",
}: MetricCardProps) {
  return (
    <div
      className={`bg-[#111118] border border-[#1e1e2e] rounded-lg p-4 flex flex-col gap-2 ${className}`}
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-[#6b7280] font-medium">
          {label}
        </span>
        {Icon && <Icon size={14} className="text-[#6b7280]" aria-hidden="true" />}
      </div>

      {/* Value row */}
      <div className="flex items-end gap-1.5">
        <span className="text-xl font-semibold text-white tabular-nums leading-none">
          {value}
        </span>
        {trend === "up" && (
          <TrendingUp size={14} className="text-[#22c55e] mb-0.5" aria-label="Trending up" />
        )}
        {trend === "down" && (
          <TrendingDown size={14} className="text-[#ef4444] mb-0.5" aria-label="Trending down" />
        )}
      </div>
    </div>
  );
}
