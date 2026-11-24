import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { motion } from "motion/react";
import { UploadCloud, FileText, CheckCircle2, XCircle, AlertCircle, Sparkles, Trophy, Award, RefreshCw, Layers, ArrowUpRight, Check, AlertTriangle, FileUp } from "lucide-react";
import { useToast } from "../components/Toast.tsx";
import { ResumeAnalysisResponse } from "../types.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { saveAIHistory } from "../utils/history.ts";

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  
  // Inputs
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [resumeText, setResumeText] = useState("");
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // States
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResponse | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag & Drop
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/pdf") {
      warning("Only PDF files are supported for native parsing.");
      return;
    }
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const resultStr = e.target?.result as string;
      // Get base64 content
      const base64Data = resultStr.split(",")[1];
      setPdfBase64(base64Data);
      success("PDF Loaded successfully! Ready for AI Analysis.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setFileName(null);
    setPdfBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !pdfBase64) {
      warning("Please upload a PDF resume or paste your resume text first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText || undefined,
          pdfBase64: pdfBase64 || undefined,
          targetRole
        })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume. Please verify your file contents and try again.");
      }

      const data = await response.json();
      setResult(data);
      
      if (user) {
        await saveAIHistory(user.uid, "resume", {
          targetRole,
          fileName: fileName || "Pasted text"
        }, data);
      }
      
      success("Resume analysis completed!");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" id="resume-analyzer-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-emerald-400" />
            Resume Analyzer
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Optimize your resume for applicant tracking systems (ATS). Get detailed critiques, keyword alignment, and X-Y-Z bullet points.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Native PDF parsing powered by Gemini
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Column - 5 Columns */}
        <div className="lg:col-span-5 space-y-6 glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold font-display text-white pb-2 border-b border-white/10">
            Resume Source
          </h3>

          {/* Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Target Role / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Engineer, Product Analyst, Data Scientist"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2 text-sm glass-input rounded-lg text-white"
              id="resume-target-role"
            />
          </div>

          {/* PDF Uploader */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Option A: Upload PDF Resume
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                dragActive ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5"
              }`}
              onClick={triggerFileSelect}
              id="resume-dropzone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileInput}
                id="resume-file-input"
              />
              
              <UploadCloud className="w-10 h-10 text-slate-500 mb-2 animate-bounce" />
              <p className="text-xs font-medium text-slate-300">Drag & drop your PDF resume here, or <span className="text-emerald-400">browse</span></p>
              <p className="text-[10px] text-slate-500 mt-1">Supports PDF (up to 15MB)</p>
            </div>

            {/* Uploaded File Chip */}
            {fileName && (
              <div className="flex items-center justify-between p-2.5 glass-panel rounded-lg" id="uploaded-file-chip">
                <div className="flex items-center gap-2 min-w-0">
                  <FileUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-white truncate font-medium">{fileName}</span>
                </div>
                <button onClick={clearFile} className="text-rose-400 hover:text-rose-200 transition-colors" id="clear-uploaded-file">
                  <span className="text-lg font-bold">×</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <span className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] font-mono text-slate-600 px-3 uppercase">OR</span>
            <span className="h-px bg-white/10 flex-1" />
          </div>

          {/* Copied Text Paste */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Option B: Paste Plain Text Resume
            </label>
            <textarea
              rows={6}
              placeholder="Paste the full text content of your resume here if you do not have a PDF..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              disabled={!!pdfBase64}
              className="w-full px-3 py-2 text-xs glass-input rounded-lg text-white placeholder-slate-500 disabled:opacity-40 disabled:cursor-not-allowed resize-none"
              id="resume-paste-area"
            />
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
            id="analyze-resume-btn"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin text-slate-950" />
                Performing ATS Audit...
              </>
            ) : (
              <>
                Run Audit Checklist
                <ArrowUpRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Audit Feedback Column - 7 Columns */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="space-y-6" id="resume-loading-skeleton">
              <div className="glass-panel p-6 rounded-2xl animate-pulse flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-white/5 rounded" />
                  <div className="h-3 w-1/2 bg-white/5 rounded" />
                </div>
              </div>
              <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
                <div className="h-6 w-1/3 bg-white/5 rounded" />
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-5/6 bg-white/5 rounded" />
              </div>
            </div>
          ) : result ? (
            <div className="space-y-8" id="resume-results-container">
              {/* ATS Score Header Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6"
                id="ats-score-header-card"
              >
                {/* Score Dial */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-white/10 fill-none" strokeWidth="8" />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className={`fill-none transition-all duration-1000 ${
                        result.atsScore >= 80 ? "stroke-emerald-400" : result.atsScore >= 60 ? "stroke-amber-400" : "stroke-rose-400"
                      }`}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - result.atsScore / 100)}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold font-display text-white">{result.atsScore}</span>
                    <span className="text-[10px] text-slate-500 block font-mono font-bold">/ 100</span>
                  </div>
                </div>

                <div className="space-y-2 flex-1 text-center md:text-left">
                  <h4 className="text-lg font-bold font-display text-white flex items-center justify-center md:justify-start gap-1.5">
                    ATS Audit Breakdown
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{result.summary}</p>
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                    {result.atsScore >= 85 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        Job-Ready Match
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                        Optimizations Required
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full glass-card text-slate-400 text-[10px] font-mono">
                      Target: {targetRole}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                    <CheckCircle2 className="w-4 h-4" />
                    Key Strengths
                  </h5>
                  <ul className="space-y-2">
                    {result.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-tight">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                    <XCircle className="w-4 h-4" />
                    Gaps & Weaknesses
                  </h5>
                  <ul className="space-y-2">
                    {result.weaknesses.map((wk, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-tight">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        {wk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills and Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing Skills */}
                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                    <Layers className="w-4 h-4" />
                    Recommended Core Skills
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-[11px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-300 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="glass-panel p-5 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                    <AlertCircle className="w-4 h-4" />
                    Missing ATS Keywords
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw, idx) => (
                      <span key={idx} className="px-2.5 py-1 text-[11px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested Projects & Certifications */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                  <Trophy className="w-4 h-4" />
                  Recommended Resume Enhancers
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase font-mono">Suggested Fill-Gap Projects</div>
                    {result.suggestedProjects.map((p, idx) => (
                      <div key={idx} className="glass-card p-3 rounded-xl space-y-1">
                        <div className="text-xs font-bold text-white font-display">{p.title}</div>
                        <p className="text-[10px] text-slate-400 leading-snug">{p.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {p.technologies.map((tech, tIdx) => (
                            <span key={tIdx} className="px-1.5 py-0.5 rounded bg-white/2 text-[9px] text-slate-400 border border-white/5 font-mono">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase font-mono">Top Credential Upgrades</div>
                    <ul className="space-y-2">
                      {result.certifications.map((cert, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Improved Bullet Points comparison */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                  <Sparkles className="w-4 h-4" />
                  Experience Refactor: X-Y-Z Formatting
                </h5>
                <p className="text-[11px] text-slate-400 italic">
                  Compare your original statements with structural reformats optimized for accomplishments, measures, and actions.
                </p>

                <div className="space-y-4 pt-2">
                  {result.improvedBulletPoints.map((bp, idx) => (
                    <div key={idx} className="glass-card rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Original */}
                        <div className="bg-white/2 p-3.5 border-b md:border-b-0 md:border-r border-white/5">
                          <div className="text-[9px] uppercase font-mono text-slate-500 font-bold mb-1">Original Draft</div>
                          <p className="text-slate-400 font-mono text-[11px] leading-relaxed">{bp.original}</p>
                        </div>
                        {/* Improved */}
                        <div className="bg-emerald-500/5 p-3.5">
                          <div className="text-[9px] uppercase font-mono text-emerald-400 font-bold mb-1 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Improved Draft
                          </div>
                          <p className="text-emerald-100 font-semibold leading-relaxed">{bp.improved}</p>
                        </div>
                      </div>
                      <div className="bg-white/1 px-3.5 py-2 border-t border-white/5 text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="font-bold text-emerald-400 font-mono">IMPACT MECHANICS:</span>
                        <span>{bp.impactExplained}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 glass-panel rounded-2xl h-full min-h-[400px]">
              <div className="p-4 glass-card rounded-full text-slate-500 mb-4 animate-pulse">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold font-display text-white">No Resume Audit Run</h4>
              <p className="text-slate-400 text-sm max-w-sm mt-1">
                Upload your PDF resume or copy and paste your resume text to get comprehensive ATS score grading.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
