import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { generateJSONResponse, getGeminiClient, ResumeAnalyzerSchema } from "./src/utils/gemini.ts";
import {
  CAREER_DISCOVERY_PROMPT,
  RESUME_ANALYZER_PROMPT,
  ROADMAP_PROMPT,
  INTERVIEW_PREP_PROMPT,
  INTERVIEW_FEEDBACK_PROMPT,
  LINKEDIN_PROMPT,
  SKILL_GAP_PROMPT,
  SYSTEM_INSTRUCTIONS
} from "./src/utils/prompts.ts";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for PDF uploads via base64 JSON
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// ============================================================================
// API ROUTES
// ============================================================================

// 1. Career Discovery Endpoint
app.post("/api/career", async (req: Request, res: Response) => {
  try {
    const { interests, skills, education, experienceLevel, preferences } = req.body;
    
    if (!interests || !skills) {
       res.status(400).json({ error: "Interests and Skills are required parameters." });
       return;
    }

    const fallbackValue = {
      suggestions: [
        {
          title: "Software Engineer",
          matchScore: 85,
          salaryRange: "$70,000 - $110,000",
          companies: ["Google", "Microsoft", "Amazon"],
          missingSkills: ["System Design", "Advanced Algorithms"],
          learningRecommendations: ["Build personal full-stack apps", "LeetCode algorithms practice"],
          actionPlan30Day: {
            days1to10: ["Set up local workspace", "Learn core language syntax"],
            days11to20: ["Implement 2 micro-projects", "Study database design"],
            days21to30: ["Deploy full-stack app", "Practice 10 mock interviews"]
          },
          whyItFits: "Matches interest in technology and strong coding fundamentals."
        }
      ]
    };

    const data = await generateJSONResponse(
      CAREER_DISCOVERY_PROMPT,
      {
        interests: interests.join(", "),
        skills: skills.join(", "),
        education: education || "Not specified",
        experienceLevel: experienceLevel || "student",
        preferences: preferences || "No specific preferences"
      },
      fallbackValue
    );

    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/career:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 2. Resume Analyzer Endpoint
app.post("/api/resume", async (req: Request, res: Response) => {
  try {
    const { resumeText, pdfBase64, targetRole } = req.body;
    
    if (!resumeText && !pdfBase64) {
       res.status(400).json({ error: "Please provide either resume text or pdfBase64." });
       return;
    }

    const fallbackValue = {
      atsScore: 70,
      summary: "Resume contains software development foundations with gaps in specific production deployment and high-scale framework usage.",
      strengths: ["Strong academic background", "Clean programming syntax"],
      weaknesses: ["Lacks metrics-driven achievements", "Limited deployment experience"],
      missingSkills: ["Docker/Kubernetes", "CI/CD pipelines"],
      missingKeywords: ["scalability", "unit testing", "system performance"],
      suggestedProjects: [
        {
          title: "Scalable Task Manager",
          description: "Build an API service deployed with Docker and tracked with unit tests.",
          technologies: ["Node.js", "Docker", "Jest"]
        }
      ],
      certifications: ["AWS Certified Developer Associate"],
      improvedBulletPoints: [
        {
          original: "Helped develop features for team project.",
          improved: "Engineered 4 critical microservices for a collaborative dashboard, reducing server latency by 25% through optimized DB queries.",
          impactExplained: "Adds exact performance metrics and showcases active ownership."
        }
      ]
    };

    // If PDF base64 is provided, we can query Gemini with the file part directly
    if (pdfBase64) {
      console.log("Processing resume as Native PDF with Gemini...");
      let pdfAttempt = 0;
      const maxPdfAttempts = 2;
      const pdfModelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let pdfSuccess = false;

      while (pdfAttempt < maxPdfAttempts && !pdfSuccess) {
        try {
          pdfAttempt++;
          const currentModel = pdfModelsToTry[pdfAttempt - 1] || "gemini-3.5-flash";
          console.log(`Sending Native PDF to Gemini using model ${currentModel} (Attempt ${pdfAttempt}/${maxPdfAttempts})...`);
          const client = getGeminiClient();
          const response = await client.models.generateContent({
            model: currentModel,
            contents: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBase64,
                }
              },
              {
                text: `Analyze this uploaded PDF resume with respect to target role: ${targetRole || "Software Developer"}. Identify ATS scores, strengths, weaknesses, suggested projects, and improved bullet points matching the target resume structure.`
              }
            ],
            config: {
              systemInstruction: SYSTEM_INSTRUCTIONS,
              responseMimeType: "application/json",
              responseSchema: ResumeAnalyzerSchema,
              temperature: 0.7,
            }
          });

          const text = response.text;
          if (text) {
            const parsed = JSON.parse(text);
            res.json(parsed);
            pdfSuccess = true;
            return;
          }
        } catch (pdfErr: any) {
          console.error(`Native PDF Gemini analysis failed on attempt ${pdfAttempt}:`, pdfErr.message || pdfErr);
          if (pdfAttempt < maxPdfAttempts) {
            // Wait 2 seconds before retry
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }
    }

    // Default template prompt style with resume text
    const data = await generateJSONResponse(
      RESUME_ANALYZER_PROMPT,
      {
        resumeText: resumeText || "PDF contents supplied.",
        targetRole: targetRole || "Software Engineer"
      },
      fallbackValue
    );

    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/resume:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 3. Career Roadmap Endpoint
app.post("/api/roadmap", async (req: Request, res: Response) => {
  try {
    const { targetRole, timeframeWeeks, currentSkills } = req.body;
    
    if (!targetRole) {
       res.status(400).json({ error: "Target Role is required." });
       return;
    }

    const fallbackValue = {
      jobReadinessScore: 65,
      weeklySchedule: [
        {
          week: 1,
          focus: "System Architecture Foundations",
          tasks: ["Study REST API design patterns", "Understand horizontal scalability", "Design a simple database schema"],
          resources: [
            { name: "System Design Primer", type: "article" as const, url: "GitHub Guide" },
            { name: "Frontend Masters: Advanced Architecture", type: "course" as const, url: "Course Portal" }
          ]
        }
      ],
      projects: [
        {
          title: "Real-time Chat Engine",
          difficulty: "Intermediate" as const,
          deliverables: ["WebSocket-driven server", "Responsive layout", "Historical logs database"]
        }
      ],
      certifications: ["CompTIA Network+"]
    };

    const data = await generateJSONResponse(
      ROADMAP_PROMPT,
      {
        targetRole,
        timeframeWeeks: timeframeWeeks || 4,
        currentSkills: currentSkills ? currentSkills.join(", ") : "None specified"
      },
      fallbackValue
    );

    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/roadmap:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 4. Interview Preparation Endpoint
app.post("/api/interview", async (req: Request, res: Response) => {
  try {
    const { targetRole, companyType, difficulty } = req.body;
    
    if (!targetRole) {
       res.status(400).json({ error: "Target Role is required." });
       return;
    }

    const fallbackValue = {
      questions: [
        {
          id: "q1",
          category: "Technical" as const,
          question: "Explain the difference between SQL and NoSQL databases, and when you would use each.",
          hints: ["Consider data consistency", "Think about schema flexibility"],
          idealAnswer: "SQL databases are relational, table-based, and scale vertically, prioritizing ACID properties. NoSQL databases are non-relational, document/key-value/graph-based, scale horizontally, and offer high flexibility."
        }
      ],
      interviewTips: ["Structure your behavioral answers with the STAR method.", "Explain your edge cases out loud during technical questions."]
    };

    const data = await generateJSONResponse(
      INTERVIEW_PREP_PROMPT,
      {
        targetRole,
        companyType: companyType || "Standard Software Tech",
        difficulty: difficulty || "Medium"
      },
      fallbackValue
    );

    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/interview:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Interview Question Feedback Grader
app.post("/api/interview/feedback", async (req: Request, res: Response) => {
  try {
    const { question, userAnswer, idealAnswer } = req.body;
    
    if (!question || !userAnswer) {
       res.status(400).json({ error: "Question and candidate answer are required." });
       return;
    }

    const fallbackValue = {
      score: 80,
      feedback: "Your answer has correct concepts but could use more direct industry vocabulary.",
      betterPhrasing: "I resolve application issues by first analyzing server-side access logs and isolating DB bottlenecks, before writing patches."
    };

    const data = await generateJSONResponse(
      INTERVIEW_FEEDBACK_PROMPT,
      {
        question,
        userAnswer,
        idealAnswer: idealAnswer || "A complete professional software engineering answer."
      },
      fallbackValue
    );

    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/interview/feedback:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 5. LinkedIn Message Generator Endpoint
app.post("/api/linkedin", async (req: Request, res: Response) => {
  try {
    const { recipientRole, recipientCompany, myBackground, purpose, tone } = req.body;
    
    if (!recipientRole || !recipientCompany) {
       res.status(400).json({ error: "Recipient Role and Recipient Company are required." });
       return;
    }

    const fallbackValue = {
      subject: "Inquiry: Learning from your Engineering Journey",
      messageBody: "Hi, I am an MCA student interested in your team's accomplishments. I would love to connect and learn more.",
      explanation: "Highlights humble connection request and alignment with recipient's expertise.",
      followUpTip: "Send a polite follow-up after 5 business days."
    };

    const data = await generateJSONResponse(
      LINKEDIN_PROMPT,
      {
        recipientRole,
        recipientCompany,
        myBackground: myBackground || "Aspiring software professional",
        purpose: purpose || "connection",
        tone: tone || "professional"
      },
      fallbackValue
    );

    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/linkedin:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 6. Skill Gap Analyzer Endpoint
app.post("/api/skill-gap", async (req: Request, res: Response) => {
  try {
    const { targetRole, mySkills } = req.body;
    
    if (!targetRole) {
       res.status(400).json({ error: "Target Role is required." });
       return;
    }

    const fallbackValue = {
      skillGapPercentage: 35,
      jobReadinessScore: 65,
      missingSkills: [
        {
          skill: "Docker Containerization",
          importance: "High" as const,
          learningPath: "Complete Docker Deep Dive on YouTube and build 3 Dockerfiles."
        }
      ],
      learningPlan: ["Understand basic containers", "Build multi-stage pipelines", "Deploy to cloud run"]
    };

    const data = await generateJSONResponse(
      SKILL_GAP_PROMPT,
      {
        targetRole,
        mySkills: mySkills ? mySkills.join(", ") : "None specified"
      },
      fallbackValue
    );

    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/skill-gap:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// ============================================================================
// SERVER SETUP & FRONTEND INTEGRATION
// ============================================================================

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareerPilot AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start the Express server:", err);
});
