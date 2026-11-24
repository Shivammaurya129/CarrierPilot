import { useState } from "react";
import { motion } from "motion/react";
import { Search, MapPin, Briefcase, DollarSign, ListChecks, Calendar, ArrowRight, BrainCircuit, Sparkles, Building2, UserCheck, ShieldAlert, GraduationCap, Clock } from "lucide-react";
import { useToast } from "../components/Toast.tsx";
import { CareerSuggestion } from "../types.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { saveAIHistory } from "../utils/history.ts";

export default function CareerDiscovery() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  
  // Input states
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>(["Coding", "Design", "Problem Solving"]);
  
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(["JavaScript", "React", "Python"]);
  
  const [education, setEducation] = useState("B.Tech Computer Science");
  const [experienceLevel, setExperienceLevel] = useState<"student" | "entry" | "mid" | "senior">("student");
  const [preferences, setPreferences] = useState("Remote preferred, interest in AI or Full-Stack roles");

  // Response states
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [activePlanTab, setActivePlanTab] = useState<Record<number, "days1to10" | "days11to20" | "days21to30">>({});

  // Tag helper
  const addTag = (type: "interests" | "skills") => {
    const input = type === "interests" ? interestInput : skillInput;
    const list = type === "interests" ? interests : skills;
    const setList = type === "interests" ? setInterests : setSkills;
    const setInput = type === "interests" ? setInterestInput : setSkillInput;

    if (!input.trim()) return;
    if (list.includes(input.trim())) {
      warning(`"${input}" is already added.`);
      return;
    }
    setList([...list, input.trim()]);
    setInput("");
  };

  const removeTag = (type: "interests" | "skills", index: number) => {
    const list = type === "interests" ? interests : skills;
    const setList = type === "interests" ? setInterests : setSkills;
    setList(list.filter((_, i) => i !== index));
  };

  const handleDiscover = async () => {
    if (interests.length === 0) {
      warning("Please add at least one interest tag.");
      return;
    }
    if (skills.length === 0) {
      warning("Please add at least one current skill tag.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests,
          skills,
          education,
          experienceLevel,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error("Failed to retrieve career recommendations. Please try again.");
      }

      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        // Initialize active 30 day plan tabs to "days1to10"
        const initialTabs: Record<number, "days1to10" | "days11to20" | "days21to30"> = {};
        data.suggestions.forEach((_: any, idx: number) => {
          initialTabs[idx] = "days1to10";
        });
        setActivePlanTab(initialTabs);
        
        if (user) {
          await saveAIHistory(user.uid, "career", {
            interests,
            skills,
            education,
            experienceLevel,
            preferences
          }, data);
        }
        
        success("Career paths discovered successfully!");
      } else {
        throw new Error("Invalid response format received from AI.");
      }
    } catch (err: any) {
      console.error(err);
      error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="career-discovery-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-white flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-emerald-400" />
            AI Career Discovery
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Input your background to discover high-match careers, critical skill gaps, and custom action plans.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Powered by Gemini 3.5
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Form - 4 Columns */}
        <div className="lg:col-span-5 space-y-6 glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold font-display text-white pb-3 border-b border-white/10">
            Professional Profile
          </h3>

          {/* Interests */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Interests / Domains
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Frontend, Web3, Data Science"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag("interests")}
                className="flex-1 px-3 py-2 text-sm glass-input rounded-lg text-white placeholder-slate-500"
                id="interest-input"
              />
              <button
                onClick={() => addTag("interests")}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-emerald-400 font-medium rounded-lg text-sm transition-colors border border-white/10"
                id="add-interest-btn"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {interests.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag("interests", idx)}
                    className="hover:text-emerald-100 font-bold ml-0.5"
                    id={`remove-interest-${idx}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {interests.length === 0 && (
                <span className="text-xs text-slate-500 italic">No interest tags added yet.</span>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Current Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. HTML, React, Git, Python"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag("skills")}
                className="flex-1 px-3 py-2 text-sm glass-input rounded-lg text-white placeholder-slate-500"
                id="skill-input"
              />
              <button
                onClick={() => addTag("skills")}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-emerald-400 font-medium rounded-lg text-sm transition-colors border border-white/10"
                id="add-skill-btn"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {skills.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-sky-500/10 border border-sky-500/20 text-sky-300 rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag("skills", idx)}
                    className="hover:text-sky-100 font-bold ml-0.5"
                    id={`remove-skill-${idx}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-500 italic">No skill tags added yet.</span>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Education / Degree
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Science"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm glass-input rounded-lg text-white placeholder-slate-500"
                id="education-input"
              />
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Experience Level
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["student", "entry", "mid", "senior"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setExperienceLevel(level)}
                  className={`py-1.5 rounded-lg text-xs capitalize font-medium transition-all border ${
                    experienceLevel === level
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                      : "glass-input border-white/5 text-slate-400 hover:bg-white/5"
                  }`}
                  id={`exp-level-${level}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Specific Preferences
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Open to remote, high growth startups, salary expectation"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg text-white placeholder-slate-500 resize-none"
              id="preferences-input"
            />
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleDiscover}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            id="discover-careers-btn"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing Career Pathways...
              </>
            ) : (
              <>
                Analyze Core Fit
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Suggestions Display - 7 Columns */}
        <div className="lg:col-span-7 space-y-8">
          {loading ? (
            <div className="space-y-6" id="discovery-loading-skeleton">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl space-y-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="h-6 w-1/3 bg-white/5 rounded-lg" />
                    <div className="h-8 w-12 bg-white/5 rounded-full" />
                  </div>
                  <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-8 bg-white/2 rounded-lg" />
                    <div className="h-8 bg-white/2 rounded-lg" />
                    <div className="h-8 bg-white/2 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-6" id="discovery-results-container">
              <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Discovered High-Match Careers
              </h2>

              {suggestions.map((path, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel rounded-2xl overflow-hidden shadow-xl"
                  id={`career-card-${idx}`}
                >
                  {/* Top Bar Header */}
                  <div className="p-6 border-b border-white/10 bg-white/2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          Path #{idx + 1}
                        </span>
                        <h4 className="text-xl font-bold font-display text-white">{path.title}</h4>
                      </div>
                      <p className="text-slate-400 text-xs italic mt-1">{path.whyItFits}</p>
                    </div>

                    {/* Circular Score Gauge */}
                    <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-xl shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Match Score</div>
                        <div className="text-lg font-bold font-display text-emerald-400">{path.matchScore}%</div>
                      </div>
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="20" cy="20" r="16" className="stroke-white/10 fill-none" strokeWidth="3" />
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            className="stroke-emerald-400 fill-none transition-all duration-1000"
                            strokeWidth="3"
                            strokeDasharray={2 * Math.PI * 16}
                            strokeDashoffset={2 * Math.PI * 16 * (1 - path.matchScore / 100)}
                          />
                        </svg>
                        <UserCheck className="absolute w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-6 space-y-6">
                    {/* Basic Meta Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Salary */}
                      <div className="glass-card p-3 rounded-xl flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-mono">Salary Range</div>
                          <div className="text-sm font-semibold text-white">{path.salaryRange}</div>
                        </div>
                      </div>

                      {/* Companies */}
                      <div className="glass-card p-3 rounded-xl flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-slate-500 uppercase font-mono">Top Hiring Employers</div>
                          <div className="text-xs font-semibold text-white truncate">
                            {path.companies.join(", ")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Missing Skills & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Critical Skill Gaps
                        </h5>
                        <ul className="space-y-1.5">
                          {path.missingSkills.map((sk, sIdx) => (
                            <li key={sIdx} className="text-xs text-slate-300 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
                              {sk}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ListChecks className="w-3.5 h-3.5" />
                          Learning Recommendations
                        </h5>
                        <ul className="space-y-1.5">
                          {path.learningRecommendations.map((lr, lIdx) => (
                            <li key={lIdx} className="text-xs text-slate-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded bg-sky-400 shrink-0" />
                              {lr}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 30 Day Plan Section */}
                    <div className="glass-panel p-4 rounded-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          30-Day Action Blueprint
                        </h5>
                        
                        {/* Day Tabs Selector */}
                        <div className="flex glass-card p-0.5 rounded-lg">
                          {(["days1to10", "days11to20", "days21to30"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActivePlanTab({ ...activePlanTab, [idx]: tab })}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono capitalize transition-all ${
                                activePlanTab[idx] === tab
                                  ? "bg-emerald-500/10 text-emerald-400 font-bold"
                                  : "text-slate-500 hover:text-slate-300"
                              }`}
                              id={`tab-${idx}-${tab}`}
                            >
                              {tab === "days1to10" ? "Days 1-10" : tab === "days11to20" ? "Days 11-20" : "Days 21-30"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Plan Tab Contents */}
                      <div className="min-h-24">
                        <ul className="space-y-2">
                          {path.actionPlan30Day[activePlanTab[idx] || "days1to10"].map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                              <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 shrink-0 font-bold">
                                {sIdx + 1}
                              </div>
                              <span className="flex-1 leading-tight">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl h-full min-h-[400px]">
              <div className="p-4 glass-card rounded-full text-slate-500 mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold font-display text-white">No Career Discovery Executed Yet</h4>
              <p className="text-slate-400 text-sm max-w-sm mt-1">
                Customize your Interests, Skills, and Preferences in the left panel to discover your optimal career directions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
