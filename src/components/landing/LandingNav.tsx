"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 px-4 pb-2 pt-4 transition-all duration-300 sm:px-6 md:px-8 ${
        scrolled ? "" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[#131316]/80 px-4 py-3 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] md:px-6">
        <Link href="/" className="flex items-center gap-2.5 select-none group" aria-label="TraceFix home">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#5865F2] shadow-[0_0_12px_rgba(88,101,242,0.35)] transition-shadow duration-200 group-hover:shadow-[0_0_18px_rgba(88,101,242,0.5)]">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l3 4-3-1-1-3z" fill="#ffffff" />
            </svg>
          </span>
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#F5F5F5]">
            TRACEFIX
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {[
            { label: "Features", href: "#features" },
            { label: "How it Works", href: "#pipeline" },
            { label: "Docs", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-[12px] text-[#9AA1AF] transition-colors duration-150 hover:bg-white/[0.04] hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <nav className="flex items-center gap-2" aria-label="Account navigation">
          <Link
            href="/login"
            className="hidden rounded-lg px-3.5 py-1.5 text-[12px] font-medium text-[#9AA1AF] transition-colors duration-150 hover:bg-white/[0.04] hover:text-white sm:inline-flex"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(88,101,242,0.35)] bg-[#5865F2] px-3.5 py-1.5 text-[12px] font-medium text-white transition-all duration-200 hover:bg-[#4f5ad8]"
          >
            Dashboard
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="opacity-80">
              <path d="M2.5 6h7m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}
