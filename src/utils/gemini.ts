import { GoogleGenAI, Type } from "@google/genai";
import {
  SYSTEM_INSTRUCTIONS,
  CAREER_DISCOVERY_PROMPT,
  RESUME_ANALYZER_PROMPT,
  ROADMAP_PROMPT,
  INTERVIEW_PREP_PROMPT,
  INTERVIEW_FEEDBACK_PROMPT,
  LINKEDIN_PROMPT,
  SKILL_GAP_PROMPT
} from "./prompts.ts";

// Helper to clean up env var and assert key exists
function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("WARNING: GEMINI_API_KEY is not defined in the environment. Using placeholder for compilation.");
    return "MOCK_KEY_FOR_COMPILATION";
  }
  return key;
}

// Lazy initialization of GoogleGenAI client to avoid crashes on startup
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = getApiKey();
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        timeout: 25000, // 25 seconds timeout to avoid hanging requests
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const CareerDiscoverySchema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          matchScore: { type: Type.INTEGER },
          salaryRange: { type: Type.STRING },
          companies: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          learningRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionPlan30Day: {
            type: Type.OBJECT,
            properties: {
              days1to10: { type: Type.ARRAY, items: { type: Type.STRING } },
              days11to20: { type: Type.ARRAY, items: { type: Type.STRING } },
              days21to30: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["days1to10", "days11to20", "days21to30"],
          },
          whyItFits: { type: Type.STRING },
        },
        required: [
          "title",
          "matchScore",
          "salaryRange",
          "companies",
          "missingSkills",
          "learningRecommendations",
          "actionPlan30Day",
          "whyItFits",
        ],
      },
    },
  },
  required: ["suggestions"],
};

export const ResumeAnalyzerSchema = {
  type: Type.OBJECT,
  properties: {
    atsScore: { type: Type.INTEGER },
    summary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedProjects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["title", "description", "technologies"],
      },
    },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvedBulletPoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          improved: { type: Type.STRING },
          impactExplained: { type: Type.STRING },
        },
        required: ["original", "improved", "impactExplained"],
      },
    },
  },
  required: [
    "atsScore",
    "summary",
    "strengths",
    "weaknesses",
    "missingSkills",
    "missingKeywords",
    "suggestedProjects",
    "certifications",
    "improvedBulletPoints",
  ],
};

export const RoadmapSchema = {
  type: Type.OBJECT,
  properties: {
    jobReadinessScore: { type: Type.INTEGER },
    weeklySchedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.INTEGER },
          focus: { type: Type.STRING },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, description: 'Must be "course", "article", or "project"' },
                url: { type: Type.STRING },
              },
              required: ["name", "type", "url"],
            },
          },
        },
        required: ["week", "focus", "tasks", "resources"],
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          difficulty: { type: Type.STRING, description: 'Must be "Beginner", "Intermediate", or "Advanced"' },
          deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["title", "difficulty", "deliverables"],
      },
    },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["jobReadinessScore", "weeklySchedule", "projects", "certifications"],
};

export const InterviewPrepSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, description: 'Must be "HR", "Technical", "SQL", or "Behavioral"' },
          question: { type: Type.STRING },
          codingTopic: { type: Type.STRING },
          hints: { type: Type.ARRAY, items: { type: Type.STRING } },
          idealAnswer: { type: Type.STRING },
        },
        required: ["id", "category", "question", "hints", "idealAnswer"],
      },
    },
    interviewTips: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["questions", "interviewTips"],
};

export const InterviewFeedbackSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    feedback: { type: Type.STRING },
    betterPhrasing: { type: Type.STRING },
  },
  required: ["score", "feedback", "betterPhrasing"],
};

export const LinkedInSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    messageBody: { type: Type.STRING },
    explanation: { type: Type.STRING },
    followUpTip: { type: Type.STRING },
  },
  required: ["subject", "messageBody", "explanation", "followUpTip"],
};

export const SkillGapSchema = {
  type: Type.OBJECT,
  properties: {
    skillGapPercentage: { type: Type.INTEGER },
    jobReadinessScore: { type: Type.INTEGER },
    missingSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          importance: { type: Type.STRING, description: 'Must be "High", "Medium", or "Low"' },
          learningPath: { type: Type.STRING },
        },
        required: ["skill", "importance", "learningPath"],
      },
    },
    learningPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["skillGapPercentage", "jobReadinessScore", "missingSkills", "learningPlan"],
};

const SCHEMA_MAP = new Map<string, any>([
  [CAREER_DISCOVERY_PROMPT, CareerDiscoverySchema],
  [RESUME_ANALYZER_PROMPT, ResumeAnalyzerSchema],
  [ROADMAP_PROMPT, RoadmapSchema],
  [INTERVIEW_PREP_PROMPT, InterviewPrepSchema],
  [INTERVIEW_FEEDBACK_PROMPT, InterviewFeedbackSchema],
  [LINKEDIN_PROMPT, LinkedInSchema],
  [SKILL_GAP_PROMPT, SkillGapSchema],
]);

/**
 * Utility to format and substitute variable placeholders in prompts
 */
export function formatPrompt(template: string, variables: Record<string, any>): string {
  let formatted = template;
  for (const [key, value] of Object.entries(variables)) {
    const valStr = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    formatted = formatted.replace(new RegExp(`\\$\\{${key}\\}`, "g"), valStr);
  }
  return formatted;
}

/**
 * Generates a structured JSON response from Gemini with automatic retry logic
 */
export async function generateJSONResponse<T>(
  promptTemplate: string,
  variables: Record<string, any>,
  fallbackValue: T
): Promise<T> {
  const client = getGeminiClient();
  const formattedPrompt = formatPrompt(promptTemplate, variables);
  const responseSchema = SCHEMA_MAP.get(promptTemplate);
  
  const maxRetries = 2;
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      const currentModel = modelsToTry[attempt - 1] || "gemini-3.5-flash";
      console.log(`Sending prompt to Gemini using model ${currentModel} (Attempt ${attempt}/${maxRetries})...`);
      
      const response = await client.models.generateContent({
        model: currentModel,
        contents: formattedPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Received empty response text from Gemini");
      }

      console.log("Raw response text length:", text.length);
      try {
        const parsed = JSON.parse(text) as T;
        return parsed;
      } catch (jsonErr: any) {
        console.error("JSON parsing failed for content:", text);
        // Let's try to extract JSON from markdown if it was wrapped despite system instruction
        const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          try {
            const extracted = JSON.parse(match[1].trim()) as T;
            return extracted;
          } catch (nestedErr) {
            console.error("Failed to parse extracted JSON block as well");
          }
        }
        throw jsonErr;
      }
    } catch (error: any) {
      console.error(`Gemini API call or parsing failed on attempt ${attempt}:`, error.message || error);
      if (attempt >= maxRetries) {
        console.warn("Max retries reached. Gracefully falling back to baseline structured response.");
        return fallbackValue;
      }
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return fallbackValue;
}
