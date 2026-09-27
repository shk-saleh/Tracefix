"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  // If already authenticated, redirect immediately
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          router.replace(callbackUrl);
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [callbackUrl, router]);

  // Surface OAuth errors from query string
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      const messages: Record<string, string> = {
        github_auth_denied: "GitHub authorization was denied.",
        missing_params: "Invalid OAuth response. Please try again.",
        state_mismatch: "OAuth state mismatch. Please try again.",
      };
      setError(messages[err] ?? decodeURIComponent(err));
    }
  }, [searchParams]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#101011] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101011] flex flex-col items-center justify-center px-4">
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[50vh]"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(88,101,242,0.08) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      {/* Fine grid */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-7 w-full max-w-[340px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 select-none">
          <span className="w-7 h-7 rounded-lg bg-[#5865F2] flex items-center justify-center shadow-[0_0_14px_rgba(88,101,242,0.35)]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l3 4-3-1-1-3z" fill="#ffffff" />
            </svg>
          </span>
          <span className="font-mono font-bold text-sm tracking-[0.18em] text-[#F5F5F5] uppercase">
            TRACEFIX
          </span>
        </div>

        {/* Card */}
        <div className="w-full bg-[#19191C] border border-white/[0.07] rounded-2xl p-7 flex flex-col items-center gap-5">
          <div className="text-center flex flex-col gap-1.5">
            <h1 className="text-[17px] font-semibold text-[#F5F5F5] tracking-tight">Sign in to Tracefix</h1>
            <p className="text-[13px] text-[#6F7078] leading-snug">
              Authenticate with GitHub to start debugging.
            </p>
          </div>

          {error && (
            <div className="w-full px-4 py-2.5 bg-[#ef4444]/8 border border-[#ef4444]/20 rounded-xl text-xs text-[#ef4444] text-center">
              {error}
            </div>
          )}

          <a
            href={`/api/auth/github/login${callbackUrl !== "/dashboard" ? `?next=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 bg-[#202024] hover:bg-[#25252A] border border-white/[0.08] hover:border-white/[0.14] text-[#F5F5F5] text-sm font-medium rounded-xl transition-all duration-200"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Continue with GitHub
          </a>

          <div className="w-full border-t border-white/[0.06]" />

          <p className="text-[11px] text-[#6F7078] text-center leading-relaxed">
            By continuing, you agree to grant Tracefix read access to your GitHub repositories.
          </p>
        </div>

        <p className="text-[11px] text-[#6F7078]/60">IBM Hackathon 2025</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
