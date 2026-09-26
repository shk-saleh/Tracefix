"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, Terminal } from "lucide-react";

const DESCRIPTION_LINES = [
  "Trace the bug.",
  "Prove the cause.",
  "Generate the smallest safe fix.",
  "Verify it automatically.",
];

const STATS = [
  { value: "< 3 min", label: "Avg. diagnosis time" },
  { value: "93%", label: "Root cause accuracy" },
  { value: "Zero", label: "Manual steps required" },
];

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
      {/* Radial glow — purely CSS, no gradients on content */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, #0f62fe14 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Grid texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0f62fe]/30 bg-[#0f62fe]/8 text-[#93bbff] text-xs font-mono tracking-wide"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#0f62fe] animate-pulse" />
        IBM Hackathon Project · 2025
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="font-mono font-black text-[72px] leading-none tracking-[0.12em] text-white uppercase"
        style={{ letterSpacing: "0.15em" }}
      >
        TRACE
        <span className="text-[#0f62fe]">FIX</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
        className="mt-4 text-base font-medium text-[#9ca3af] tracking-widest uppercase"
      >
        Evidence-Driven Autonomous Debugging
      </motion.p>

      {/* Description lines */}
      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07, delayChildren: 0.28 } },
        }}
        className="mt-8 flex flex-col items-center gap-1.5"
        aria-label="Product description"
      >
        {DESCRIPTION_LINES.map((line) => (
          <motion.li
            key={line}
            variants={{
              hidden: { opacity: 0, x: -8 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2 text-sm text-[#6b7280]"
          >
            <span className="text-[#0f62fe] font-mono select-none">→</span>
            {line}
          </motion.li>
        ))}
      </motion.ul>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-10 flex items-center gap-3"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0f62fe] hover:bg-[#0353e9] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Start Investigation
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#1e1e2e] hover:border-[#2e2e40] text-[#9ca3af] hover:text-white text-sm font-medium rounded-lg transition-colors bg-[#111118] hover:bg-[#1a1a24]"
        >
          <Terminal size={14} aria-hidden="true" />
          View Demo
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="mt-16 flex items-center gap-8"
      >
        {STATS.map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="font-mono text-xl font-bold text-white">{stat.value}</span>
            <span className="text-[11px] text-[#6b7280] tracking-wide">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        aria-hidden="true"
      >
        <GitBranch size={14} className="text-[#6b7280]" />
        <div className="w-px h-8 bg-gradient-to-b from-[#6b7280] to-transparent" />
      </motion.div>
    </section>
  );
}
