import { useState } from "react";
import { motion } from "motion/react";
import { ShieldAlert, Sparkles, Plus, AlertTriangle, Check, Award, RefreshCw, BarChart3, HelpCircle, GraduationCap } from "lucide-react";
import { useToast } from "../components/Toast.tsx";
import { SkillGapResponse } from "../types.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { saveAIHistory } from "../utils/history.ts";

export default function SkillGap() {
  const { user } = useAuth();
  const { success, error, warning } = { ...useToast() };

  // Inputs
  const [targetRole, setTargetRole] = useState("Data Engineer");
  const [skillInput, setSkillInput] = useState("");
  const [mySkills, setMySkills] = useState<string[]>(["SQL", "Python", "Pandas"]);

  // Response states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillGapResponse | null>(null);

  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (mySkills.includes(skillInput.trim())) {
      warning(`"${skillInput}" is already added.`);
      return;
    }
    setMySkills([...mySkills, skillInput.trim()]);
    setSkillInput("");
  };

  const removeSkill = (index: number) => {
    setMySkills(mySkills.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      warning("Please specify your target role.");
      return;
    }
    if (mySkills.length === 0) {
      warning("Please add at least one existing skill.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          mySkills
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process skill gap analysis. Please try again.");
      }

      const data = await response.json();
      setResult(data);
      
      if (user) {
        await saveAIHistory(user.uid, "skillgap", {
          targetRole,
          mySkills
        }, data);
      }
      
      success("Skill gap analysis processed successfully!");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to analyze skills.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="skill-gap-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-white flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-emerald-400" />
            Skill Gap Analyzer
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Contrast your existing competencies against target role expectations. Identify high-priority missing skills and custom learning schedules.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Powered by Gemini 3.5
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Configuration - 4 Columns */}
        <div className="lg:col-span-4 space-y-6 glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold font-display text-white pb-2 border-b border-white/10">
            Profile Matrix
          </h3>

          {/* Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Target Role Goal
            </label>
            <input
              type="text"
              placeholder="e.g. Data Scientist, Cloud Architect"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg text-white"
              id="skillgap-target-role"
            />
          </div>

          {/* My Skills Tag Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              My Existing Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. AWS, Node.js, C++"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="flex-1 px-3 py-2 text-sm glass-input rounded-lg text-white"
                id="skillgap-input"
              />
              <button
                onClick={addSkill}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-lg text-sm font-medium flex items-center justify-center border border-white/10 cursor-pointer"
                id="skillgap-add-btn"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {mySkills.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs glass-card text-slate-300 rounded"
                >
                  {tag}
                  <button onClick={() => removeSkill(idx)} className="hover:text-rose-400 font-bold ml-1" id={`skillgap-remove-btn-${idx}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Trigger */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            id="analyze-skillgap-btn"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin text-slate-950" />
                Auditing Competency Gap...
              </>
            ) : (
              <>
                Perform Gap Analysis
                <BarChart3 className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </div>

        {/* Right Output Analysis - 8 Columns */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="glass-panel p-8 rounded-2xl h-80 animate-pulse space-y-4" id="skillgap-skeleton">
              <div className="h-6 bg-white/5 rounded w-1/4" />
              <div className="h-4 bg-white/2 rounded w-full" />
              <div className="h-24 bg-white/2 rounded w-full" />
            </div>
          ) : result ? (
            <div className="space-y-6" id="skillgap-results-container">
              {/* Dual Progress Stats header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gap Percentage */}
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Overall Skill Gap</span>
                    <h4 className="text-2xl font-extrabold font-display text-rose-400 mt-1">{result.skillGapPercentage}%</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Competency vacuum relative to standard profiles.</p>
                  </div>
                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full" style={{ width: `${result.skillGapPercentage}%` }} />
                  </div>
                </div>

                {/* Job Readiness */}
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Estimated Job Readiness</span>
                    <h4 className="text-2xl font-extrabold font-display text-emerald-400 mt-1">{result.jobReadinessScore}%</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Profile compliance alignment with market recruiters.</p>
                  </div>
                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${result.jobReadinessScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Missing Skills Matrix */}
              <div className="glass-panel p-6 rounded-2xl space-y-4" id="missing-skills-matrix">
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-white/10">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  Target Competencies to Acquire
                </h5>

                <div className="space-y-3 pt-1">
                  {result.missingSkills.map((item, idx) => (
                    <div
                      key={idx}
                      className="glass-card p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                      id={`skill-row-${idx}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h6 className="text-xs font-bold text-white font-mono">{item.skill}</h6>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold ${
                            item.importance === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            item.importance === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          }`}>
                            {item.importance} Priority
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{item.learningPath}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Step Bridge Learning plan */}
              <div className="glass-panel p-6 rounded-2xl space-y-4" id="learning-plan-box">
                <h5 className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-white/10">
                  <GraduationCap className="w-4.5 h-4.5" />
                  Structured Gap Bridging Plan
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {result.learningPlan.map((step, idx) => (
                    <div key={idx} className="glass-card p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[10px] font-bold text-sky-400 font-mono">
                          {idx + 1}
                        </div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Phase {idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl h-full min-h-[400px]">
              <div className="p-4 glass-card rounded-full text-slate-500 mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold font-display text-white">Gap Analyzer Standing By</h4>
              <p className="text-slate-400 text-sm max-w-sm mt-1">
                Provide your core goal position and active skill checklists to evaluate your comparative market parity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
