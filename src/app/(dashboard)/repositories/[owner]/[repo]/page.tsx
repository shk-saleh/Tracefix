"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  GitBranch,
  Star,
  Lock,
  Globe,
  ExternalLink,
  ArrowLeft,
  Play,
  ChevronDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  language: string | null;
  stars: number;
  updatedAt: string | null;
  visibility: string;
}

interface Branch {
  name: string;
  sha: string;
  protected: boolean;
}

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default function RepositoryDetailPage({ params }: Props) {
  const { owner, repo } = use(params);
  const router = useRouter();

  const [repository, setRepository] = useState<Repository | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [bugDescription, setBugDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/github/repositories/${owner}/${repo}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Failed to load repository`);
        }
        const data = await res.json();
        setRepository(data.repository);
        setBranches(data.branches ?? []);
        setSelectedBranch(data.repository.defaultBranch);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load repository");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [owner, repo]);

  async function handleStartInvestigation() {
    if (!repository || !bugDescription.trim() || bugDescription.trim().length < 10) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repositoryId: String(repository.id),
          repositoryName: repository.name,
          owner: repository.owner,
          branch: selectedBranch,
          cloneUrl: repository.cloneUrl,
          bugDescription: bugDescription.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to start investigation");
      }

      const data = await res.json();
      router.push(`/investigations/${data.investigation.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to start investigation");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={20} className="animate-spin text-[#6b7280]" />
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Link
          href="/repositories"
          className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors"
        >
          <ArrowLeft size={12} />
          Back to Repositories
        </Link>
        <div className="flex items-start gap-3 px-4 py-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl">
          <AlertCircle size={15} className="text-[#ef4444] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#ef4444]">{error ?? "Repository not found"}</p>
        </div>
      </div>
    );
  }

  const canSubmit =
    !submitting && bugDescription.trim().length >= 10 && selectedBranch;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Back */}
      <Link
        href="/repositories"
        className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors w-fit"
      >
        <ArrowLeft size={12} />
        Back to Repositories
      </Link>

      {/* Repository info */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-white truncate">
                {repository.fullName}
              </h1>
              {repository.private ? (
                <Lock size={12} className="text-[#6b7280] flex-shrink-0" />
              ) : (
                <Globe size={12} className="text-[#6b7280] flex-shrink-0" />
              )}
            </div>
            {repository.description && (
              <p className="text-xs text-[#6b7280]">{repository.description}</p>
            )}
          </div>
          <a
            href={repository.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#0f62fe] transition-colors flex-shrink-0"
          >
            <ExternalLink size={12} />
            GitHub
          </a>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#6b7280]">
          {repository.language && (
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full bg-[#3b82f6]"
                aria-hidden="true"
              />
              {repository.language}
            </span>
          )}
          {repository.stars > 0 && (
            <span className="flex items-center gap-1">
              <Star size={10} aria-hidden="true" />
              {repository.stars}
            </span>
          )}
          <span className="flex items-center gap-1">
            <GitBranch size={10} aria-hidden="true" />
            {repository.defaultBranch}
          </span>
        </div>
      </div>

      {/* Investigation form */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-white">Start Investigation</h2>
          <p className="text-xs text-[#6b7280]">
            TRACEFIX will clone this repository and analyze the bug using an
            AI-powered debugging pipeline.
          </p>
        </div>

        {/* Branch selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#9ca3af]">Branch</label>
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full appearance-none bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0f62fe] transition-colors pr-8"
            >
              {branches.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                  {b.name === repository.defaultBranch ? " (default)" : ""}
                  {b.protected ? " 🔒" : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none"
            />
          </div>
        </div>

        {/* Bug description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#9ca3af]">
            Bug Description
          </label>
          <textarea
            value={bugDescription}
            onChange={(e) => setBugDescription(e.target.value)}
            placeholder="Describe the bug in detail. The more specific you are, the more accurate the investigation will be.

Example: Users are occasionally charged twice when clicking Pay twice quickly. The double charge appears in Stripe logs but only the first charge is recorded in our database."
            rows={5}
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#0f62fe] transition-colors resize-none"
          />
          <p className="text-[11px] text-[#6b7280]">
            {bugDescription.trim().length} / 2000 characters
            {bugDescription.trim().length > 0 &&
              bugDescription.trim().length < 10 &&
              " (minimum 10)"}
          </p>
        </div>

        {/* Unsupported language warning */}
        {repository.language &&
          !["TypeScript", "JavaScript"].includes(repository.language) && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg">
              <AlertCircle
                size={14}
                className="text-[#f59e0b] mt-0.5 flex-shrink-0"
              />
              <p className="text-xs text-[#f59e0b]">
                TRACEFIX currently supports Node.js/TypeScript repositories for
                automated investigation. {repository.language} projects may have
                limited support.
              </p>
            </div>
          )}

        {/* Submit error */}
        {submitError && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg">
            <AlertCircle
              size={14}
              className="text-[#ef4444] mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-[#ef4444]">{submitError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleStartInvestigation}
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f62fe] hover:bg-[#0f62fe]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Starting investigation…
            </>
          ) : (
            <>
              <Play size={15} />
              Start Investigation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
