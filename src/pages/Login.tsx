import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useToast } from "../components/Toast.tsx";
import { Sparkles, Mail, Lock, LogIn, Chrome, AlertTriangle } from "lucide-react";

interface LoginProps {
  onNavigate: (view: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please fill in all fields");
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      await login(email, password, remember);
      success("Logged in successfully!");
      onNavigate("overview");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      success("Logged in with Google successfully!");
      onNavigate("overview");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("unauthorized-domain")) {
        setAuthError("unauthorized-domain");
        error("Unauthorized Domain: This domain is not whitelisted in Firebase Auth.");
      } else if (msg.includes("invalid-credential") || msg.includes("auth/invalid-credential") || msg.includes("auth/operation-not-allowed")) {
        setAuthError("invalid-credential");
        error("Invalid Credential: Google Sign-in provider might not be enabled in Firebase.");
      } else {
        setAuthError("general");
        error(err.message || "Google Sign-In failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    const demoEmail = "demo@careerpilot.ai";
    const demoPass = "careerpilot123";
    try {
      await login(demoEmail, demoPass, true);
      success("Logged in with Sandbox Account!");
      onNavigate("overview");
    } catch (err: any) {
      try {
        await register(demoEmail, demoPass, "Flight Pilot");
        success("Sandbox Account initialized and logged in!");
        onNavigate("overview");
      } catch (regErr: any) {
        console.error("Sandbox failure:", regErr);
        error("Sandbox setup failed. Please register with a new custom email/password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4" id="login-container">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative overflow-hidden space-y-6">
        {/* Glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[80px]" />
        
        <div className="text-center relative z-10 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Log in to CareerPilot AI to manage your portfolio and resume enhancements.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10" id="login-form">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-lg text-white"
                id="login-email-input"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-[10px] font-mono text-emerald-400 hover:underline font-bold"
                id="login-forgot-pass-btn"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-lg text-white"
                id="login-password-input"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-0 w-4 h-4"
                id="login-remember-checkbox"
              />
              <span className="text-xs text-slate-400">Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
            id="login-submit-btn"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase font-bold">or</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          id="login-google-btn"
        >
          <Chrome className="w-4 h-4 text-emerald-400" />
          Continue with Google
        </button>

        <button
          onClick={handleDemoSignIn}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all cursor-pointer disabled:opacity-50"
          id="login-demo-btn"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          One-Click Demo Sandbox Bypass
        </button>

        {authError && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3 text-xs text-slate-300 relative z-10 animate-fade-in" id="auth-troubleshoot-panel">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-mono uppercase tracking-wider text-[10px]">
              <AlertTriangle className="w-4 h-4" />
              Google Auth Troubleshooting Guide
            </div>
            
            {authError === "unauthorized-domain" && (
              <div className="space-y-2">
                <p className="text-slate-300">
                  This preview domain is not whitelisted in your Firebase project. To resolve this:
                </p>
                <ol className="list-decimal pl-4 space-y-1.5 font-mono text-[10px] text-slate-400">
                  <li>
                    Open the <a href="https://console.firebase.google.com/project/careerpilot-ai-c091b/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">Firebase Console</a>.
                  </li>
                  <li>
                    Go to <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong>.
                  </li>
                  <li>
                    Add the following domains:
                    <div className="bg-slate-950 p-2 rounded border border-white/5 mt-1 select-all font-sans text-white text-[10px] leading-relaxed">
                      <div>ais-dev-l2utozc3yv4ejs3kk53bdf-404441336894.asia-southeast1.run.app</div>
                      <div>ais-pre-l2utozc3yv4ejs3kk53bdf-404441336894.asia-southeast1.run.app</div>
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {authError === "invalid-credential" && (
              <div className="space-y-2">
                <p className="text-slate-300">
                  Google Sign-in might not be enabled or there is a credential mismatch. To resolve this:
                </p>
                <ol className="list-decimal pl-4 space-y-1.5 font-mono text-[10px] text-slate-400">
                  <li>
                    Open the <a href="https://console.firebase.google.com/project/careerpilot-ai-c091b/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">Firebase Console</a>.
                  </li>
                  <li>
                    Go to <strong>Authentication</strong> &gt; <strong>Sign-in method</strong> &gt; click <strong>Add new provider</strong>.
                  </li>
                  <li>
                    Select <strong>Google</strong>, enable it, and select your project's support email, then click <strong>Save</strong>.
                  </li>
                </ol>
              </div>
            )}

            {authError === "general" && (
              <p className="text-slate-400">
                Google Auth encountered an unexpected error. Ensure your network is active and popups are not blocked.
              </p>
            )}

            <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
              <p className="text-emerald-400 font-semibold text-[11px]">
                💡 Bypass Instantly:
              </p>
              <p className="text-[11px] leading-relaxed text-slate-400">
                You can bypass Google Auth entirely by registering with an email & password! Email/Password registration is fully supported, secure, and stores your career history directly in Firestore.
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <button
            onClick={() => onNavigate("register")}
            className="text-emerald-400 hover:underline font-bold"
            id="login-go-register-btn"
          >
            Register Here
          </button>
        </p>
      </div>
    </div>
  );
}
