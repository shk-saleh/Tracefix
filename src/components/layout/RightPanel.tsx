import { ReactNode } from "react";

interface RightPanelProps {
  children?: ReactNode;
}

export default function RightPanel({ children }: RightPanelProps) {
  return (
    <aside className="fixed right-0 top-14 bottom-0 w-[280px] border-l border-[#1e1e2e] bg-[#0a0a0f] overflow-y-auto z-40">
      {children ?? (
        <div className="flex items-center justify-center h-full">
          <p className="text-xs text-[#6b7280]">No details available</p>
        </div>
      )}
    </aside>
  );
}
