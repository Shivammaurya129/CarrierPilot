import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ToastProvider } from "./components/Toast.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";

// Pages
import DashboardOverview from "./pages/DashboardOverview.tsx";
import CareerDiscovery from "./pages/CareerDiscovery.tsx";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.tsx";
import Roadmap from "./pages/Roadmap.tsx";
import InterviewPrep from "./pages/InterviewPrep.tsx";
import LinkedInGenerator from "./pages/LinkedInGenerator.tsx";
import SkillGap from "./pages/SkillGap.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import HistoryDashboard from "./pages/HistoryDashboard.tsx";

// Auth
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";

function AppContent() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<string>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Handle auto routing / protection
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in -> force login/register/forgot-password view
        if (activeView !== "login" && activeView !== "register" && activeView !== "forgot-password") {
          setActiveView("login");
        }
      } else {
        // Logged in -> redirect off auth views to main board
        if (activeView === "login" || activeView === "register" || activeView === "forgot-password") {
          setActiveView("overview");
        }
      }
    }
  }, [user, loading, activeView]);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const renderActiveView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]" id="loading-deck">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono text-slate-400">Loading career flight deck...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      switch (activeView) {
        case "register":
          return <Register onNavigate={setActiveView} />;
        case "forgot-password":
          return <ForgotPassword onNavigate={setActiveView} />;
        case "login":
        default:
          return <Login onNavigate={setActiveView} />;
      }
    }

    switch (activeView) {
      case "overview":
        return <DashboardOverview onSelectView={setActiveView} />;
      case "career":
        return <CareerDiscovery />;
      case "resume":
        return <ResumeAnalyzer />;
      case "roadmap":
        return <Roadmap />;
      case "interview":
        return <InterviewPrep />;
      case "linkedin":
        return <LinkedInGenerator />;
      case "skillgap":
        return <SkillGap />;
      case "profile":
        return <UserProfilePage />;
      case "history":
        return <HistoryDashboard />;
      default:
        return <DashboardOverview onSelectView={setActiveView} />;
    }
  };

  const isAuthView = !user && ["login", "register", "forgot-password"].includes(activeView);

  if (isAuthView) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center relative overflow-hidden" id="app-root-layout">
        {/* Ambient Blur Background Blorbs */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" id="ambient-backdrop">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[130px]" />
          <div className="absolute top-[35%] left-[30%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>

        <main className="w-full max-w-7xl mx-auto px-4 relative z-10" id="app-main-canvas">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex relative overflow-hidden" id="app-root-layout">
      {/* Ambient Blur Background Blorbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" id="ambient-backdrop">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute top-[35%] left-[30%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Sidebar Nav */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        mobileOpen={mobileSidebarOpen}
        onToggleMobile={toggleMobileSidebar}
      />

      {/* Main Body Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 min-h-screen relative z-10">
        {/* Navigation bar */}
        <Navbar activeView={activeView} onToggleMobile={toggleMobileSidebar} />

        {/* Content canvas container */}
        <main className="flex-1 pt-24 px-4 sm:px-6 md:px-8 max-w-7xl w-full mx-auto relative z-10" id="app-main-canvas">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Diagnostic Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
