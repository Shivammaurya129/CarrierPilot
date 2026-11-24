import { useState } from "react";
import { motion } from "motion/react";
import { Linkedin, Sparkles, Copy, Check, FileText, Send, UserCheck, HelpCircle, RefreshCw, MessageSquare } from "lucide-react";
import { useToast } from "../components/Toast.tsx";
import { LinkedInResponse } from "../types.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { saveAIHistory } from "../utils/history.ts";

export default function LinkedInGenerator() {
  const { user } = useAuth();
  const { success, error, warning } = { ...useToast() };

  // Setup inputs
  const [recipientRole, setRecipientRole] = useState("Engineering Manager");
  const [recipientCompany, setRecipientCompany] = useState("Stripe");
  const [myBackground, setMyBackground] = useState("MCA final-year student interested in cloud infrastructure and distributed APIs");
  const [purpose, setPurpose] = useState<"connection" | "referral" | "recruiter" | "followup">("connection");
  const [tone, setTone] = useState<"professional" | "casual" | "enthusiastic">("professional");

  // Output states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LinkedInResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!recipientRole.trim() || !recipientCompany.trim()) {
      warning("Please specify both the Recipient's Role and their Company.");
      return;
    }

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientRole,
          recipientCompany,
          myBackground,
          purpose,
          tone
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate LinkedIn outreach draft. Please try again.");
      }

      const data = await response.json();
      setResult(data);
      
      if (user) {
        await saveAIHistory(user.uid, "linkedin", {
          recipientRole,
          recipientCompany,
          myBackground,
          purpose,
          tone
        }, data);
      }
      
      success("LinkedIn outreach copy drafted successfully!");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to generate copy.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.messageBody);
    setCopied(true);
    success("Copied message text to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8" id="linkedin-generator-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-white flex items-center gap-2">
            <Linkedin className="w-8 h-8 text-emerald-400" />
            LinkedIn Message Generator
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Draft high-impact cold-outreach templates for connections, referrals, recruiter queries, or follow-ups.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          High-conversion copywriting rules
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Parameter panel - 5 Columns */}
        <div className="lg:col-span-5 space-y-6 glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold font-display text-white pb-2 border-b border-white/10">
            Outreach Blueprint
          </h3>

          {/* Recipient Role */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Recipient's Role / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Recruiter, Lead Engineer"
              value={recipientRole}
              onChange={(e) => setRecipientRole(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg text-white"
              id="linkedin-recipient-role"
            />
          </div>

          {/* Recipient Company */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Recipient's Company
            </label>
            <input
              type="text"
              placeholder="e.g. Stripe, Coinbase, Microsoft"
              value={recipientCompany}
              onChange={(e) => setRecipientCompany(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg text-white"
              id="linkedin-recipient-company"
            />
          </div>

          {/* Outreach Purpose */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Outreach Purpose
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: "connection", label: "Connection Request" },
                { val: "referral", label: "Ask for Referral" },
                { val: "recruiter", label: "Recruiter Query" },
                { val: "followup", label: "Follow-up Note" }
              ].map((pItem) => (
                <button
                  key={pItem.val}
                  onClick={() => setPurpose(pItem.val as any)}
                  className={`py-2 px-2 rounded-lg text-[11px] font-medium transition-all border text-left flex items-center justify-between ${
                    purpose === pItem.val
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "glass-input border-white/5 text-slate-400 hover:bg-white/5"
                  }`}
                  id={`purpose-btn-${pItem.val}`}
                >
                  {pItem.label}
                  <UserCheck className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Message Tone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Message Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["professional", "casual", "enthusiastic"] as const).map((tItem) => (
                <button
                  key={tItem}
                  onClick={() => setTone(tItem)}
                  className={`py-1.5 rounded-lg text-xs capitalize font-medium transition-all border ${
                    tone === tItem
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "glass-input border-white/5 text-slate-400 hover:bg-white/5"
                  }`}
                  id={`tone-btn-${tItem}`}
                >
                  {tItem}
                </button>
              ))}
            </div>
          </div>

          {/* My Background context */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              My Profile / Pitch Hook
            </label>
            <textarea
              rows={4}
              placeholder="e.g. MCA final-year student interested in backend scale, or a React Developer with 1 year startup experience..."
              value={myBackground}
              onChange={(e) => setMyBackground(e.target.value)}
              className="w-full px-3 py-2 text-xs glass-input rounded-lg text-white placeholder-slate-500 resize-none"
              id="linkedin-background-area"
            />
          </div>

          {/* Trigger */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            id="draft-linkedin-btn"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin text-slate-950" />
                Engineering Copy...
              </>
            ) : (
              <>
                Generate Message Pitch
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Output Draft display - 7 Columns */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="glass-panel p-6 rounded-2xl h-80 animate-pulse space-y-4" id="linkedin-skeleton">
              <div className="h-4 bg-white/5 rounded w-1/3" />
              <div className="h-40 bg-white/2 rounded w-full" />
              <div className="h-10 bg-white/5 rounded w-1/4" />
            </div>
          ) : result ? (
            <div className="space-y-6" id="linkedin-results-container">
              {/* Draft Box */}
              <div className="glass-panel rounded-2xl overflow-hidden shadow-xl" id="linkedin-draft-box">
                {/* Header controls */}
                <div className="px-5 py-3.5 bg-white/2 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4.5 h-4.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-white font-display">Generated Outreach Copy</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                    id="copy-linkedin-draft"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Draft
                      </>
                    )}
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4">
                  {result.subject && (
                    <div className="pb-3 border-b border-white/5">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-0.5">InMail Subject Line</span>
                      <p className="text-xs font-bold text-white font-mono">{result.subject}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-1">Message Body</span>
                    <p className="text-xs text-slate-100 font-mono leading-relaxed glass-card p-4 rounded-xl whitespace-pre-wrap">
                      {result.messageBody}
                    </p>
                  </div>
                </div>
              </div>

              {/* Strategic Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Why it works */}
                <div className="glass-panel p-5 rounded-2xl space-y-2">
                  <h5 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                    <HelpCircle className="w-4 h-4" />
                    Copy Strategy
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>

                {/* Follow up timeline */}
                <div className="glass-panel p-5 rounded-2xl space-y-2">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                    <MessageSquare className="w-4 h-4" />
                    Outreach Etiquette
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.followUpTip}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl h-full min-h-[400px]">
              <div className="p-4 glass-card rounded-full text-slate-500 mb-4">
                <Linkedin className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold font-display text-white">Outreach Console Silent</h4>
              <p className="text-slate-400 text-sm max-w-sm mt-1">
                Furnish the recipient's target role, company, and your personal credentials to get custom pitch templates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
