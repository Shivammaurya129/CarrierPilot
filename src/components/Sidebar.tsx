import { Compass, BrainCircuit, FileText, Calendar, MessageSquare, Linkedin, ShieldAlert, Menu, X, Sparkles, LogOut, User, History } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export default function Sidebar({ activeView, onSelectView, mobileOpen, onToggleMobile }: SidebarProps) {
  const { user, profile, logout } = useAuth();

  const menuItems = [
    { id: "overview", label: "Command Center", icon: Compass },
    { id: "career", label: "Career Discovery", icon: BrainCircuit },
    { id: "resume", label: "Resume Analyzer", icon: FileText },
    { id: "roadmap", label: "Career Roadmap", icon: Calendar },
    { id: "interview", label: "Interview Prep", icon: MessageSquare },
    { id: "linkedin", label: "LinkedIn Generator", icon: Linkedin },
    { id: "skillgap", label: "Skill Gap Analyzer", icon: ShieldAlert },
    { id: "profile", label: "Professional Profile", icon: User },
    { id: "history", label: "AI History Archive", icon: History }
  ];

  const handleMenuClick = (id: string) => {
    onSelectView(id);
    if (mobileOpen) {
      onToggleMobile();
    }
  };

  return (
    <>
      {/* Mobile Sidebar overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggleMobile}
          id="mobile-sidebar-backdrop"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 glass-panel flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        id="app-sidebar"
      >
        <div className="flex flex-col flex-1">
          {/* Logo Brand Header */}
          <div className="h-16 border-b border-white/10 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-display font-extrabold text-slate-950 text-base shadow shadow-emerald-500/25">
                CP
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-white font-display">CareerPilot AI</span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 tracking-wider uppercase">Strategic AI</span>
              </div>
            </div>
            
            {/* Close button on mobile */}
            <button onClick={onToggleMobile} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white lg:hidden" id="close-mobile-sidebar-btn">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider px-3 block mb-2">Core Flight Deck</span>
            {menuItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                  id={`sidebar-link-${item.id}`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Authenticated User display info */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-white/2">
          {user && (
            <>
              <div className="flex items-center gap-2.5 p-1.5 rounded-lg glass-card">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                  {(profile?.name || user.displayName || user.email || "P").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                    {profile?.name || user.displayName || "Pilot"}
                  </div>
                  <div className="text-xs font-semibold text-slate-300 truncate font-mono" id="auth-user-email">
                    {user.email}
                  </div>
                </div>
              </div>
              
              <button
                onClick={async () => {
                  try {
                    await logout();
                  } catch (e) {
                    console.error("Logout failed:", e);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                id="sidebar-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout Flight Session
              </button>
            </>
          )}
          
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span>v1.0.0 Production</span>
            <span className="flex items-center gap-1 text-emerald-500/80">
              <Sparkles className="w-3 h-3" /> Ready
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
