"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  GitBranch,
  Container,
  Cpu,
  LogOut,
  RefreshCw,
} from "lucide-react";
const Github = GitBranch;

interface SessionUser {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
}

interface RunnerStatus {
  mode: string;
  available: boolean;
  dockerVersion?: string;
  error?: string;
}

interface AIStatus {
  provider: string;
  baseUrl: string;
  model: string;
  available: boolean;
  apiKeyConfigured: boolean;
  models?: string[];
  error?: string;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
        ok ? "bg-[#22c55e]" : "bg-[#ef4444]"
      }`}
    />
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [runnerStatus, setRunnerStatus] = useState<RunnerStatus | null>(null);
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRunner, setLoadingRunner] = useState(true);
  const [loadingAI, setLoadingAI] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  async function loadAll() {
    setLoadingUser(true);
    setLoadingRunner(true);
    setLoadingAI(true);

    const [sessionRes, runnerRes, aiRes] = await Promise.allSettled([
      fetch("/api/auth/session"),
      fetch("/api/runner/status"),
      fetch("/api/ai/status"),
    ]);

    if (sessionRes.status === "fulfilled" && sessionRes.value.ok) {
      const d = await sessionRes.value.json();
      setUser(d.authenticated ? d.user : null);
    }
    setLoadingUser(false);

    if (runnerRes.status === "fulfilled" && runnerRes.value.ok) {
      setRunnerStatus(await runnerRes.value.json());
    }
    setLoadingRunner(false);

    if (aiRes.status === "fulfilled" && aiRes.value.ok) {
      setAIStatus(await aiRes.value.json());
    }
    setLoadingAI(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/github/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-sm text-[#6b7280]">
          Manage your account preferences and integrations.
        </p>
      </div>

      {/* GitHub Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
          GitHub
        </h2>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden">
          {loadingUser ? (
            <div className="px-5 py-4 flex items-center gap-2 text-[#6b7280]">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">Loading account…</span>
            </div>
          ) : user ? (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e]">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <Image
                    src={user.avatarUrl}
                    alt={user.login}
                    width={32}
                    height={32}
                    className="rounded-full border border-[#1e1e2e]"
                    unoptimized
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {user.name ?? user.login}
                    </span>
                    <span className="text-xs text-[#6b7280]">@{user.login}</span>
                  </div>
                </div>
                <span className="flex items-center text-xs text-[#22c55e]">
                  <StatusDot ok={true} />
                  Connected
                </span>
              </div>
              <div className="px-5 py-3">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 text-xs text-[#ef4444] hover:text-[#ef4444]/80 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <LogOut size={12} />
                  )}
                  Disconnect GitHub
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2 text-[#6b7280]">
                <Github size={16} />
                <span className="text-sm">Not connected</span>
              </div>
              <a
                href="/api/auth/github/login"
                className="flex items-center gap-1.5 text-xs text-[#0f62fe] hover:text-[#93bbff] transition-colors"
              >
                <Github size={12} />
                Connect GitHub
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Runner Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
            Runner
          </h2>
          <button
            onClick={loadAll}
            className="flex items-center gap-1 text-[11px] text-[#6b7280] hover:text-white transition-colors"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
        </div>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden divide-y divide-[#1e1e2e]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#9ca3af]">Runner Mode</span>
            {loadingRunner ? (
              <Loader2 size={14} className="animate-spin text-[#6b7280]" />
            ) : (
              <span className="text-sm font-medium text-white capitalize">
                {runnerStatus?.mode ?? "unknown"}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Container size={14} className="text-[#6b7280]" />
              <span className="text-sm text-[#9ca3af]">Docker</span>
            </div>
            {loadingRunner ? (
              <Loader2 size={14} className="animate-spin text-[#6b7280]" />
            ) : (
              <span className={`text-sm font-medium flex items-center ${runnerStatus?.available ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                <StatusDot ok={runnerStatus?.available ?? false} />
                {runnerStatus?.available
                  ? `v${runnerStatus.dockerVersion ?? "?"}`
                  : runnerStatus?.error ?? "Not available"}
              </span>
            )}
          </div>
        </div>
        {!loadingRunner && !runnerStatus?.available && (
          <p className="text-xs text-[#f59e0b] px-1">
            Docker is not running. Start Docker Desktop and refresh.
          </p>
        )}
      </div>

      {/* AI Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
          AI
        </h2>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl overflow-hidden divide-y divide-[#1e1e2e]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#9ca3af]">Provider</span>
            <span className="text-sm font-medium text-white capitalize">
              {aiStatus?.provider ?? "Ollama"}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#9ca3af]">Endpoint</span>
            <span className="text-xs font-mono text-[#9ca3af] truncate max-w-[220px]">
              {aiStatus?.baseUrl ?? "http://localhost:11434"}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#9ca3af]">Model</span>
            <span className="text-sm font-mono text-white">
              {aiStatus?.model ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-[#9ca3af]">API Key</span>
            {loadingAI ? (
              <Loader2 size={14} className="animate-spin text-[#6b7280]" />
            ) : aiStatus?.apiKeyConfigured ? (
              <span className="flex items-center text-xs text-[#22c55e]">
                <StatusDot ok={true} />
                Configured
              </span>
            ) : (
              <span className="flex items-center text-xs text-[#f59e0b]">
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 bg-[#f59e0b]" />
                Not set — required for cloud Ollama
              </span>
            )}
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-[#6b7280]" />
              <span className="text-sm text-[#9ca3af]">Status</span>
            </div>
            {loadingAI ? (
              <Loader2 size={14} className="animate-spin text-[#6b7280]" />
            ) : (
              <span className={`text-sm font-medium flex items-center ${aiStatus?.available ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                <StatusDot ok={aiStatus?.available ?? false} />
                {aiStatus?.available ? "Connected" : aiStatus?.error ?? "Offline"}
              </span>
            )}
          </div>
          {aiStatus?.available && aiStatus.models && aiStatus.models.length > 0 && (
            <div className="px-5 py-3.5">
              <span className="text-xs text-[#6b7280]">Available models: </span>
              <span className="text-xs font-mono text-[#9ca3af]">
                {aiStatus.models.slice(0, 5).join(", ")}
              </span>
            </div>
          )}
        </div>
        {!loadingAI && !aiStatus?.available && (
          <p className="text-xs text-[#f59e0b] px-1">
            Ollama is unavailable. Check{" "}
            <code className="text-[11px] bg-[#1e1e2e] px-1 rounded">OLLAMA_BASE_URL</code>
            {" "}and{" "}
            <code className="text-[11px] bg-[#1e1e2e] px-1 rounded">OLLAMA_API_KEY</code>.
          </p>
        )}
      </div>
    </div>
  );
}
