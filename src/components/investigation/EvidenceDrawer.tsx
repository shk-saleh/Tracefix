"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert } from "lucide-react";
import { type Evidence } from "@/types/investigation";
import EvidenceItem from "./EvidenceItem";

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceItems: Evidence[];
}

export default function EvidenceDrawer({
  isOpen,
  onClose,
  evidenceItems,
}: EvidenceDrawerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Wrap onClose so we also reset expanded state when the drawer closes
  const handleClose = useCallback(() => {
    setExpandedId(null);
    onClose();
  }, [onClose]);

  // ESC key + body scroll lock
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    },
    [handleClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  function toggleItem(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: "easeInOut" as const }}
            className="fixed top-0 right-0 bottom-0 w-[420px] z-50 flex flex-col bg-[#0d0d14] border-l border-[#1e1e2e] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Evidence details"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#0f62fe]/10 flex items-center justify-center">
                  <ShieldAlert size={14} className="text-[#0f62fe]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Evidence</h2>
                  <p className="text-[10px] text-[#6b7280]">
                    {evidenceItems.length} item{evidenceItems.length !== 1 ? "s" : ""} collected
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#6b7280] hover:text-white hover:bg-[#1a1a24] transition-colors"
                aria-label="Close evidence drawer"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            {/* Evidence list */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {evidenceItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                  <ShieldAlert size={28} className="text-[#1e1e2e]" aria-hidden="true" />
                  <p className="text-xs text-[#6b7280]">No evidence collected yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {evidenceItems.map((item) => (
                    <EvidenceItem
                      key={item.id}
                      evidence={item}
                      isExpanded={expandedId === item.id}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer strip */}
            <div className="px-5 py-3 border-t border-[#1e1e2e] flex-shrink-0">
              <p className="text-[10px] text-[#6b7280] font-mono">
                Press <kbd className="px-1 py-0.5 rounded bg-[#1a1a24] border border-[#2a2a3a] text-[#9ca3af]">ESC</kbd> to close
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
