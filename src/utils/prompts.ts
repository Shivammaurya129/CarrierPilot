/**
 * Prompt templates for CareerPilot AI
 */

export const SYSTEM_INSTRUCTIONS = `
You are CareerPilot AI, an elite career mentor, resume architect, and interview strategist.
Your mission is to provide students and fresh graduates with highly-personalized, accurate, and actionable guidance.
Always be realistic, encouraging, and detail-oriented.
When requested to return JSON, you MUST output ONLY valid JSON that matches the specified schema.
Do NOT wrap your JSON in HTML markup or anything else. Just return pure JSON, or markdown-wrapped JSON codeblocks if requested.
`;

export const CAREER_DISCOVERY_PROMPT = `
You are a career counselor advising a student with the following profile:
Interests: \${interests}
Skills: \${skills}
Education: \${education}
Experience Level: \${experienceLevel}
Specific Preferences: \${preferences}

Based on this, suggest 3 tailored career paths.
For each path, you must provide:
1. Job Title
2. Match Score (percentage 0-100) based on their skills and interests
3. Salary Range (realistic entry-level to mid-level estimate in USD, e.g., "$70,000 - $110,000")
4. Top hiring companies (3 well-known companies)
5. Missing Skills they need to acquire
6. Learning recommendations (courses, certificates, or projects)
7. A highly actionable 30-day plan divided into 3 intervals: Days 1-10, Days 11-20, Days 21-30.
8. Why this career path fits their specific profile.

Return your response in JSON format matching this schema:
{
  "suggestions": [
    {
      "title": "string",
      "matchScore": number,
      "salaryRange": "string",
      "companies": ["string"],
      "missingSkills": ["string"],
      "learningRecommendations": ["string"],
      "actionPlan30Day": {
        "days1to10": ["string"],
        "days11to20": ["string"],
        "days21to30": ["string"]
      },
      "whyItFits": "string"
    }
  ]
}
`;

export const RESUME_ANALYZER_PROMPT = `
Analyze the following resume details.
Resume Text Content:
\${resumeText}

Target Role: \${targetRole}

Perform a rigorous resume review. Provide:
1. ATS Score (0-100) assessing how well this resume matches the target role (or general entry-level if target role is empty).
2. Professional summary of the resume.
3. 3-4 Key Strengths.
4. 3-4 Key Weaknesses or areas of improvement.
5. Missing technical/soft skills relative to the target role.
6. Missing industry keywords (highly recommended for ATS scanning).
7. 2 Suggested projects that would fill their skills gaps (including title, description, and key technologies).
8. Recommend 2 certifications that would boost this resume.
9. At least 3 improved bullet points from their resume, demonstrating how to rewrite experience using the "X-Y-Z formula" (Accomplished [X] as measured by [Y], by doing [Z]) with a clear explanation of the impact.

Return your response in JSON format matching this schema:
{
  "atsScore": number,
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingSkills": ["string"],
  "missingKeywords": ["string"],
  "suggestedProjects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "certifications": ["string"],
  "improvedBulletPoints": [
    {
      "original": "string",
      "improved": "string",
      "impactExplained": "string"
    }
  ]
}
`;

export const ROADMAP_PROMPT = `
Generate a structured, highly actionable career roadmap.
Target Role: \${targetRole}
Roadmap Duration: \${timeframeWeeks} Weeks
Current Skills: \${currentSkills}

Provide:
1. Estimated Job Readiness Score (0-100) right now.
2. A weekly schedule for \${timeframeWeeks} weeks. For each week, specify:
   - Week number (1, 2, etc.)
   - Focus area
   - 3-4 precise tasks to do
   - 2 learning resources (name, type: "course" | "article" | "project", and mock or real URL name)
3. 2 Practical portfolio projects they should build during this roadmap, including difficulty level and expected deliverables.
4. 2 Certifications they should pursue.

Return your response in JSON format matching this schema:
{
  "jobReadinessScore": number,
  "weeklySchedule": [
    {
      "week": number,
      "focus": "string",
      "tasks": ["string"],
      "resources": [
        {
          "name": "string",
          "type": "course" | "article" | "project",
          "url": "string"
        }
      ]
    }
  ],
  "projects": [
    {
      "title": "string",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "deliverables": ["string"]
    }
  ],
  "certifications": ["string"]
}
`;

export const INTERVIEW_PREP_PROMPT = `
Generate 4 typical interview questions for a candidate preparing for the role of "\${targetRole}" at a "\${companyType}" company.
Difficulty level: \${difficulty}

Generate:
- 1 HR/Culture question
- 1 Core Technical/Conceptual question
- 1 SQL/Data question (or scenario-based analytical question if the role doesn't use SQL)
- 1 Behavioral/STAR-method question (e.g., "Tell me about a time...")

For each question, provide:
1. Category ("HR", "Technical", "SQL", "Behavioral")
2. The question text
3. A coding or analytical topic if applicable (optional)
4. 2 helpful hints to guide the candidate
5. An ideal comprehensive response

Also provide 3 strategic interview tips for this specific target role and company type.

Return your response in JSON format matching this schema:
{
  "questions": [
    {
      "id": "string",
      "category": "HR" | "Technical" | "SQL" | "Behavioral",
      "question": "string",
      "codingTopic": "string",
      "hints": ["string"],
      "idealAnswer": "string"
    }
  ],
  "interviewTips": ["string"]
}
`;

export const INTERVIEW_FEEDBACK_PROMPT = `
Evaluate the candidate's answer to the following interview question.
Question: "\${question}"
Ideal Answer Guideline: "\${idealAnswer}"
Candidate's Answer: "\${userAnswer}"

Provide:
1. Score (0-100) based on accuracy, depth, structure (such as using the STAR method for behavioral), and professional phrasing.
2. Constructive feedback explaining strengths and weaknesses of their answer.
3. A much better, polished, professional phrasing of their response.

Return your response in JSON format matching this schema:
{
  "score": number,
  "feedback": "string",
  "betterPhrasing": "string"
}
`;

export const LINKEDIN_PROMPT = `
Generate a tailored LinkedIn message for outreach.
Recipient's Role: \${recipientRole}
Recipient's Company: \${recipientCompany}
My Background/Context: \${myBackground}
Purpose of Message: \${purpose} (e.g., connection, referral, recruiter, followup)
Tone: \${tone} (professional, casual, enthusiastic)

Create:
1. A brief, catchy subject line (optional, useful for LinkedIn InMail/Email).
2. The message body (max 300 words, highly personalized, respecting LinkedIn's character limit constraints, engaging call to action, no placeholders like "[Your Name]").
3. Explanations on why this message is structured this way.
4. One follow-up tip (e.g., when to follow up, what to mention).

Return your response in JSON format matching this schema:
{
  "subject": "string",
  "messageBody": "string",
  "explanation": "string",
  "followUpTip": "string"
}
`;

export const SKILL_GAP_PROMPT = `
Analyze the skill gap for a candidate aiming for the role of "\${targetRole}".
Candidate's Current Skills: \${mySkills}

Provide:
1. Overall Skill Gap Percentage (0 to 100, where 100 means complete gap / no skills, and 0 means perfect alignment).
2. Estimated Job Readiness Score (0-100).
3. List of missing skills critical to the role. For each skill, specify:
   - Skill name
   - Importance ("High" | "Medium" | "Low")
   - Recommended custom learning path (e.g., online courses, books, building a specific project)
4. A 3-step learning plan to bridge the overall gap.

Return your response in JSON format matching this schema:
{
  "skillGapPercentage": number,
  "jobReadinessScore": number,
  "missingSkills": [
    {
      "skill": "string",
      "importance": "High" | "Medium" | "Low",
      "learningPath": "string"
    }
  ],
  "learningPlan": ["string"]
}
`;
