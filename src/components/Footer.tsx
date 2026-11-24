import { ShieldCheck, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="bg-white/2 border-t border-white/10 py-6 px-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4"
      id="app-footer"
    >
      <div className="text-[11px] text-slate-500 font-mono">
        © 2026 CareerPilot AI. All rights reserved. Built for B.Tech / MCA Academic Portfolios.
      </div>

      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-4.5 h-4.5" /> SECURE HANDSHAKE
        </span>
        <span className="text-slate-700">|</span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" /> GEMINI 3.5 FLASH ENGINE
        </span>
      </div>
    </footer>
  );
}
