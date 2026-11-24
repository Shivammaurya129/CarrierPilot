/**
 * Types and interfaces for CareerPilot AI
 */

// 1. Career Discovery Types
export interface CareerDiscoveryRequest {
  interests: string[];
  skills: string[];
  education: string;
  experienceLevel: "student" | "entry" | "mid" | "senior";
  preferences: string;
}

export interface CareerSuggestion {
  title: string;
  matchScore: number;
  salaryRange: string;
  companies: string[];
  missingSkills: string[];
  learningRecommendations: string[];
  actionPlan30Day: {
    days1to10: string[];
    days11to20: string[];
    days21to30: string[];
  };
  whyItFits: string;
}

export interface CareerDiscoveryResponse {
  suggestions: CareerSuggestion[];
}

// 2. Resume Analyzer Types
export interface ResumeAnalysisRequest {
  resumeText?: string;
  pdfBase64?: string; // Optional raw base64 PDF upload
  targetRole?: string;
}

export interface ResumeAnalysisResponse {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  missingKeywords: string[];
  suggestedProjects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  certifications: string[];
  improvedBulletPoints: {
    original: string;
    improved: string;
    impactExplained: string;
  }[];
}

// 3. AI Career Roadmap Types
export interface RoadmapRequest {
  targetRole: string;
  timeframeWeeks: number;
  currentSkills: string[];
}

export interface RoadmapResponse {
  jobReadinessScore: number;
  weeklySchedule: {
    week: number;
    focus: string;
    tasks: string[];
    resources: {
      name: string;
      type: "course" | "article" | "project";
      url: string;
    }[];
  }[];
  projects: {
    title: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    deliverables: string[];
  }[];
  certifications: string[];
}

// 4. Interview Preparation Types
export interface InterviewRequest {
  targetRole: string;
  companyType?: string; // e.g., Startup, FAANG, Finance
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface InterviewQuestion {
  id: string;
  category: "HR" | "Technical" | "SQL" | "Behavioral";
  question: string;
  codingTopic?: string;
  hints: string[];
  idealAnswer: string;
}

export interface InterviewResponse {
  questions: InterviewQuestion[];
  interviewTips: string[];
}

export interface InterviewFeedbackRequest {
  question: string;
  userAnswer: string;
  idealAnswer: string;
}

export interface InterviewFeedbackResponse {
  score: number; // 0-100
  feedback: string;
  betterPhrasing: string;
}

// 5. LinkedIn Message Generator Types
export interface LinkedInRequest {
  recipientRole: string;
  recipientCompany: string;
  myBackground: string;
  purpose: "connection" | "referral" | "recruiter" | "followup";
  tone: "professional" | "casual" | "enthusiastic";
}

export interface LinkedInResponse {
  subject?: string;
  messageBody: string;
  explanation: string;
  followUpTip: string;
}

// 6. Skill Gap Analyzer Types
export interface SkillGapRequest {
  targetRole: string;
  mySkills: string[];
}

export interface SkillGapResponse {
  skillGapPercentage: number;
  jobReadinessScore: number;
  missingSkills: {
    skill: string;
    importance: "High" | "Medium" | "Low";
    learningPath: string;
  }[];
  learningPlan: string[];
}
