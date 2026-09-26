"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { type InvestigationStatus } from "@/types/investigation";
import { SectionHeader } from "@/components/primitives";
import Timeline from "./Timeline";
import AgentGrid from "./AgentGrid";
import RootCauseCard from "./RootCauseCard";
import EvidenceDrawer from "./EvidenceDrawer";
import CodeDiffViewer from "./CodeDiffViewer";
import RegressionTestCard from "./RegressionTestCard";
import VerificationReport from "./VerificationReport";

interface InvestigationCenterProps {
  status: InvestigationStatus;
}

const PHASE_LABELS: Record<string, string> = {
  idle:        "Initializing…",
  cloning:     "Cloning repository…",
  indexing:    "Indexing codebase…",
  reproducing: "Reproducing bug…",
  analyzing:   "Analyzing root cause…",
  patching:    "Generating patch…",
  verifying:   "Verifying fix…",
  completed:   "Investigation complete",
  failed:      "Investigation failed",
};

export default function InvestigationCenter({ status }: InvestigationCenterProps) {
  const { phase, timeline, agents, rootCause, diff, regressionTest, verification, evidence = [] } = status;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const phaseLabel = PHASE_LABELS[phase] ?? phase;
  const isTerminal = phase === "completed" || phase === "failed";
  const isSuccess  = phase === "completed";

  return (
    <div className="flex flex-col gap-6">
      {/* Phase banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.25 }}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium ${
            isTerminal
              ? isSuccess
                ? "bg-[#22c55e]/8 border-[#22c55e]/20 text-[#86efac]"
                : "bg-[#ef4444]/8 border-[#ef4444]/20 text-[#fca5a5]"
              : "bg-[#0f62fe]/8 border-[#0f62fe]/20 text-[#93bbff]"
          }`}
        >
          {isTerminal ? (
            isSuccess ? (
              <CheckCircle2 size={15} aria-hidden="true" />
            ) : (
              <XCircle size={15} aria-hidden="true" />
            )
          ) : (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          )}
          {phaseLabel}
        </motion.div>
      </AnimatePresence>

      {/* Main two-column layout: timeline left, agents right */}
      <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
        {/* Left — Timeline */}
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Timeline"
            subtitle={`${timeline.filter(t => t.status === "completed").length}/${timeline.length} steps`}
          />
          <Timeline items={timeline} />
        </div>

        {/* Right — Agents */}
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Active Agents"
            subtitle={`${agents.filter(a => a.status === "running").length} running`}
          />
          <AgentGrid agents={agents} />
        </div>
      </div>

      {/* Root Cause — only when available */}
      <AnimatePresence>
        {rootCause && (
          <motion.div
            key="root-cause"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionHeader
              title="Root Cause"
              subtitle="Identified with high confidence"
              className="mb-3"
            />
            <RootCauseCard
              rootCause={rootCause}
              onViewEvidence={() => setDrawerOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Code Diff — shown when patch is available */}
      <AnimatePresence>
        {diff && (
          <motion.div
            key="diff"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3"
          >
            <SectionHeader
              title="Code Diff"
              subtitle="Minimal safe patch generated"
            />
            <CodeDiffViewer
              diff={diff}
              filePath={rootCause?.file}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regression Test — shown when generated */}
      <AnimatePresence>
        {regressionTest && (
          <motion.div
            key="regression-test"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RegressionTestCard test={regressionTest} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Report — shown when verification data is available */}
      <AnimatePresence>
        {verification && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VerificationReport verification={verification} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evidence Drawer — overlay, does not push content */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        evidenceItems={evidence}
      />
    </div>
  );
}
