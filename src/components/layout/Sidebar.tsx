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
    <aside className="fixed left-0 top-14 bottom-0 w-[220px] flex flex-col border-r border-[#1e1e2e] bg-[#0a0a0f] z-40">
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-[#1a1a24] text-white font-medium"
                  : "text-[#6b7280] hover:text-white hover:bg-[#111118]"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Version badge */}
      <div className="px-4 py-3 border-t border-[#1e1e2e]">
        <span className="text-[10px] font-mono text-[#6b7280] tracking-wider uppercase">
          v0.1.0 · IBM Hackathon
        </span>
      </div>
    </aside>
  );
}
