"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface AnimatedTerminalProps {
  lines: string[];
  isRunning?: boolean;
  height?: number;
  className?: string;
}

export default function AnimatedTerminal({
  lines,
  isRunning = false,
  height = 240,
  className = "",
}: AnimatedTerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Auto-scroll to the latest line whenever lines change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [lines, shouldReduceMotion]);

  return (
    <div
      className={`rounded-lg border border-[#1e1e2e] overflow-hidden font-mono text-xs ${className}`}
      style={{ height }}
    >
      {/* Terminal title bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#0d0d14] border-b border-[#1e1e2e]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
        <span className="ml-2 text-[10px] text-[#6b7280] tracking-wider">terminal</span>
      </div>

      {/* Log area */}
      <div
        className="h-[calc(100%-33px)] overflow-y-auto px-3 py-2 bg-[#030a03]"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {lines.length === 0 && !isRunning && (
          <p className="text-[#6b7280] text-[11px] pt-1">No output yet.</p>
        )}
        <AnimatePresence initial={false}>
          {lines.map((line, i) => (
            <motion.div
              key={`${i}-${line}`}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
              className="leading-5 text-[#4ade80] whitespace-pre-wrap break-all"
            >
              <span className="text-[#22c55e] select-none mr-2">›</span>
              {line}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor when running */}
        {isRunning && (
          <motion.span
            className="inline-block w-2 h-3.5 bg-[#4ade80] ml-1 align-middle"
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: shouldReduceMotion ? 0 : Infinity }}
            aria-hidden="true"
          />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
