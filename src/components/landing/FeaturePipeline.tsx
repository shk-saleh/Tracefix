"use client";

import { type Variants, motion } from "framer-motion";
import {
  GitBranch,
  Bug,
  Lightbulb,
  FlaskConical,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const STEPS = [
  {
    icon: GitBranch,
    title: "Repository Investigation",
    description: "Clone, index, and map the entire codebase structure automatically.",
    color: "#0f62fe",
  },
  {
    icon: Bug,
    title: "Bug Reproduction",
    description: "Generate a deterministic reproduction case from the bug report.",
    color: "#8b5cf6",
  },
  {
    icon: Lightbulb,
    title: "Root Cause Analysis",
    description: "Pinpoint the exact file, line, and logic error with evidence.",
    color: "#f59e0b",
  },
  {
    icon: FlaskConical,
    title: "Regression Test Generation",
    description: "Write a targeted test that guards the fix from reintroduction.",
    color: "#06b6d4",
  },
  {
    icon: ShieldCheck,
    title: "Verified Fix",
    description: "Apply the smallest safe patch and confirm all tests pass.",
    color: "#22c55e",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function FeaturePipeline() {
  return (
    <section className="relative px-6 pb-28 pt-4">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mb-14"
      >
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#6b7280] mb-3">
          How it works
        </p>
        <h2 className="text-2xl font-bold text-white">
          Five agents. One unified investigation.
        </h2>
        <p className="mt-2 text-sm text-[#6b7280] max-w-lg mx-auto">
          Each phase runs autonomously and hands verified evidence to the next —
          no manual intervention required.
        </p>
      </motion.div>

      {/* Pipeline cards */}
      <motion.div
        className="max-w-5xl mx-auto flex items-stretch gap-0"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              variants={cardVariants}
              className="flex-1 flex items-stretch"
            >
              {/* Card */}
              <div className="flex-1 relative flex flex-col gap-4 p-5 bg-[#111118] border border-[#1e1e2e] rounded-xl hover:border-[#2a2a3a] hover:bg-[#13131c] transition-colors group">
                {/* Step number */}
                <span className="absolute top-3 right-3 text-[10px] font-mono text-[#6b7280]">
                  0{i + 1}
                </span>

                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${step.color}18` }}
                >
                  <Icon
                    size={18}
                    style={{ color: step.color }}
                    aria-hidden="true"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-semibold text-white leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#6b7280] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom accent line on hover */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  style={{ backgroundColor: step.color }}
                  aria-hidden="true"
                />
              </div>

              {/* Arrow connector — not after the last card */}
              {i < STEPS.length - 1 && (
                <div className="flex items-center px-1 flex-shrink-0" aria-hidden="true">
                  <ChevronRight size={14} className="text-[#2a2a3a]" />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-16 max-w-5xl mx-auto flex items-center justify-between px-6 py-4 rounded-xl border border-[#1e1e2e] bg-[#111118]"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-white">
            Ready to diagnose your first bug?
          </span>
          <span className="text-xs text-[#6b7280]">
            Connect a repository and submit a bug report to begin.
          </span>
        </div>
        <a
          href="/dashboard"
          className="px-5 py-2 bg-[#0f62fe] hover:bg-[#0353e9] text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
        >
          Start Investigation →
        </a>
      </motion.div>
    </section>
  );
}
