import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import FeaturePipeline from "@/components/landing/FeaturePipeline";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#101011] text-[#F5F5F5]">
      <div className="relative w-full overflow-hidden bg-[#0d0d10]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,104,255,0.12),_transparent_42%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '44px 44px', maskImage: 'radial-gradient(circle at center, black 35%, transparent 100%)' }} aria-hidden="true" />

          <LandingNav />
          <HeroSection />
          <FeaturePipeline />

          <footer className="relative border-t border-[rgba(255,255,255,0.08)] bg-[#0b0c0f]/80 px-6 py-8 md:px-10">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2.5 select-none">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[#5865F2] shadow-[0_0_12px_rgba(88,101,242,0.35)]">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l3 4-3-1-1-3z" fill="#ffffff" />
                  </svg>
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#9AA1AF]">
                  TRACEFIX
                </span>
              </div>

              <div className="flex items-center gap-5">
                <a href="/login" className="text-[12px] text-[#9AA1AF] transition-colors duration-150 hover:text-white">
                  Dashboard
                </a>
                <a href="/login" className="text-[12px] text-[#9AA1AF] transition-colors duration-150 hover:text-white">
                  Sign In
                </a>
                <a href="#pipeline" className="text-[12px] text-[#9AA1AF] transition-colors duration-150 hover:text-white">
                  How it Works
                </a>
              </div>

              <p className="text-[12px] text-[#6F7078]">
                Built for the IBM Hackathon 2026
              </p>
            </div>
          </footer>
      </div>
    </div>
  );
}
