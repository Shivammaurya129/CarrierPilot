import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useToast } from "../components/Toast.tsx";
import { Mail, HelpCircle, ArrowLeft } from "lucide-react";

interface ForgotPasswordProps {
  onNavigate: (view: string) => void;
}

export default function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const { resetPassword } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      success("Password reset email sent! Please check your inbox.");
      onNavigate("login");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to send reset email. Verify your address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4" id="forgot-password-container">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative overflow-hidden space-y-6">
        {/* Glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[80px]" />
        
        <div className="text-center relative z-10 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Enter your email below and we'll send you a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10" id="forgot-password-form">
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
                id="forgot-email-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
            id="forgot-submit-btn"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="relative z-10 text-center">
          <button
            onClick={() => onNavigate("login")}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 font-bold transition-colors"
            id="forgot-go-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
