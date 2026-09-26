"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type InvestigationStatus, type InvestigationPhase } from "@/types/investigation";

const POLL_INTERVAL_MS = 3000;

const TERMINAL_PHASES: InvestigationPhase[] = ["completed", "failed"];

interface UseInvestigationReturn {
  investigationId: string | null;
  status: InvestigationStatus | null;
  isLoading: boolean;   // true while the POST is in-flight
  isPolling: boolean;   // true while polling is active
  error: string | null;
  start: (repoUrl: string, bugDescription: string) => Promise<void>;
  reset: () => void;
}

export function useInvestigation(): UseInvestigationReturn {
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [status, setStatus] = useState<InvestigationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep intervalId in a ref so effect cleanup always sees the current value
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Prevent stale closure on the investigationId inside the poll callback
  const investigationIdRef = useRef<string | null>(null);

  // ── Poll status ────────────────────────────────────────────────────────────
  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/investigate/status?id=${encodeURIComponent(id)}`);
      if (!res.ok) {
        throw new Error(`Status request failed: ${res.status}`);
      }
      const data: InvestigationStatus = await res.json();
      setStatus(data);

      // Stop polling once in a terminal phase
      if (TERMINAL_PHASES.includes(data.phase)) {
        stopPolling();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown polling error";
      setError(message);
      stopPolling();
    }
  }, []);

  // ── Start polling ──────────────────────────────────────────────────────────
  const startPolling = useCallback(
    (id: string) => {
      setIsPolling(true);
      // Immediate first poll
      pollStatus(id);
      intervalRef.current = setInterval(() => {
        if (investigationIdRef.current) {
          pollStatus(investigationIdRef.current);
        }
      }, POLL_INTERVAL_MS);
    },
    [pollStatus]
  );

  // ── Stop polling ───────────────────────────────────────────────────────────
  function stopPolling() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }

  // ── Start investigation ────────────────────────────────────────────────────
  const start = useCallback(
    async (repoUrl: string, bugDescription: string) => {
      setIsLoading(true);
      setError(null);
      setStatus(null);

      try {
        const res = await fetch("/api/investigate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl, bugDescription }),
        });

        if (!res.ok) {
          throw new Error(`Failed to start investigation: ${res.status}`);
        }

        const data: { investigationId: string } = await res.json();
        investigationIdRef.current = data.investigationId;
        setInvestigationId(data.investigationId);
        startPolling(data.investigationId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start investigation";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [startPolling]
  );

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopPolling();
    investigationIdRef.current = null;
    setInvestigationId(null);
    setStatus(null);
    setError(null);
    setIsLoading(false);
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    investigationId,
    status,
    isLoading,
    isPolling,
    error,
    start,
    reset,
  };
}
