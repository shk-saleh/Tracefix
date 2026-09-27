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
      className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-8 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#1e1e2e]"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 select-none">
        <span className="w-6 h-6 rounded bg-[#0f62fe] flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l3 4-3-1-1-3z" fill="#ffffff" />
          </svg>
        </span>
        <span className="font-mono font-bold text-sm tracking-widest text-white uppercase">
          TRACEFIX
        </span>
      </div>

      {/* Right nav */}
      <nav className="flex items-center gap-1" aria-label="Landing navigation">
        <Link
          href="/login"
          className="px-3 py-1.5 text-sm text-[#9ca3af] hover:text-white transition-colors rounded-md hover:bg-[#111118]"
        >
          Sign In
        </Link>
        <Link
          href="/login"
          className="px-4 py-1.5 text-sm font-medium text-white bg-[#0f62fe] hover:bg-[#0353e9] rounded-md transition-colors"
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
