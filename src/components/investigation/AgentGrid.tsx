"use client";

import { AnimatePresence } from "framer-motion";
import { type Agent } from "@/types/investigation";
import AgentCard from "./AgentCard";

interface AgentGridProps {
  agents: Agent[];
}

export default function AgentGrid({ agents }: AgentGridProps) {
  if (agents.length === 0) return null;

  return (
    <div
      className="grid grid-cols-2 gap-3"
      aria-label="Active agents"
    >
      <AnimatePresence mode="popLayout">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </AnimatePresence>
    </div>
  );
}
