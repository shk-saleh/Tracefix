"use client";

import { type Variants, motion } from "framer-motion";
import {
  GitBranch,
  Bug,
  Lightbulb,
  FlaskConical,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    icon: GitBranch,
    step: "01",
    title: "Repository Investigation",
    description:
      "Clone, index, and map the entire codebase structure automatically. Build a semantic call graph for targeted traversal.",
    color: "#1677FF",
    colorDim: "rgba(22,119,255,0.1)",
  },
  {
    icon: Bug,
    step: "02",
    title: "Bug Reproduction",
    description:
      "Generate a deterministic reproduction case from the bug report. Confirm the failure is consistently reproducible.",
    color: "#8b5cf6",
    colorDim: "rgba(139,92,246,0.1)",
  },
  {
    icon: Lightbulb,
    step: "03",
    title: "Root Cause Analysis",
    description:
      "Pinpoint the exact file, line, and logic error with full evidence trail. No speculation — only verified facts.",
    color: "#f59e0b",
    colorDim: "rgba(245,158,11,0.1)",
  },
  {
    icon: FlaskConical,
    step: "04",
    title: "Regression Test Generation",
    description:
      "Write a targeted test that guards the fix from reintroduction. Integrated into the existing test suite.",
    color: "#06b6d4",
    colorDim: "rgba(6,182,212,0.1)",
  },
  {
    icon: ShieldCheck,
    step: "05",
    title: "Verified Fix",
    description:
      "Apply the smallest safe patch and confirm all tests pass. Produce a diff-ready output for review.",
    color: "#22c55e",
    colorDim: "rgba(34,197,94,0.1)",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: "easeOut" as const } },
};

export default function FeaturePipeline() {
  return (
    <section id="pipeline" className="relative overflow-hidden px-5 pb-24 pt-10 sm:px-8 lg:px-10">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[780px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(88,101,242,0.14),_transparent_62%)]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto mb-12 max-w-3xl text-center"
        id="features"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#16181d] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" aria-hidden="true" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#9AA1AF]">
            How it works
          </span>
        </div>
        <h2 className="text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-tight tracking-[-0.05em] text-[#F5F5F5]">
          Five agents. One unified investigation.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[#9A9AA3]">
          Each phase runs autonomously and hands verified evidence to the next — no manual intervention required.
        </p>
      </motion.div>

      <motion.div
        className="relative mx-auto max-w-[1180px]"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        <div className="hidden gap-4 lg:grid lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <motion.div key={step.title} variants={cardVariants} className="flex">
              <div
                className="group relative flex w-full flex-col gap-5 rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[#111216] p-5 transition-all duration-200 hover:border-[rgba(255,255,255,0.14)]"
                style={{
                  boxShadow: i === 0 ? "0 0 0 1px rgba(88,101,242,0.08) inset" : undefined,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, ${step.colorDim} 0%, rgba(255,255,255,0.02) 55%, transparent 100%)`,
                  }}
                  aria-hidden="true"
                />

                <div className="relative flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)]"
                    style={{ backgroundColor: step.colorDim }}
                  >
                    <step.icon size={17} style={{ color: step.color }} aria-hidden="true" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F7078]">
                    {step.step}
                  </span>
                </div>

                <div className="relative flex flex-1 flex-col gap-2">
                  <h3 className="text-[15px] font-medium text-[#F5F5F5]">{step.title}</h3>
                  <p className="text-[12.5px] leading-6 text-[#9A9AA3]">{step.description}</p>
                </div>

                <div className="relative mt-auto h-[2px] w-full rounded-full" style={{ backgroundColor: `${step.color}55` }} aria-hidden="true" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:hidden">
          {STEPS.map((step) => (
            <motion.div
              key={step.title}
              variants={cardVariants}
              className="relative flex items-start gap-4 rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[#111216] p-4"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)]"
                style={{ backgroundColor: step.colorDim }}
              >
                <step.icon size={18} style={{ color: step.color }} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F7078]">
                    {step.step}
                  </span>
                  <h3 className="text-[14px] font-medium text-[#F5F5F5]">{step.title}</h3>
                </div>
                <p className="text-[13px] leading-6 text-[#9A9AA3]">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="relative mx-auto mt-14 max-w-[1180px]"
      >
        <div className="flex flex-col items-start justify-between gap-5 rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[#111216] p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-medium text-[#F5F5F5]">Ready to diagnose your first bug?</span>
            <span className="text-[13px] text-[#9A9AA3]">Connect a repository and submit a bug report to begin.</span>
          </div>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-[#5865F2] bg-[#5865F2] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#4f5ad8]"
          >
            Start Investigation
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
