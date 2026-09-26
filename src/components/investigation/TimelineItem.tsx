"use client";

import { motion } from "framer-motion";
import { Check, X, Loader2, Circle } from "lucide-react";
import { type TimelineItem as TTimelineItem } from "@/types/investigation";

interface TimelineItemProps {
  item: TTimelineItem;
  index: number;
  isLast: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function TimelineItem({ item, index, isLast }: TimelineItemProps) {
  const { status, label, timestamp } = item;

  const iconNode = (() => {
    switch (status) {
      case "completed":
        return (
          <span className="w-5 h-5 rounded-full bg-[#22c55e]/15 flex items-center justify-center flex-shrink-0 z-10">
            <Check size={11} className="text-[#22c55e]" aria-hidden="true" />
          </span>
        );
      case "running":
        return (
          <span className="w-5 h-5 rounded-full bg-[#0f62fe]/15 flex items-center justify-center flex-shrink-0 z-10">
            <Loader2 size={11} className="text-[#0f62fe] animate-spin" aria-hidden="true" />
          </span>
        );
      case "failed":
        return (
          <span className="w-5 h-5 rounded-full bg-[#ef4444]/15 flex items-center justify-center flex-shrink-0 z-10">
            <X size={11} className="text-[#ef4444]" aria-hidden="true" />
          </span>
        );
      default: // pending
        return (
          <span className="w-5 h-5 rounded-full bg-[#1e1e2e] flex items-center justify-center flex-shrink-0 z-10">
            <Circle size={8} className="text-[#6b7280]" aria-hidden="true" />
          </span>
        );
    }
  })();

  const labelColor =
    status === "completed" ? "text-white"
    : status === "running"   ? "text-[#93bbff]"
    : status === "failed"    ? "text-[#fca5a5]"
    : "text-[#6b7280]";

  return (
    <motion.li
      custom={index}
      variants={itemVariants}
      className="flex items-start gap-3 relative"
      aria-label={`${label}: ${status}`}
    >
      {/* Vertical connecting line */}
      {!isLast && (
        <span
          className="absolute left-[9px] top-5 w-px bg-[#1e1e2e]"
          style={{ height: "calc(100% + 8px)" }}
          aria-hidden="true"
        />
      )}

      {iconNode}

      <div className="flex flex-col gap-0.5 pb-5 min-w-0">
        <span className={`text-xs font-medium leading-none ${labelColor}`}>
          {label}
        </span>
        {timestamp && (
          <span className="text-[10px] text-[#6b7280] font-mono">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}
      </div>
    </motion.li>
  );
}
