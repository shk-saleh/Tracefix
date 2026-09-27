"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface SessionUser {
  login: string;
  name: string | null;
  avatarUrl: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/github/logout", { method: "POST" });
    router.push("/login");
  }

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
        {user ? (
          <>
            {/* Avatar — links to settings */}
            <Link
              href="/settings"
              className="ml-1 flex items-center gap-2 hover:opacity-80 transition-opacity"
              title={user.name ?? user.login}
            >
              <Image
                src={user.avatarUrl}
                alt={user.login}
                width={28}
                height={28}
                className="rounded-full border border-[#1e1e2e]"
                unoptimized
              />
              <span className="text-xs text-[#9ca3af] hidden sm:block">
                {user.name ?? user.login}
              </span>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Sign out"
              title="Sign out"
              className="ml-1 w-8 h-8 flex items-center justify-center rounded-md text-[#6b7280] hover:text-[#ef4444] hover:bg-[#1a1a24] transition-colors disabled:opacity-50"
            >
              <LogOut size={15} aria-hidden="true" />
            </button>
          </>
        ) : (
          <a
            href="/api/auth/github/login"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1a1a24] hover:bg-[#1e1e2e] border border-[#1e1e2e] rounded-lg transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Connect GitHub
          </a>
        )}
      </div>
    </header>
  );
}
