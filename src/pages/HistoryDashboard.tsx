import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useToast } from "../components/Toast.tsx";
import { fetchAIHistory, deleteAIHistoryRecord, HistoryRecord } from "../utils/history.ts";
import {
  History,
  Trash2,
  Eye,
  Calendar,
  Layers,
  FileText,
  BrainCircuit,
  MessageSquare,
  Linkedin,
  ShieldAlert,
  X,
  Sparkles,
  Award
} from "lucide-react";

export default function HistoryDashboard() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<string>("career");
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  const tabs = [
    { id: "career", label: "Career Discovery", icon: BrainCircuit },
    { id: "resume", label: "Resume Analysis", icon: FileText },
    { id: "roadmap", label: "Roadmaps", icon: Calendar },
    { id: "interview", label: "Interview Prep", icon: MessageSquare },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
    { id: "skillgap", label: "Skill Gap", icon: ShieldAlert }
  ];

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchAIHistory(user.uid, activeTab);
      setRecords(data);
    } catch (err) {
      console.error(err);
      error("Failed to load history records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [activeTab, user]);

  const handleDelete = async (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this history record?")) return;
    try {
      await deleteAIHistoryRecord(activeTab, recordId);
      success("Record deleted successfully.");
      setRecords(records.filter((r) => r.id !== recordId));
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (err) {
      console.error(err);
      error("Failed to delete record.");
    }
  };

  const getRecordTitle = (rec: HistoryRecord) => {
    if (rec.feature === "career") {
      return `Discovery: ${rec.input.skills?.slice(0, 2).join(", ") || "Skills"} ➔ ${rec.input.targetRole || "Any Role"}`;
    }
    if (rec.feature === "resume") {
      return `Analysis: ATS Score ${rec.output.atsScore}%`;
    }
    if (rec.feature === "roadmap") {
      return `Roadmap: ${rec.input.targetRole || "Career Target"}`;
    }
    if (rec.feature === "interview") {
      return `Interview: ${rec.input.jobDescription?.substring(0, 30) || "Session"}...`;
    }
    if (rec.feature === "linkedin") {
      return `LinkedIn: Reachout to ${rec.input.recipientName || "Contact"}`;
    }
    if (rec.feature === "skillgap") {
      return `Skill Gap: ${rec.input.targetRole || "Role Gap"}`;
    }
    return `AI Generation`;
  };

  const getRecordSummary = (rec: HistoryRecord) => {
    if (rec.feature === "career" && rec.output.suggestions) {
      return `Found ${rec.output.suggestions.length} custom matching roles like ${rec.output.suggestions[0]?.title || ""}`;
    }
    if (rec.feature === "resume" && rec.output.strengths) {
      return `${rec.output.strengths.slice(0, 2).join(", ")}`;
    }
    if (rec.feature === "roadmap" && rec.output.weeklySchedule) {
      return `Personalized ${rec.output.weeklySchedule.length}-week learning schedule with ${rec.output.projects?.length || 0} hands-on projects.`;
    }
    if (rec.feature === "interview" && rec.output.questions) {
      return `Practice session with ${rec.output.questions.length} simulated engineering and behavioral questions.`;
    }
    if (rec.feature === "linkedin" && rec.output.subject) {
      return `Subject: ${rec.output.subject}`;
    }
    if (rec.feature === "skillgap" && rec.output.missingSkills) {
      return `Overall gap is ${rec.output.skillGapPercentage}%. Target competencies to acquire: ${rec.output.missingSkills.slice(0, 3).map((s: any) => s.skill).join(", ")}`;
    }
    return `Custom AI analysis generated and saved.`;
  };

  return (
    <div className="space-y-8" id="history-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-white flex items-center gap-2">
            <History className="w-8 h-8 text-emerald-400" />
            AI History & Archives
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Access, view, and manage your previously generated AI recommendations and resumes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4" id="history-tabs-container">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-display transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
              id={`history-tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Records Board */}
      <div className="space-y-4" id="history-records-board">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel p-5 rounded-2xl animate-pulse flex justify-between">
                <div className="space-y-3 w-2/3">
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                  <div className="h-3 bg-white/2 rounded w-2/3" />
                </div>
                <div className="h-8 bg-white/5 rounded w-24" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl min-h-[300px]">
            <div className="p-4 glass-card rounded-full text-slate-500 mb-4">
              <History className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold font-display text-white">No Archive Found</h4>
            <p className="text-sm text-slate-400 max-w-sm mt-1">
              You haven't saved any {tabs.find((t) => t.id === activeTab)?.label} reports yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4" id="history-items-list">
            {records.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all cursor-pointer"
                id={`history-card-${rec.id}`}
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(rec.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white truncate">{getRecordTitle(rec)}</h3>
                  <p className="text-xs text-slate-400 truncate">{getRecordSummary(rec)}</p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="p-2 bg-white/5 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/20 rounded-xl transition-all cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(rec.id, e)}
                    className="p-2 bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
                    title="Delete Record"
                    id={`delete-btn-${rec.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Inspector Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Archived AI Report
                </span>
                <h3 className="text-lg font-bold font-display text-white">
                  {getRecordTitle(selectedRecord)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                id="close-history-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Document Inspector */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Input Specs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Submission Metadata</h4>
                <div className="bg-white/2 p-4 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {Object.entries(selectedRecord.input).map(([k, v]) => {
                    if (typeof v === "object" && v !== null) {
                      return (
                        <div key={k} className="col-span-1 md:col-span-2">
                          <span className="text-slate-500 capitalize">{k}:</span>{" "}
                          <span className="text-slate-300">{JSON.stringify(v)}</span>
                        </div>
                      );
                    }
                    return (
                      <div key={k} className="truncate">
                        <span className="text-slate-500 capitalize">{k}:</span>{" "}
                        <span className="text-slate-300">{String(v)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Formatted Output */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">AI Generated Recommendation Docs</h4>
                
                {/* Specific feature rendering to look gorgeous */}
                {selectedRecord.feature === "linkedin" && (
                  <div className="space-y-4">
                    <div className="glass-card p-5 rounded-xl border border-emerald-500/20 space-y-3">
                      <div className="text-xs font-mono text-emerald-400 font-bold uppercase">Subject Header:</div>
                      <div className="text-sm text-slate-200 font-semibold">{selectedRecord.output.subject}</div>
                    </div>
                    <div className="glass-card p-5 rounded-xl space-y-3">
                      <div className="text-xs font-mono text-slate-400 font-bold uppercase">Message Body:</div>
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{selectedRecord.output.messageBody}</pre>
                    </div>
                    {selectedRecord.output.explanation && (
                      <div className="text-xs text-slate-400 italic">
                        Tip: {selectedRecord.output.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Resume Analysis Specific */}
                {selectedRecord.feature === "resume" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-card p-5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">ATS Alignment</span>
                          <h4 className="text-2xl font-extrabold font-display text-emerald-400 mt-1">{selectedRecord.output.atsScore}%</h4>
                        </div>
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full" style={{ width: `${selectedRecord.output.atsScore}%` }} />
                        </div>
                      </div>
                      <div className="glass-card p-5 rounded-xl space-y-1">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Analysis Profile</div>
                        <p className="text-xs text-slate-300 truncate">{selectedRecord.output.summary || "Summary Analysis Documents."}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-card p-5 rounded-xl space-y-2">
                        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Strengths</h5>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                          {selectedRecord.output.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="glass-card p-5 rounded-xl space-y-2">
                        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Weaknesses</h5>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                          {selectedRecord.output.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    </div>

                    {selectedRecord.output.improvedBulletPoints && (
                      <div className="glass-card p-5 rounded-xl space-y-4">
                        <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Improved Resume Bullets</h5>
                        <div className="space-y-4 divide-y divide-white/5">
                          {selectedRecord.output.improvedBulletPoints.map((item: any, i: number) => (
                            <div key={i} className="pt-3 first:pt-0 space-y-2">
                              <p className="text-xs text-rose-400 line-through">Original: {item.original}</p>
                              <p className="text-xs text-emerald-400 font-semibold">Improved: {item.improved}</p>
                              <p className="text-[10px] text-slate-500 font-mono">Impact: {item.impactExplained}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Skill Gap Analysis specific */}
                {selectedRecord.feature === "skillgap" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-card p-5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Overall Skill Gap</span>
                          <h4 className="text-2xl font-extrabold font-display text-rose-400 mt-1">{selectedRecord.output.skillGapPercentage}%</h4>
                        </div>
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="bg-rose-400 h-full" style={{ width: `${selectedRecord.output.skillGapPercentage}%` }} />
                        </div>
                      </div>
                      <div className="glass-card p-5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Estimated Job Readiness</span>
                          <h4 className="text-2xl font-extrabold font-display text-emerald-400 mt-1">{selectedRecord.output.jobReadinessScore}%</h4>
                        </div>
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full" style={{ width: `${selectedRecord.output.jobReadinessScore}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-5 rounded-xl space-y-3">
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Missing Competencies</h5>
                      <div className="space-y-3">
                        {selectedRecord.output.missingSkills?.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white/2 p-3 rounded-lg border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <div className="font-semibold text-xs text-white">{item.skill}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.learningPath}</div>
                            </div>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase self-start md:self-center ${
                              item.importance === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {item.importance} Importance
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* General Fallback Inspector (Prettified JSON viewer) */}
                {!["linkedin", "resume", "skillgap"].includes(selectedRecord.feature) && (
                  <div className="glass-card p-5 rounded-xl bg-slate-950 border border-white/10 max-h-[400px] overflow-y-auto">
                    <pre className="text-xs text-emerald-400 font-mono">{JSON.stringify(selectedRecord.output, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex justify-end bg-white/2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
