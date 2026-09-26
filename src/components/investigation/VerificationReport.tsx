"use client";

import { motion } from "framer-motion";
import { Check, X, CheckCircle2, XCircle } from "lucide-react";
import { type Verification } from "@/types/investigation";

interface VerificationReportProps {
  verification: Verification;
}

const CHECKLIST: {
  key: keyof Omit<Verification, "overallStatus">;
  label: string;
}[] = [
  { key: "bugReproduced",        label: "Bug Reproduced" },
  { key: "rootCauseVerified",    label: "Root Cause Verified" },
  { key: "regressionGenerated",  label: "Regression Test Generated" },
  { key: "existingTestsPassed",  label: "Existing Tests Passed" },
  { key: "newTestsPassed",       label: "New Tests Passed" },
  { key: "impactAnalyzed",       label: "Impact Analysis Completed" },
];

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function VerificationReport({ verification }: VerificationReportProps) {
  const isVerified = verification.overallStatus === "verified";
  const isFailed   = verification.overallStatus === "failed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" as const }}
      className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1e1e2e]">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#9ca3af]">
          Verification Report
        </span>
      </div>

      {/* Checklist */}
      <div className="px-5 py-4 flex flex-col gap-2.5">
        {CHECKLIST.map(({ key, label }, i) => {
          const passed = verification[key] as boolean;
          return (
            <motion.div
              key={key}
              custom={i}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3"
            >
              {/* Status icon */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  passed
                    ? "bg-[#22c55e]/15"
                    : "bg-[#ef4444]/15"
                }`}
              >
                {passed ? (
                  <Check size={11} className="text-[#22c55e]" aria-hidden="true" />
                ) : (
                  <X size={11} className="text-[#ef4444]" aria-hidden="true" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm ${passed ? "text-white" : "text-[#9ca3af]"}`}
              >
                {label}
              </span>

              {/* Right spacer + dot indicator */}
              <span className="ml-auto flex-shrink-0">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    passed ? "bg-[#22c55e]" : "bg-[#ef4444]"
                  }`}
                  aria-hidden="true"
                />
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Overall status banner */}
      <div
        className={`mx-4 mb-4 px-4 py-3 rounded-lg flex items-center gap-3 border ${
          isVerified
            ? "bg-[#22c55e]/8 border-[#22c55e]/25 text-[#86efac]"
            : isFailed
            ? "bg-[#ef4444]/8 border-[#ef4444]/25 text-[#fca5a5]"
            : "bg-[#f59e0b]/8 border-[#f59e0b]/25 text-[#fcd34d]"
        }`}
      >
        {isVerified ? (
          <CheckCircle2 size={16} aria-hidden="true" />
        ) : isFailed ? (
          <XCircle size={16} aria-hidden="true" />
        ) : null}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono font-bold uppercase tracking-widest">
            Overall:{" "}
            {isVerified ? "VERIFIED" : isFailed ? "FAILED" : "PENDING"}
          </span>
          <span className="text-[10px] opacity-70">
            {isVerified
              ? "Fix confirmed safe and effective"
              : isFailed
              ? "Investigation requires review"
              : "Verification in progress"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
