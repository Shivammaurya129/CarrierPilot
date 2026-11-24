import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BrainCircuit,
  FileText,
  Calendar,
  MessageSquare,
  Linkedin,
  ShieldAlert,
  Sparkles,
  Trophy,
  ArrowRight,
  UserCheck,
  Flame,
  BookOpen,
  ArrowUpRight,
  History,
  Activity
} from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { fetchAIHistory, HistoryRecord } from "../utils/history.ts";

interface DashboardOverviewProps {
  onSelectView: (view: string) => void;
}

export default function DashboardOverview({ onSelectView }: DashboardOverviewProps) {
  const { user, profile, profileCompletion } = useAuth();
  
  // Latest records states
  const [latestResume, setLatestResume] = useState<HistoryRecord | null>(null);
  const [latestCareer, setLatestCareer] = useState<HistoryRecord | null>(null);
  const [latestRoadmap, setLatestRoadmap] = useState<HistoryRecord | null>(null);
  const [latestInterview, setLatestInterview] = useState<HistoryRecord | null>(null);
  const [latestSkillGap, setLatestSkillGap] = useState<HistoryRecord | null>(null);
  const [latestLinkedIn, setLatestLinkedIn] = useState<HistoryRecord | null>(null);
  const [allHistory, setAllHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load latest data for all modules
  useEffect(() => {
    const loadAllStats = async () => {
      if (!user) return;
      try {
        const [careerRecs, resumeRecs, roadmapRecs, interviewRecs, linkedinRecs, skillgapRecs] = await Promise.all([
          fetchAIHistory(user.uid, "career"),
          fetchAIHistory(user.uid, "resume"),
          fetchAIHistory(user.uid, "roadmap"),
          fetchAIHistory(user.uid, "interview"),
          fetchAIHistory(user.uid, "linkedin"),
          fetchAIHistory(user.uid, "skillgap"),
        ]);

        if (careerRecs.length > 0) setLatestCareer(careerRecs[0]);
        if (resumeRecs.length > 0) setLatestResume(resumeRecs[0]);
        if (roadmapRecs.length > 0) setLatestRoadmap(roadmapRecs[0]);
        if (interviewRecs.length > 0) setLatestInterview(interviewRecs[0]);
        if (linkedinRecs.length > 0) setLatestLinkedIn(linkedinRecs[0]);
        if (skillgapRecs.length > 0) setLatestSkillGap(skillgapRecs[0]);

        // Merge all history records and sort
        const combined = [
          ...careerRecs,
          ...resumeRecs,
          ...roadmapRecs,
          ...interviewRecs,
          ...linkedinRecs,
          ...skillgapRecs
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setAllHistory(combined);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllStats();
  }, [user]);

  // Compute daily activity histogram for the last 7 days
  const getActivityData = () => {
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString(undefined, { weekday: "short" });
      days.push(dayName);

      // Find count on this calendar date
      const count = allHistory.filter((h) => {
        const hDate = new Date(h.createdAt);
        return hDate.toDateString() === d.toDateString();
      }).length;
      counts.push(count);
    }
    return { days, counts };
  };

  const { days, counts } = getActivityData();
  const maxCount = Math.max(...counts, 1);

  const cards = [
    {
      id: "career",
      title: "Career Discovery",
      desc: "Analyze interests, core disciplines, and preferences to discover high-salary fit roles and action plans.",
      icon: BrainCircuit,
      color: "text-emerald-400 border-white/10 bg-white/2 hover:border-emerald-500/40 backdrop-blur-sm shadow-lg",
      pill: "Match Analytics",
      latest: latestCareer ? `Latest: ${latestCareer.input.targetRole || "Profile"}` : "No discovery yet"
    },
    {
      id: "resume",
      title: "Resume Analyzer",
      desc: "Evaluate your PDF or pasted resume against professional ATS templates. Get structured strengths, keywords, and project ideas.",
      icon: FileText,
      color: "text-sky-400 border-white/10 bg-white/2 hover:border-sky-500/40 backdrop-blur-sm shadow-lg",
      pill: "ATS Optimizer",
      latest: latestResume ? `ATS score: ${latestResume.output.atsScore}%` : "No analysis yet"
    },
    {
      id: "roadmap",
      title: "Career Roadmap",
      desc: "Architect detailed, interactive week-by-week timelines with checkboxes, resources, capstones, and certificates.",
      icon: Calendar,
      color: "text-amber-400 border-white/10 bg-white/2 hover:border-amber-500/40 backdrop-blur-sm shadow-lg",
      pill: "Schedule Architect",
      latest: latestRoadmap ? `Latest: ${latestRoadmap.input.targetRole || "Timeline"}` : "No roadmap yet"
    },
    {
      id: "interview",
      title: "Interview Prep",
      desc: "Practice HR, conceptual, SQL, and behavioral STAR questions. Grade answers out of 100 with professional rewrites.",
      icon: MessageSquare,
      color: "text-purple-400 border-white/10 bg-white/2 hover:border-purple-500/40 backdrop-blur-sm shadow-lg",
      pill: "STAR Grading Panel",
      latest: latestInterview ? `Tips unlocked: ${latestInterview.output.questions?.length || 0} questions` : "No mock session yet"
    },
    {
      id: "linkedin",
      title: "LinkedIn Generator",
      desc: "Draft cold connections, referral queries, or recruiter pitches tailored with custom background hooks and tones.",
      icon: Linkedin,
      color: "text-blue-400 border-white/10 bg-white/2 hover:border-blue-500/40 backdrop-blur-sm shadow-lg",
      pill: "Conversion Pitch",
      latest: latestLinkedIn ? `Recipient: ${latestLinkedIn.input.recipientName || "Contact"}` : "No pitch drafted yet"
    },
    {
      id: "skillgap",
      title: "Skill Gap Analyzer",
      desc: "Audit core compliance margins relative to industry criteria. Gain targeted learning maps to bridge technical vacancies.",
      icon: ShieldAlert,
      color: "text-rose-400 border-white/10 bg-white/2 hover:border-rose-500/40 backdrop-blur-sm shadow-lg",
      pill: "Gap Audit Matrix",
      latest: latestSkillGap ? `Gap score: ${latestSkillGap.output.skillGapPercentage}%` : "No report yet"
    }
  ];

  return (
    <div className="space-y-8" id="dashboard-overview-container">
      {/* Welcome Banner */}
      <div className="relative glass-panel p-6 md:p-8 rounded-2xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full w-fit animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Engine Activated & Synchronized
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white">
            Hello, {profile?.name || user?.displayName || "Pilot"}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            Welcome to your career flight deck. Generate new timelines, optimize resumes, mock interview prep, and map real technical gap matrices.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-4 glass-card p-4 rounded-xl shadow-lg border border-white/5">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-500">Recruitability Score</div>
            <div className="text-lg font-bold text-white font-display">
              {latestResume ? `${latestResume.output.atsScore}% ATS Align` : "Awaiting Resume"}
            </div>
          </div>
        </div>
      </div>

      {/* Profile & Activity Summary Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Completion Panel */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-wider">
                Profile Integrity
              </h3>
              <button
                onClick={() => onSelectView("profile")}
                className="text-xs text-emerald-400 font-bold font-mono hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Complete Matrix <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Add college, skills, and target role inside the Profile card to refine the hyper-personalization of AI results.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-slate-300">Profile Completion</span>
              <span className="text-emerald-400">{profileCompletion}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Activity Chart Panel */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Dynamic Activity Chart (Last 7 Days)
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
              Live Firestore Telemetry
            </span>
          </div>

          {/* Elegant Tailwind CSS SVG/Bar Chart */}
          <div className="h-32 flex items-end justify-between gap-2 pt-4 border-b border-white/5 px-2">
            {days.map((day, idx) => {
              const heightPct = (counts[idx] / maxCount) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="relative w-full flex justify-center">
                    <div className="absolute bottom-full mb-1 bg-slate-950 border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {counts[idx]} Generates
                    </div>
                  </div>
                  <div
                    className="w-8 sm:w-12 bg-gradient-to-t from-emerald-500/20 to-emerald-400 rounded-t-md hover:to-emerald-300 transition-all cursor-pointer"
                    style={{ height: `${Math.max(heightPct, 5)}%` }}
                  />
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-wider">
          Quick Launch Ops
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onSelectView("roadmap")}
            className="p-4 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-amber-500/30 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Continue Learning</h4>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Jump directly to your Roadmap</p>
          </button>

          <button
            onClick={() => onSelectView("resume")}
            className="p-4 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-sky-500/30 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">Optimize Resume</h4>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Submit new ATS profile review</p>
          </button>

          <button
            onClick={() => onSelectView("roadmap")}
            className="p-4 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-emerald-500/30 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">New Roadmap</h4>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Architect learning schedule</p>
          </button>

          <button
            onClick={() => onSelectView("interview")}
            className="p-4 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-xl text-left transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Practice Interview</h4>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Simulate interactive STAR mock</p>
          </button>
        </div>
      </div>

      {/* Feature Navigation Launchpad Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-400">Launch Operational Modules</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="launchpad-grid">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              onClick={() => onSelectView(card.id)}
              className={`group flex flex-col justify-between border p-5 rounded-2xl cursor-pointer transition-all duration-300 ${card.color}`}
              id={`launch-card-${card.id}`}
            >
              <div className="space-y-3">
                {/* Header & Icon */}
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl glass-card">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full glass-card font-bold text-slate-300">
                    {card.pill}
                  </span>
                </div>

                {/* Info text */}
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white font-display group-hover:text-emerald-400 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {card.desc}
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 pt-1">
                    {card.latest}
                  </div>
                </div>
              </div>

              {/* Bottom arrow CTA */}
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 pt-5 group-hover:gap-2.5 transition-all">
                Boot Module
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
