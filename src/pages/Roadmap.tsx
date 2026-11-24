import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, CheckSquare, Sparkles, BookOpen, ChevronDown, ChevronUp, FolderCode, Award, ArrowRight, RefreshCw, BarChart2 } from "lucide-react";
import { useToast } from "../components/Toast.tsx";
import { RoadmapResponse } from "../types.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { saveAIHistory } from "../utils/history.ts";

export default function Roadmap() {
  const { user } = useAuth();
  const { success, error, warning } = { ...useToast() };

  // Input states
  const [targetRole, setTargetRole] = useState("Full-Stack Developer");
  const [timeframeWeeks, setTimeframeWeeks] = useState(8);
  const [skillInput, setSkillInput] = useState("");
  const [currentSkills, setCurrentSkills] = useState<string[]>(["HTML", "CSS", "Basic JS"]);

  // Response/UI states
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (currentSkills.includes(skillInput.trim())) {
      warning(`"${skillInput}" has already been added.`);
      return;
    }
    setCurrentSkills([...currentSkills, skillInput.trim()]);
    setSkillInput("");
  };

  const removeSkill = (index: number) => {
    setCurrentSkills(currentSkills.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      warning("Please specify your target role.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          timeframeWeeks,
          currentSkills
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate career roadmap. Please try again.");
      }

      const data = await response.json();
      setRoadmap(data);
      
      if (user) {
        await saveAIHistory(user.uid, "roadmap", {
          targetRole,
          timeframeWeeks,
          currentSkills
        }, data);
      }
      
      // Auto expand first 2 weeks
      const initialExp: Record<number, boolean> = {};
      if (data.weeklySchedule) {
        data.weeklySchedule.forEach((item: any) => {
          initialExp[item.week] = item.week <= 2;
        });
      }
      setExpandedWeeks(initialExp);
      
      success("Interactive career roadmap generated!");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const toggleTask = (weekNum: number, taskIdx: number) => {
    const key = `${weekNum}-${taskIdx}`;
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-8" id="career-roadmap-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-emerald-400" />
            AI Career Roadmap
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Create a structured week-by-week blueprint to land your target role. Track your daily tasks and educational milestones.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Interactive schedule tracking
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Parameter Panel - 4 Columns */}
        <div className="lg:col-span-4 space-y-6 glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold font-display text-white pb-2 border-b border-white/10">
            Roadmap Architect
          </h3>

          {/* Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Target Role Goal
            </label>
            <input
              type="text"
              placeholder="e.g. DevOps Specialist, Backend Lead"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg text-white"
              id="roadmap-target-role"
            />
          </div>

          {/* Timeframe weeks */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Duration Timeframe
              </label>
              <span className="text-xs font-bold text-emerald-400 font-mono">{timeframeWeeks} Weeks</span>
            </div>
            <input
              type="range"
              min={4}
              max={12}
              step={1}
              value={timeframeWeeks}
              onChange={(e) => setTimeframeWeeks(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
              id="roadmap-timeframe-slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4 Weeks</span>
              <span>8 Weeks</span>
              <span>12 Weeks</span>
            </div>
          </div>

          {/* Current Skills tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              My Existing Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Git, Basic Linux"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="flex-1 px-3 py-2 text-sm glass-input rounded-lg text-white placeholder-slate-500"
                id="roadmap-skill-input"
              />
              <button
                onClick={addSkill}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-lg font-medium text-sm border border-white/10"
                id="roadmap-add-skill-btn"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {currentSkills.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs glass-card text-slate-300 rounded"
                >
                  {tag}
                  <button onClick={() => removeSkill(idx)} className="hover:text-rose-400 font-bold ml-1" id={`roadmap-remove-skill-${idx}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Trigger */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            id="generate-roadmap-btn"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin text-slate-950" />
                Drafting Schedule...
              </>
            ) : (
              <>
                Generate Roadmap
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Schedule Display - 8 Columns */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="space-y-4" id="roadmap-loading-skeleton">
              <div className="glass-panel p-6 rounded-2xl animate-pulse flex justify-between">
                <div className="space-y-2 w-1/3">
                  <div className="h-4 bg-white/5 rounded" />
                  <div className="h-3 bg-white/5 rounded" />
                </div>
                <div className="h-10 w-24 bg-white/5 rounded" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-panel p-4 rounded-xl h-14 animate-pulse" />
                ))}
              </div>
            </div>
          ) : roadmap ? (
            <div className="space-y-6" id="roadmap-results-container">
              {/* Score header */}
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between gap-6">
                <div>
                  <h4 className="text-lg font-bold font-display text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-emerald-400" />
                    Estimated Launch Readiness
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your estimated baseline starting readiness for <strong>{targetRole}</strong> role. Follow the weekly objectives to score 100%!
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2.5 glass-card px-4 py-3 rounded-xl text-center">
                  <div>
                    <div className="text-[10px] uppercase font-mono text-slate-500">Readiness Score</div>
                    <div className="text-2xl font-extrabold font-display text-emerald-400">{roadmap.jobReadinessScore}%</div>
                  </div>
                </div>
              </div>

              {/* Weekly Timeline */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Weekly Milestone Tracks</h3>
                {roadmap.weeklySchedule.map((weekItem) => {
                  const isOpen = expandedWeeks[weekItem.week];
                  return (
                    <div
                      key={weekItem.week}
                      className="glass-panel rounded-xl overflow-hidden transition-all"
                      id={`week-accordion-${weekItem.week}`}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleWeek(weekItem.week)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/2 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center font-mono text-xs shrink-0">
                            W{weekItem.week}
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white font-display leading-tight">{weekItem.focus}</h5>
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                              {weekItem.tasks.length} core tasks
                            </span>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </button>

                      {/* Accordion Body */}
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-white/5 space-y-4">
                          {/* Tasks Checkbox List */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">Tasks & Deliverables</span>
                            <div className="space-y-2">
                              {weekItem.tasks.map((task, tIdx) => {
                                const isDone = completedTasks[`${weekItem.week}-${tIdx}`];
                                return (
                                  <button
                                    key={tIdx}
                                    onClick={() => toggleTask(weekItem.week, tIdx)}
                                    className="w-full text-left flex items-start gap-2.5 p-2 rounded-lg glass-card hover:bg-white/5 transition-all cursor-pointer"
                                    id={`task-${weekItem.week}-${tIdx}`}
                                  >
                                    <div className="mt-0.5 shrink-0">
                                      <CheckSquare className={`w-4 h-4 transition-colors ${isDone ? "text-emerald-400 fill-emerald-400/20" : "text-slate-600"}`} />
                                    </div>
                                    <span className={`text-xs ${isDone ? "text-slate-500 line-through" : "text-slate-300 font-medium"}`}>
                                      {task}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Suggested Resources */}
                          <div className="space-y-2 pt-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block">Education resources</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {weekItem.resources.map((res, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={`https://www.google.com/search?q=${encodeURIComponent(res.name)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 rounded-lg glass-card hover:bg-white/5 flex items-center justify-between hover:border-sky-500/30 transition-all text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    <span className="font-semibold text-slate-300 truncate">{res.name}</span>
                                  </div>
                                  <span className="shrink-0 px-1.5 py-0.5 bg-sky-500/10 text-[9px] font-mono uppercase text-sky-400 border border-sky-500/15 rounded">
                                    {res.type}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Capstone Projects & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Projects */}
                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                    <FolderCode className="w-4 h-4" />
                    Portfolio Capstones
                  </h5>
                  <div className="space-y-3">
                    {roadmap.projects.map((proj, pIdx) => (
                      <div key={pIdx} className="glass-card p-3 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-white font-display">{proj.title}</div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase border ${
                            proj.difficulty === "Advanced" ? "border-rose-500/20 text-rose-400 bg-rose-500/5" : "border-amber-500/20 text-amber-400 bg-amber-500/5"
                          }`}>
                            {proj.difficulty}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-snug">Expected Deliverables:</div>
                        <ul className="list-disc list-inside text-[9px] text-slate-400 leading-snug pl-1">
                          {proj.deliverables.map((del, dIdx) => (
                            <li key={dIdx}>{del}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                    <Award className="w-4 h-4" />
                    Target Credentials
                  </h5>
                  <ul className="space-y-2">
                    {roadmap.certifications.map((cert, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-500 italic mt-4 pt-2 border-t border-white/5">
                    Acquiring these certifications significantly improves ATS ranking and employer credibility.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl h-full min-h-[400px]">
              <div className="p-4 glass-card rounded-full text-slate-500 mb-4">
                <Calendar className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold font-display text-white">No Roadmap Generated</h4>
              <p className="text-slate-400 text-sm max-w-sm mt-1">
                Establish your goal role and current skill markers to formulate a structured learning path.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
