import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#101011]">
      <Navbar />
      <Sidebar />

      {/* Main scrollable content area */}
      <main
        className="pt-[52px] pl-[210px] min-h-screen overflow-y-auto"
        aria-label="Main content"
      >
        <div className="max-w-full px-6 py-7">{children}</div>
      </main>
    </div>
  );
}
