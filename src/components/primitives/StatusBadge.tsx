"use client";

import { motion, useReducedMotion } from "framer-motion";

export type Status =
  | "running"
  | "completed"
  | "failed"
  | "verified"
  | "pending"
  | "pass"
  | "fail";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const CONFIG: Record<
  Status,
  { label: string; dot: string; text: string; bg: string }
> = {
  running:   { label: "Running",   dot: "#0f62fe", text: "#93bbff", bg: "#0f62fe18" },
  completed: { label: "Completed", dot: "#22c55e", text: "#86efac", bg: "#22c55e18" },
  verified:  { label: "Verified",  dot: "#22c55e", text: "#86efac", bg: "#22c55e18" },
  pass:      { label: "Pass",      dot: "#22c55e", text: "#86efac", bg: "#22c55e18" },
  failed:    { label: "Failed",    dot: "#ef4444", text: "#fca5a5", bg: "#ef444418" },
  fail:      { label: "Fail",      dot: "#ef4444", text: "#fca5a5", bg: "#ef444418" },
  pending:   { label: "Pending",   dot: "#6b7280", text: "#9ca3af", bg: "#6b728018" },
};

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const cfg = CONFIG[status];
  const isRunning = status === "running";
  const shouldReduceMotion = useReducedMotion();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono tracking-wide ${className}`}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {/* Dot — pulses when running (respects prefers-reduced-motion) */}
      <motion.span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
        animate={
          isRunning && !shouldReduceMotion ? { opacity: [1, 0.3, 1] } : { opacity: 1 }
        }
        transition={
          isRunning && !shouldReduceMotion
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      />
      {cfg.label}
    </span>
  );
}
