"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Search,
  FileText,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: GitBranch },
  { href: "/history", label: "Investigations", icon: Search },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-[52px] bottom-0 w-[210px] flex flex-col border-r border-white/[0.06] bg-[#101011] z-40">
      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                isActive
                  ? "bg-[#5865F2]/12 text-[#F5F5F5] font-medium border border-[#5865F2]/15"
                  : "text-[#6F7078] hover:text-[#9A9AA3] hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon
                size={15}
                className={isActive ? "text-[#5865F2]" : "text-[#6F7078]"}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Version badge */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <span className="text-[10px] font-mono text-[#6F7078]/60 tracking-wider uppercase">
          v0.1.0 · IBM Hackathon
        </span>
      </div>
    </aside>
  );
}
