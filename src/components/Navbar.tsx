import { Menu, Compass, BrainCircuit, FileText, Calendar, MessageSquare, Linkedin, ShieldAlert, Clock, RefreshCw } from "lucide-react";

interface NavbarProps {
  activeView: string;
  onToggleMobile: () => void;
}

export default function Navbar({ activeView, onToggleMobile }: NavbarProps) {
  const getBreadcrumb = () => {
    switch (activeView) {
      case "overview":
        return { label: "Command Center", icon: Compass };
      case "career":
        return { label: "AI Career Discovery", icon: BrainCircuit };
      case "resume":
        return { label: "Resume Analyzer", icon: FileText };
      case "roadmap":
        return { label: "AI Career Roadmap", icon: Calendar };
      case "interview":
        return { label: "Interview Preparation", icon: MessageSquare };
      case "linkedin":
        return { label: "LinkedIn message generator", icon: Linkedin };
      case "skillgap":
        return { label: "Skill Gap Analyzer", icon: ShieldAlert };
      default:
        return { label: "Dashboard", icon: Compass };
    }
  };

  const breadcrumb = getBreadcrumb();
  const CurrentIcon = breadcrumb.icon;

  return (
    <header
      className="h-16 bg-[#030712]/40 backdrop-blur-md border-b border-white/10 fixed top-0 right-0 left-0 lg:left-64 z-30 flex items-center justify-between px-6"
      id="app-navbar"
    >
      {/* Mobile Toggle & Path */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white lg:hidden cursor-pointer"
          id="mobile-hamburger-btn"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        {/* Trail path */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="font-display">CareerPilot AI</span>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-1.5 text-white">
            <CurrentIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-display font-bold">{breadcrumb.label}</span>
          </div>
        </div>
      </div>

      {/* Right Clock Metadatas */}
      <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400 glass-card px-3 py-1.5 rounded-lg">
        <Clock className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">2026-07-11 UTC</span>
        <span className="text-emerald-400 font-bold">READY</span>
      </div>
    </header>
  );
}
