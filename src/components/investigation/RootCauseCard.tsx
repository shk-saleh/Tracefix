"use client";

import { motion } from "framer-motion";
import { FileCode, Hash, Zap, Target } from "lucide-react";
import { type RootCause } from "@/types/investigation";
import { ProgressBar } from "@/components/primitives";
import { Button } from "@/components/ui/button";

interface RootCauseCardProps {
  rootCause: RootCause;
  onViewEvidence: () => void;
}

const GRID_ITEMS = (rc: RootCause) => [
  {
    icon: FileCode,
    label: "File",
    value: rc.file,
    mono: true,
    color: "#0f62fe",
  },
  {
    icon: Hash,
    label: "Line",
    value: `${rc.line}`,
    mono: true,
    color: "#8b5cf6",
  },
  {
    icon: Zap,
    label: "Issue",
    value: rc.issue,
    mono: false,
    color: "#f59e0b",
  },
  {
    icon: Target,
    label: "Confidence",
    value: `${rc.confidence}%`,
    mono: true,
    color: "#22c55e",
    progress: rc.confidence,
  },
];

export default function RootCauseCard({
  rootCause,
  onViewEvidence,
}: RootCauseCardProps) {
  const items = GRID_ITEMS(rootCause);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const }}
      className="relative bg-[#111118] border border-[#0f62fe]/25 rounded-xl p-5 flex flex-col gap-5 overflow-hidden"
    >
      {/* Subtle top glow */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #0f62fe60, transparent)",
        }}
        aria-hidden="true"
      />

      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase bg-[#0f62fe]/15 text-[#93bbff]">
          Root Cause
        </span>
        <div className="flex-1 h-px bg-[#0f62fe]/15" aria-hidden="true" />
      </div>

      {/* 2×2 detail grid */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex flex-col gap-1.5 bg-[#0d0d14] border border-[#1e1e2e] rounded-lg p-3"
            >
              <div className="flex items-center gap-1.5">
                <Icon size={11} style={{ color: item.color }} aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-wider text-[#6b7280] font-medium">
                  {item.label}
                </span>
              </div>
              <span
                className={`text-sm font-semibold text-white truncate ${
                  item.mono ? "font-mono" : ""
                }`}
                title={item.value}
              >
                {item.value}
              </span>
              {"progress" in item && item.progress !== undefined && (
                <ProgressBar
                  value={item.progress}
                  variant="success"
                  className="mt-0.5"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* View Evidence CTA */}
      <Button
        onClick={onViewEvidence}
        variant="outline"
        className="w-full border-[#0f62fe]/40 text-[#93bbff] hover:bg-[#0f62fe]/10 hover:border-[#0f62fe]/60 hover:text-white bg-transparent text-sm font-medium h-9 transition-colors"
        aria-label="View investigation evidence"
      >
        View Evidence
        <span className="ml-1.5 text-[10px] font-mono bg-[#0f62fe]/15 px-1.5 py-0.5 rounded text-[#93bbff]">
          {rootCause.evidenceIds.length}
        </span>
      </Button>
    </motion.div>
  );
}
