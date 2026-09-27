import { ReactNode } from "react";

interface RightPanelProps {
  children?: ReactNode;
}

export default function RightPanel({ children }: RightPanelProps) {
  return (
    <aside className="fixed right-0 top-[52px] bottom-0 w-[272px] border-l border-white/[0.06] bg-[#101011] overflow-y-auto z-40">
      {children ?? (
        <div className="flex items-center justify-center h-full">
          <p className="text-[11px] text-[#6F7078]">No details available</p>
        </div>
      )}
    </aside>
  );
}
