"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  GitCommit,
  FileCode,
  FlaskConical,
  Activity,
  ChevronDown,
} from "lucide-react";
import { type Evidence, type EvidenceType } from "@/types/investigation";

const EVIDENCE_CONFIG: Record<
  EvidenceType,
  { icon: React.ElementType; color: string; label: string }
> = {
  stack_trace:     { icon: AlertCircle,  color: "#ef4444", label: "Stack Trace" },
  git_commit:      { icon: GitCommit,    color: "#f59e0b", label: "Git Commit" },
  related_file:    { icon: FileCode,     color: "#0f62fe", label: "Related File" },
  missing_test:    { icon: FlaskConical, color: "#8b5cf6", label: "Missing Test" },
  execution_trace: { icon: Activity,     color: "#06b6d4", label: "Execution Trace" },
};

interface EvidenceItemProps {
  evidence: Evidence;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function EvidenceItem({
  evidence,
  isExpanded,
  onToggle,
}: EvidenceItemProps) {
  const cfg = EVIDENCE_CONFIG[evidence.type];
  const Icon = cfg.icon;

  return (
    <div className="border border-[#1e1e2e] rounded-lg overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#111118] hover:bg-[#1a1a24] transition-colors text-left"
        aria-expanded={isExpanded}
        aria-controls={`evidence-${evidence.id}`}
      >
        {/* Type icon */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${cfg.color}15` }}
        >
          <Icon size={13} style={{ color: cfg.color }} aria-hidden="true" />
        </div>

        {/* Title + type label */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-xs font-semibold text-white truncate">
            {evidence.title}
          </span>
          <span className="text-[10px] font-mono" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={14} className="text-[#6b7280]" aria-hidden="true" />
        </motion.span>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`evidence-${evidence.id}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" as const }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 bg-[#0d0d14] border-t border-[#1e1e2e]">
              <pre className="text-[11px] font-mono text-[#9ca3af] leading-relaxed whitespace-pre-wrap break-words overflow-x-auto">
                {evidence.content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
