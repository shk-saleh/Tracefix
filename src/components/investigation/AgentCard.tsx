"use client";

import { motion } from "framer-motion";
import {
  Code2,
  GitCommit,
  FlaskConical,
  Search,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { type Agent } from "@/types/investigation";
import { StatusBadge, ProgressBar } from "@/components/primitives";

// Map well-known agent names to icons
const AGENT_ICONS: Record<string, React.ElementType> = {
  "Code Agent":    Code2,
  "History Agent": GitCommit,
  "Testing Agent": FlaskConical,
  "Search Agent":  Search,
  "Patch Agent":   ShieldCheck,
};

interface AgentCardProps {
  agent: Agent;
}

const accentColor: Record<Agent["status"], string> = {
  running:   "#0f62fe",
  completed: "#22c55e",
  failed:    "#ef4444",
  pending:   "#1e1e2e",
};

export default function AgentCard({ agent }: AgentCardProps) {
  const { name, status, currentTask, progress, result } = agent;
  const Icon = AGENT_ICONS[name] ?? Bot;
  const leftBorderColor = accentColor[status];

  const progressVariant =
    status === "completed" ? "success"
    : status === "failed"   ? "error"
    : "default";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" as const }}
      className="relative bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 flex flex-col gap-3 overflow-hidden"
      style={{ borderLeftColor: leftBorderColor, borderLeftWidth: 2 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${leftBorderColor}18` }}
          >
            <Icon size={14} style={{ color: leftBorderColor }} aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-white truncate">{name}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Current task */}
      <p className="text-xs text-[#9ca3af] leading-snug min-h-[32px]">
        {result && status === "completed"
          ? result
          : currentTask || "Waiting…"}
      </p>

      {/* Progress bar — only show when not pending */}
      {status !== "pending" && (
        <ProgressBar
          value={status === "completed" ? 100 : progress}
          variant={progressVariant}
          showLabel={status === "running"}
        />
      )}
    </motion.div>
  );
}
