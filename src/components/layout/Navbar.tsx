"use client";

import Link from "next/link";
import { Bell, Settings, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-[#1e1e2e] bg-[#0a0a0f]">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 select-none">
        <span className="w-6 h-6 rounded bg-[#0f62fe] flex items-center justify-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l3 4-3-1-1-3z"
              fill="#ffffff"
            />
          </svg>
        </span>
        <span className="font-mono font-bold text-sm tracking-widest text-white uppercase">
          TRACEFIX
        </span>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button
          aria-label="Notifications"
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#6b7280] hover:text-white hover:bg-[#1a1a24] transition-colors"
        >
          <Bell size={16} aria-hidden="true" />
        </button>
        <button
          aria-label="Settings"
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#6b7280] hover:text-white hover:bg-[#1a1a24] transition-colors"
        >
          <Settings size={16} aria-hidden="true" />
        </button>
        <div className="ml-2 w-7 h-7 rounded-full bg-[#1a1a24] border border-[#1e1e2e] flex items-center justify-center">
          <User size={14} className="text-[#6b7280]" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
