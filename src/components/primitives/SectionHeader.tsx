import { type ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  right,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-white tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-[#6b7280]">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}
