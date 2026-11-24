import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Sparkles, AlertCircle, RefreshCw, Star, Play, Send, ChevronRight, CheckCircle2, ListChecks, ShieldAlert, Award, FileText } from "lucide-react";
import { useToast } from "../components/Toast.tsx";
import { InterviewQuestion, InterviewFeedbackResponse } from "../types.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { saveAIHistory } from "../utils/history.ts";

export default function InterviewPrep() {
  const { user } = useAuth();
  const { success, error, warning } = { ...useToast() };

  // Setup inputs
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [companyType, setCompanyType] = useState("FAANG Tech");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Loaded questions states
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewTips, setInterviewTips] = useState<string[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  // Answering states
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, InterviewFeedbackResponse>>({});
  const [gradingQuestionId, setGradingQuestionId] = useState<string | null>(null);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [revealIdeal, setRevealIdeal] = useState<Record<string, boolean>>({});

  const handleGenerateQuestions = async () => {
    if (!targetRole.trim()) {
      warning("Please specify your target role.");
      return;
    }

    setLoading(true);
    setQuestions([]);
    setActiveQuestionIdx(0);
    setUserAnswers({});
    setFeedback({});
    setShowHints({});
    setRevealIdeal({});

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          companyType,
          difficulty
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate practice questions. Please check your network and try again.");
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setInterviewTips(data.interviewTips || []);
        
        if (user) {
          await saveAIHistory(user.uid, "interview", {
            targetRole,
            companyType,
            difficulty
          }, data);
        }
        
        success("Mock interview loaded. Step up to the mic!");
      } else {
        throw new Error("Invalid response schema from server.");
      }
    } catch (err: any) {
      console.error(err);
      error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeAnswer = async (q: InterviewQuestion) => {
    const answer = userAnswers[q.id];
    if (!answer || !answer.trim()) {
      warning("Please type your practice answer before submitting for AI grading.");
      return;
    }

    setGradingQuestionId(q.id);
    try {
      const response = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.question,
          userAnswer: answer,
          idealAnswer: q.idealAnswer
        })
      });

      if (!response.ok) {
        throw new Error("Feedback grading failed. Please try again.");
      }

      const data = await response.json();
      setFeedback((prev) => ({
        ...prev,
        [q.id]: data
      }));
      success("AI grading complete! Review your score.");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to grade response.");
    } finally {
      setGradingQuestionId(null);
    }
  };

  const handleAnswerChange = (qId: string, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: text
    }));
  };

  const toggleHint = (qId: string) => {
    setShowHints((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const toggleIdeal = (qId: string) => {
    setRevealIdeal((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  return (
    <div className="space-y-8" id="interview-prep-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-white flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-emerald-400" />
            Interview Preparation
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Practice realistic HR, technical, SQL, and behavioral interview scenarios. Get graded in real-time with comprehensive phrase optimizations.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Interactive STAR scoring simulator
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side Controls Panel - 4 Columns */}
        <div className="lg:col-span-4 space-y-6 glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold font-display text-white pb-2 border-b border-white/10">
            Simulator Settings
          </h3>

          {/* Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Target Position
            </label>
            <input
              type="text"
              placeholder="e.g. React Developer, Data Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg text-white"
              id="interview-role-input"
            />
          </div>

          {/* Company Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Target Company Focus
            </label>
            <select
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg text-white"
              id="interview-company-select"
            >
              <option value="FAANG Tech">Big Tech / FAANG (Heavy scaling/algos)</option>
              <option value="Early-stage Startup">Early-stage Startup (Fast execution/generalist)</option>
              <option value="Enterprise Finance">Enterprise / FinTech (Robustness/security)</option>
              <option value="Consulting Agency">Consulting / Agency (Client interaction/flexibility)</option>
            </select>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Interview Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-1.5 rounded-lg text-xs capitalize font-medium transition-all border ${
                    difficulty === diff
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "glass-input border-white/5 text-slate-400 hover:bg-white/5"
                  }`}
                  id={`diff-level-${diff}`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            id="start-interview-btn"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin text-slate-950" />
                Interrogating AI Panels...
              </>
            ) : (
              <>
                Initialize Mock Interview
                <Play className="w-4 h-4 text-slate-950 fill-slate-950" />
              </>
            )}
          </button>

          {/* Strategic interview tips */}
          {interviewTips.length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-3" id="interview-tips-container">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                Targeted Interview Tactics
              </span>
              <ul className="space-y-2">
                {interviewTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-snug">
                    <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Interview Simulator Console - 8 Columns */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="glass-panel p-8 rounded-2xl h-80 animate-pulse flex flex-col justify-between" id="simulator-skeleton">
              <div className="space-y-2">
                <div className="h-4 bg-white/5 rounded w-1/4" />
                <div className="h-6 bg-white/5 rounded w-3/4" />
              </div>
              <div className="h-32 bg-white/2 rounded" />
              <div className="h-10 bg-white/5 rounded w-1/3 align-right self-end" />
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-6" id="simulator-console">
              {/* Question Navigation Header */}
              <div className="flex glass-panel p-1.5 rounded-xl gap-1">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg font-display transition-all cursor-pointer ${
                      activeQuestionIdx === idx
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow"
                        : "text-slate-500 hover:text-slate-300 border border-transparent"
                    }`}
                    id={`nav-q-${idx}`}
                  >
                    Question {idx + 1}
                  </button>
                ))}
              </div>

              {/* Active Question Panel */}
              <AnimatePresence mode="wait">
                {questions.map((q, idx) => {
                  if (idx !== activeQuestionIdx) return null;
                  const isHintOpen = showHints[q.id];
                  const isIdealOpen = revealIdeal[q.id];
                  const grade = feedback[q.id];
                  const grading = gradingQuestionId === q.id;

                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="glass-panel rounded-2xl overflow-hidden shadow-xl space-y-6 p-6"
                      id={`question-panel-${q.id}`}
                    >
                      {/* Category and Code specs */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${
                          q.category === "Technical" ? "bg-sky-500/10 border-sky-500/20 text-sky-400" :
                          q.category === "SQL" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          q.category === "Behavioral" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                          {q.category} QUESTION
                        </span>
                        {q.codingTopic && (
                          <span className="text-[10px] font-mono text-slate-500">Topic: {q.codingTopic}</span>
                        )}
                      </div>

                      {/* Question Text */}
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold font-display text-white leading-snug">
                          {q.question}
                        </h4>
                      </div>

                      {/* Hint Button */}
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleHint(q.id)}
                          className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                          id={`toggle-hint-${q.id}`}
                        >
                          {isHintOpen ? "Hide Hints" : "Need a hint?"}
                        </button>
                        {isHintOpen && (
                          <div className="p-3.5 rounded-lg glass-card text-xs text-slate-300 leading-relaxed list-disc pl-5">
                            {q.hints.map((hint, hIdx) => (
                              <li key={hIdx} className="mb-1 last:mb-0">{hint}</li>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Answer Entry */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                          Draft your mock response:
                        </label>
                        <textarea
                          rows={6}
                          placeholder="Type your response here. For behavioral questions, consider structural strategies like the STAR method (Situation, Task, Action, Result)..."
                          value={userAnswers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-full px-4 py-3 text-xs glass-input rounded-xl text-white placeholder-slate-500"
                          id={`answer-box-${q.id}`}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <button
                          onClick={() => toggleIdeal(q.id)}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg border border-white/10 transition-colors cursor-pointer"
                          id={`toggle-ideal-${q.id}`}
                        >
                          {isIdealOpen ? "Hide Reference Answer" : "Reveal Ideal Answer"}
                        </button>

                        <button
                          onClick={() => handleGradeAnswer(q)}
                          disabled={grading}
                          className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                          id={`submit-grade-${q.id}`}
                        >
                          {grading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Grading Response...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              Submit response for AI Grading
                            </>
                          )}
                        </button>
                      </div>

                      {/* Ideal Answer display */}
                      {isIdealOpen && (
                        <div className="p-4 glass-panel rounded-xl space-y-2" id={`ideal-answer-box-${q.id}`}>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">Ideal benchmark answer</span>
                          <p className="text-xs text-emerald-100/90 leading-relaxed font-mono whitespace-pre-line">{q.idealAnswer}</p>
                        </div>
                      )}

                      {/* Grading Response */}
                      {grade && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-panel rounded-xl overflow-hidden text-xs"
                          id={`grade-results-${q.id}`}
                        >
                          {/* Score Header */}
                          <div className="bg-white/2 px-4 py-3 flex items-center justify-between border-b border-white/10">
                            <span className="font-bold text-white font-display">AI STAR Rating Evaluation</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-mono">STAR score:</span>
                              <span className={`text-sm font-extrabold font-mono ${
                                grade.score >= 80 ? "text-emerald-400" : grade.score >= 60 ? "text-amber-400" : "text-rose-400"
                              }`}>{grade.score} / 100</span>
                            </div>
                          </div>

                          {/* Feedback Body */}
                          <div className="p-4 space-y-3 bg-white/1">
                            <div className="space-y-1">
                              <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Critique & Feedback</div>
                              <p className="text-slate-300 leading-relaxed">{grade.feedback}</p>
                            </div>

                            <div className="space-y-1 pt-2 border-t border-white/5">
                              <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">Recommended Phrase Optimization</div>
                              <p className="text-emerald-500/90 font-mono text-[11px] leading-relaxed italic bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg">{grade.betterPhrasing}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl h-full min-h-[400px]">
              <div className="p-4 glass-card rounded-full text-slate-500 mb-4">
                <MessageSquare className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold font-display text-white">Interactive Panel Inactive</h4>
              <p className="text-slate-400 text-sm max-w-sm mt-1">
                Establish your practice parameters in the left config panel to start simulating dynamic AI-backed interview questionnaires.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
