"use client";

import { AnimatePresence, motion } from "framer-motion";
import RepositoryCard from "@/components/dashboard/RepositoryCard";
import BugReportCard from "@/components/dashboard/BugReportCard";
import RightSidebarContent from "@/components/dashboard/RightSidebarContent";
import InvestigationCenter from "@/components/investigation/InvestigationCenter";
import { useInvestigation } from "@/hooks/useInvestigation";
import { type RepositoryInfo } from "@/types/investigation";

// Dev fixture — replaced by real API data in Sub-Task 10
const DEMO_REPO: RepositoryInfo = {
  name: "acme-corp/payment-service",
  url: "https://github.com/acme-corp/payment-service",
  language: "TypeScript",
  branch: "main",
  fileCount: 247,
  testCount: 84,
  status: "connected",
};

export default function DashboardPage() {
  const { start, isLoading, status, error } = useInvestigation();

  async function handleSubmit(description: string) {
    await start(DEMO_REPO.url, description);
  }

  return (
    <>
      {/* Main content */}
      <div className="flex flex-col gap-5">
        <AnimatePresence mode="wait">
          {!status ? (
            <motion.div
              key="pre"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5 max-w-2xl"
            >
              <RepositoryCard repo={DEMO_REPO} />
              <BugReportCard onSubmit={handleSubmit} isLoading={isLoading} />
              {error && (
                <p className="text-xs text-[#ef4444] px-1">{error}</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <InvestigationCenter status={status} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right sidebar — fixed overlay populated with live investigation data */}
      <aside className="fixed right-0 top-14 bottom-0 w-[280px] border-l border-[#1e1e2e] bg-[#0a0a0f] overflow-y-auto z-40">
        <RightSidebarContent status={status} />
      </aside>
    </>
  );
}
