# CareerPilot AI 🚀

CareerPilot AI is a production-grade, AI-powered career counseling and strategic acceleration platform designed specifically for students, fresh graduates, and transitioners. The platform centralizes full-cycle career counseling—from core interest matchmaking and resume ATS optimization to interactive mock interviews and high-conversion networking pitches—into a unified, high-performance web dashboard.

---

## 🛠️ Technology Stack

- **Frontend Architecture:** 
  - **React 18** Single Page Application (SPA).
  - **Vite** with Fast Refresh for rapid local environment feedback.
  - **Tailwind CSS v4** for beautiful, fluid layouts.
  - **Framer Motion** (`motion/react`) for smooth route and view entry animations.
  - **Lucide Icons** for clean, vector indicators.
- **Backend Architecture:**
  - **Express (Node.js)** web server binding to port `3000` (container ingress native).
  - **esbuild** for compiling TypeScript backend scripts into zero-dependency `dist/server.cjs` modules, preventing runtime relative import crashes.
  - **dotenv** for local environment management.
- **Intelligence Layer:**
  - **Official Google GenAI SDK (`@google/genai`)** utilizing **Gemini 3.5 Flash** for rapid, structured JSON output matching strict schemas.
  - **Native Document Reading** via Gemini Flash, uploading PDF byte arrays directly to Gemini API without heavy, error-prone third-party text parsing libraries.

---

## 💎 Core Features

1. **Career Discovery (`POST /api/career`):** Evaluates profile characteristics (interests, skills, education, preferences) to recommend 3 optimal career directions with matching margins, realistic salary bands, target employers, skill gaps, and 30-day schedules.
2. **Resume Analyzer (`POST /api/resume`):** Offers full ATS score grading, summaries, weaknesses, project outlines, credential suggestions, and before/after comparisons utilizing the X-Y-Z accomplishment formatting framework. Supports native PDF uploading.
3. **AI Career Roadmap (`POST /api/roadmap`):** Formulates interactive week-by-week checkbox milestone schedules with direct search hooks for online courses and articles, combined with custom portfolio Capstones.
4. **Interview Preparation (`POST /api/interview` & `/api/interview/feedback`):** Simulates technical, HR, behavioral, and SQL questions. Allows the user to type answers and provides detailed STAR ratings (0-100) and professional rephrasings.
5. **LinkedIn Message Generator (`POST /api/linkedin`):** Drafts tailored cold-outreach templates with custom copy-to-clipboard actions and tactical follow-up suggestions.
6. **Skill Gap Analyzer (`POST /api/skill-gap`):** Audits overall market readiness and creates custom learning plans to bridge technical deficiencies.

---

## 📁 Project Structure

```
├── /dist/                       # Production bundle output
├── /src/
│   ├── /components/
│   │   ├── Sidebar.tsx          # Responsive layout sidebar menu
│   │   ├── Navbar.tsx           # Context header with diagnostic clocks
│   │   ├── Footer.tsx           # Production diagnostic footer
│   │   └── Toast.tsx            # Fluid framer-motion notifications portal
│   ├── /pages/
│   │   ├── DashboardOverview.tsx # Central Launchpad overview
│   │   ├── CareerDiscovery.tsx  # Feature 1
│   │   ├── ResumeAnalyzer.tsx   # Feature 2 (PDF Uplink)
│   │   ├── Roadmap.tsx          # Feature 3 (Interactive calendar checklists)
│   │   ├── InterviewPrep.tsx    # Feature 4 (STAR grading console)
│   │   ├── LinkedInGenerator.tsx# Feature 5 (Copy drafts)
│   │   └── SkillGap.tsx         # Feature 6 (Skills matrix)
│   ├── App.tsx                  # Main router and animations container
│   ├── index.css                # Global styles with Inter, Space Grotesk and Mono fonts
│   ├── main.tsx                 # Client react entrypoint
│   └── types.ts                 # Type safety definitions for endpoints
├── .env.example                 # Environment variables checklist
├── Dockerfile                   # Multi-stage lightweight deployment container
├── docker-compose.yml           # Container orchestrator
├── package.json                 # Dependency definitions and scripts
├── server.ts                    # Backend express routes and Vite middleware proxy
└── tsconfig.json                # TypeScript configurations
```

---

## 📡 API Schema Documentation

All endpoints receive and return `application/json` payloads.

### 1. `POST /api/career`
- **Request Body:**
  ```json
  {
    "interests": ["Web design", "Coding"],
    "skills": ["JavaScript", "React"],
    "education": "B.Tech Computer Science",
    "experienceLevel": "student",
    "preferences": "Remote preferred"
  }
  ```
- **Response JSON:**
  ```json
  {
    "suggestions": [
      {
        "title": "Frontend Engineer",
        "matchScore": 92,
        "salaryRange": "$80,000 - $115,000",
        "companies": ["Stripe", "Vercel"],
        "missingSkills": ["TypeScript", "Tailwind"],
        "learningRecommendations": ["Learn TS foundations"],
        "actionPlan30Day": {
          "days1to10": ["Task 1"],
          "days11to20": ["Task 2"],
          "days21to30": ["Task 3"]
        },
        "whyItFits": "Strong matches with React foundations."
      }
    ]
  }
  ```

### 2. `POST /api/resume`
- **Request Body:**
  *Either `resumeText` or `pdfBase64` (base64-encoded PDF byte array) must be provided.*
  ```json
  {
    "resumeText": "pasted text...",
    "pdfBase64": "JVBER...",
    "targetRole": "React Developer"
  }
  ```
- **Response JSON:**
  ```json
  {
    "atsScore": 82,
    "summary": "Core software foundations are solid...",
    "strengths": ["Clear documentation skills"],
    "weaknesses": ["Metrics are not quantifiable"],
    "missingSkills": ["TypeScript"],
    "missingKeywords": ["scalability"],
    "suggestedProjects": [
      {
        "title": "Scalable Dashboard",
        "description": "Build high scale UI modules",
        "technologies": ["React", "TypeScript"]
      }
    ],
    "certifications": ["AWS Certified Cloud Practitioner"],
    "improvedBulletPoints": [
      {
        "original": "Worked on features.",
        "improved": "Engineered 3 high scale React modules reducing load latency by 20%.",
        "impactExplained": "Uses quantifiable metrics to establish scale and ownership."
      }
    ]
  }
  ```

*(See `src/types.ts` for full schema interfaces for roadmaps, interview preparations, outreach generators, and skill gap audits).*

---

## 🐳 Docker Deployment & Orchestration

The platform is designed to compile, build, and deploy into uniform multi-stage container targets.

### Local Composition Build
Create a `.env` file containing your `GEMINI_API_KEY`:
```bash
GEMINI_API_KEY=your-gemini-key-here
```

Launch the environment using Docker Compose:
```bash
docker compose up --build -d
```
The application will package, build static assets, bundle server entrypoints, and boot on `http://localhost:3000`.

---

## 🚀 AWS App Runner Deployment

AWS App Runner provides fully managed container ingress routing.

1. **GitHub Connection:** Connect your GitHub repository to AWS App Runner.
2. **Build Configuration:**
   - **Runtime:** `Node.js 18+` or `Docker` (Highly recommended to select **Docker** as it automatically honors our high-performance `/Dockerfile`).
   - **Port:** Set container ingress port to `3000`.
3. **Environment Variables:**
   - Add `GEMINI_API_KEY` in the AWS App Runner console under the configuration secrets block.
4. **Deploy:** Click deploy. AWS App Runner will spin up our Alpine container, map custom TLS domains, and scale dynamically.

---

## 🧪 Local Testing & Manual Verification

To run and edit the code locally without Docker:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run in development mode:**
   ```bash
   npm run dev
   ```
   This will mount the Express server with live Vite middleware integration, letting you edit assets on-the-fly.
3. **Run Lint Checks:**
   ```bash
   npm run lint
   ```
4. **Compile Production Build:**
   ```bash
   npm run build
   ```
   This generates compiled bundle files inside `/dist/index.html` and builds the unified server into `/dist/server.cjs` via esbuild.
5. **Start Production Instance:**
   ```bash
   npm run start
   ```
