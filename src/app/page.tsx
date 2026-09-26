import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturePipeline from "@/components/landing/FeaturePipeline";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <LandingNav />
      <HeroSection />
      <FeaturePipeline />

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-6 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-[#0f62fe] flex items-center justify-center flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l3 4-3-1-1-3z" fill="#ffffff" />
            </svg>
          </span>
          <span className="font-mono text-xs text-[#6b7280] tracking-widest uppercase">
            TRACEFIX
          </span>
        </div>
        <p className="text-xs text-[#6b7280]">
          Built for the IBM Hackathon 2025
        </p>
      </footer>
    </div>
  );
}
