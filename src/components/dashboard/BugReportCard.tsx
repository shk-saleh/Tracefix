"use client";

import { useState } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/primitives";

const MAX_CHARS = 2000;

interface BugReportCardProps {
  onSubmit: (description: string) => Promise<void>;
  isLoading: boolean;
}

export default function BugReportCard({ onSubmit, isLoading }: BugReportCardProps) {
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const charCount = description.length;
  const isEmpty = description.trim().length === 0;
  const isOverLimit = charCount > MAX_CHARS;

  async function handleSubmit() {
    if (isEmpty) {
      setError("Please describe the bug before starting an investigation.");
      return;
    }
    if (isOverLimit) {
      setError(`Description must be under ${MAX_CHARS} characters.`);
      return;
    }
    setError(null);
    await onSubmit(description.trim());
  }

  return (
    <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-4">
      <SectionHeader
        title="Bug Report"
        subtitle="Describe what's broken and how to reproduce it"
      />

      {/* Textarea */}
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <Textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Describe the bug... e.g. 'Payment fails silently when the cart total exceeds $999. No error is thrown and the transaction appears to succeed on the frontend but the order is never created in the database.'"
            rows={6}
            disabled={isLoading}
            className={`resize-none bg-[#0d0d14] border text-sm text-white placeholder:text-[#6b7280] focus-visible:ring-1 focus-visible:ring-[#0f62fe] transition-colors font-mono leading-relaxed ${
              error
                ? "border-[#ef4444] focus-visible:ring-[#ef4444]"
                : "border-[#1e1e2e] hover:border-[#2a2a3a]"
            }`}
            aria-label="Bug description"
            aria-describedby={error ? "bug-report-error" : undefined}
          />
        </div>

        {/* Footer row: error + char count */}
        <div className="flex items-start justify-between gap-3 min-h-[18px]">
          {error ? (
            <p
              id="bug-report-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-[#ef4444]"
            >
              <AlertCircle size={12} aria-hidden="true" />
              {error}
            </p>
          ) : (
            <span />
          )}
          <span
            className={`text-[11px] font-mono tabular-nums flex-shrink-0 ${
              isOverLimit ? "text-[#ef4444]" : "text-[#6b7280]"
            }`}
          >
            {charCount.toLocaleString()}/{MAX_CHARS.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || isOverLimit}
        className="w-full bg-[#0f62fe] hover:bg-[#0353e9] text-white font-semibold text-sm h-9 gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={isLoading ? "Investigation in progress" : "Start investigation"}
      >
        {isLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Investigating…
          </>
        ) : (
          <>
            <Play size={14} aria-hidden="true" />
            Start Investigation
          </>
        )}
      </Button>
    </div>
  );
}
