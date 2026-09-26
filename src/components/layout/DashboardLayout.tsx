import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";

interface DashboardLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export default function DashboardLayout({
  children,
  rightPanel,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <Sidebar />

      {/* Main scrollable content area */}
      <main
        className="pt-14 pl-[220px] pr-[280px] min-h-screen overflow-y-auto"
        aria-label="Main content"
      >
        <div className="max-w-full px-6 py-6">{children}</div>
      </main>

      <RightPanel>{rightPanel}</RightPanel>
    </div>
  );
}
