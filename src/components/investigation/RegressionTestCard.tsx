"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ChevronDown, Loader2 } from "lucide-react";
import { type RegressionTest } from "@/types/investigation";
import { StatusBadge, SectionHeader } from "@/components/primitives";

// Lazy Monaco — same SSR-safe pattern as CodeDiffViewer
const MonacoEditorComponent = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[200px] bg-[#0d0d14]">
        <Loader2 size={14} className="text-[#6b7280] animate-spin" />
      </div>
    ),
  }
);

interface RegressionTestCardProps {
  test: RegressionTest;
}

export default function RegressionTestCard({ test }: RegressionTestCardProps) {
  const [expanded, setExpanded] = useState(false);

  const badgeStatus =
    test.status === "pass"    ? "pass"
    : test.status === "fail"  ? "fail"
    : "pending";

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-4">
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center flex-shrink-0">
          <FlaskConical size={15} className="text-[#8b5cf6]" aria-hidden="true" />
        </div>

        {/* Name + status */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <SectionHeader
            title="Regression Test"
            right={<StatusBadge status={badgeStatus} />}
          />
          <span className="text-xs font-mono text-[#9ca3af] truncate">
            {test.testName}
          </span>
        </div>

        {/* Expand / collapse button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white bg-[#1a1a24] hover:bg-[#242433] border border-[#1e1e2e] rounded-md transition-colors flex-shrink-0"
          aria-expanded={expanded}
          aria-controls="regression-test-source"
          aria-label={expanded ? "Collapse test source" : "Open test source"}
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={13} aria-hidden="true" />
          </motion.span>
          {expanded ? "Hide" : "Open Test"}
        </button>
      </div>

      {/* Collapsible Monaco source */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="regression-test-source"
            key="source"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" as const }}
            className="overflow-hidden border-t border-[#1e1e2e]"
          >
            <MonacoEditorComponent
              height={240}
              language="typescript"
              value={test.source}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                fontSize: 12,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 12, bottom: 12 },
                folding: false,
                overviewRulerLanes: 0,
                scrollbar: {
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
