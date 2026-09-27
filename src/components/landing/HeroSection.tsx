"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, Terminal, Zap, Shield, Clock } from "lucide-react";

const STATS = [
  { icon: Clock, value: "< 3 min", label: "Avg. diagnosis" },
  { icon: Zap, value: "93%", label: "Root cause accuracy" },
  { icon: Shield, value: "Zero", label: "Manual steps" },
];

const TAGS = [
  "Root Cause Analysis",
  "Regression Tests",
  "Autonomous Agents",
  "Verified Patches",
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pb-12 pt-8 sm:px-8 lg:px-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[540px]"
        style={{
          background:
            "radial-gradient(ellipse 75% 48% at 50% 0%, rgba(88,101,242,0.18) 0%, rgba(88,101,242,0.06) 24%, transparent 68%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1160px] pt-6 text-center sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-[rgba(88,101,242,0.25)] bg-[rgba(88,101,242,0.08)] px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-[#A5B0FF]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#5865F2]" />
          IBM Hackathon Project · 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mx-auto max-w-4xl"
        >
          <span className="block text-[clamp(2.5rem,6vw,5.3rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[#F5F5F5]">
            Autonomous debugging
          </span>
          <span className="mt-1 block text-[clamp(2.5rem,6vw,5.3rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[#F5F5F5]">
            from <span className="text-transparent bg-[linear-gradient(90deg,#7180ff_0%,#9da8ff_100%)] bg-clip-text">trace to fix</span>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-[#9A9AA3] md:text-[17px]"
        >
          TraceFix deploys a multi-agent pipeline that reproduces bugs, pinpoints root causes with evidence, and generates verified patches — without a single manual step.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
        >
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[#18191d] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#B2B4BE]"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-[#5865F2] bg-[#5865F2] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#4f5ad8]"
          >
            Start Investigation
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#17181c] px-5 py-2.5 text-sm font-medium text-[#D7DAE2] transition-colors duration-200 hover:border-[rgba(255,255,255,0.14)] hover:text-white"
          >
            <Terminal size={14} aria-hidden="true" />
            Sign In with GitHub
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141519]/70 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(88,101,242,0.18)] bg-[rgba(88,101,242,0.08)]">
                  <Icon size={14} className="text-[#98A3FF]" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <span className="block font-mono text-base font-semibold text-[#F5F5F5] leading-tight">
                    {stat.value}
                  </span>
                  <span className="block text-[11px] uppercase tracking-[0.14em] text-[#8C8F9B]">
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="relative mx-auto mt-10 flex max-w-[1160px] items-center justify-center pb-3"
        aria-hidden="true"
      >
        <GitBranch size={13} className="text-[#8B96A8]/60" />
        <div className="ml-3 h-px w-20 bg-gradient-to-r from-[#8B96A8]/0 via-[#8B96A8]/60 to-[#8B96A8]/0" />
      </motion.div>
    </section>
  );
}
