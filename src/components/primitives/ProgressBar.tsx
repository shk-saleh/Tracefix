"use client";

import { motion } from "framer-motion";

type Variant = "default" | "success" | "error";

interface ProgressBarProps {
  value: number; // 0–100
  variant?: Variant;
  showLabel?: boolean;
  className?: string;
}

const TRACK_COLOR: Record<Variant, string> = {
  default: "#0f62fe",
  success: "#22c55e",
  error:   "#ef4444",
};

export default function ProgressBar({
  value,
  variant = "default",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = TRACK_COLOR[variant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Track */}
      <div className="flex-1 h-1 rounded-full bg-[#1e1e2e] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Optional numeric label */}
      {showLabel && (
        <span className="text-[11px] font-mono tabular-nums text-[#9ca3af] w-8 text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
