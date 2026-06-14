# GitMatch

**GitMatch** is a production-ready Electron desktop application that analyzes a candidate's GitHub profile against a job description and calculates a real **Job Fit Score** — powered by deep dependency scanning, multi-source skill extraction, and a background worker thread pipeline.

> Built for recruiters, hiring managers, and developers who want an instant, data-driven assessment of technical alignment.

---

## ✨ Features

- **GitHub OAuth Login** — Secure authentication via GitHub's official OAuth 2.0 flow.
- **Job Fit Score** — Overall percentage compatibility score between a GitHub profile and a job description.
- **Multi-Source Skill Extraction** — Skills are extracted from:
  - Repository primary language (GitHub API)
  - Repository topics, names, and descriptions
  - Actual dependency files (`package.json`, `requirements.txt`, `Gemfile`, `go.mod`, `pom.xml`, `cargo.toml`, `composer.json`)
- **JD Parser** — Automatically extracts required role, experience, and technical skills from raw job description text.
- **Match Engine** — Case-insensitive skill matching with full breakdown of matched and missing skills.
- **Strengths & Weaknesses** — Qualitative insights generated from the match results.
- **Background Worker Thread** — CPU-intensive analysis runs in an isolated Worker Thread, keeping the UI responsive.
- **Local Token Persistence** — OAuth token stored securely using `electron-store`.
- **Premium Dark UI** — Modern SaaS-inspired design with smooth animations and responsive layout.

---

## 🔬 How It Works

```
GitHub Username + Job Description
         ↓
  1. Fetch public profile & repos (GitHub API)
         ↓
  2. Deep scan top 10 repos for dependency files
     (package.json → React, Express, Mongoose …)
     (requirements.txt → Django, FastAPI …)
         ↓
  3. Parse Job Description for role, experience, required skills
         ↓
  4. Match profile skills vs JD skills (Worker Thread)
         ↓
  5. Format: score, matched, missing, strengths, weaknesses
         ↓
       Results Page
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop** | Electron 29, Preload Scripts (Context Isolation) |
| **Frontend** | React 18, React Router DOM, Vite |
| **Styling** | Vanilla CSS, Custom Design System, Google Fonts (Inter) |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express (OAuth Server) |
| **GitHub API** | @octokit/rest (REST + GraphQL) |
| **Analytics** | Custom engines: jdParser, matchEngine, profileSkillExtractor |
| **Concurrency** | Worker Threads (Node.js built-in) |
| **Storage** | electron-store |

---

## 📦 Setup Instructions

### 1. Prerequisites
- **Node.js** v18 or higher
- **Git**
- A **GitHub account** with a registered OAuth App

### 2. GitHub OAuth App Configuration
1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App** and fill in:
   - **Application Name**: `GitMatch`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization Callback URL**: `http://localhost:3000/callback`
3. Register the app and generate a **Client Secret**.

### 3. Environment Variables
Create a `.env` file in the project root:

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
PORT=3000
GITHUB_REDIRECT_URI=http://localhost:3000/callback
```

### 4. Install Dependencies
```bash
npm install
```
This also installs renderer dependencies via the `postinstall` script.

### 5. Run in Development
```bash
npm run dev
```
Starts both the Vite dev server (renderer) and Electron concurrently.

### 6. Build for Production
```bash
npm run build
```
Generates a Windows `.exe` installer in the `/dist` directory.

---

## 📂 Project Structure

```
GitMatch/
├── main/
│   ├── main.js          # Electron main process, IPC handlers, BrowserWindow
│   ├── preload.js       # Context bridge — exposes electronAPI to renderer
│   └── worker.js        # Worker thread entry: runs processJobFit pipeline
├── renderer/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Username input + JD textarea + validation
│   │   │   └── Results.jsx    # Match score, skills grid, insights
│   │   ├── components/
│   │   │   ├── MatchScoreCard.jsx   # SVG gauge + score tier
│   │   │   ├── MatchedSkills.jsx    # Green matched skill pills
│   │   │   ├── MissingSkills.jsx    # Red missing skill pills
│   │   │   ├── StrengthsCard.jsx    # Qualitative strengths list
│   │   │   ├── WeaknessesCard.jsx   # Areas to improve list
│   │   │   ├── UsernameInput.jsx    # GitHub username field
│   │   │   ├── JDInput.jsx          # Job description textarea
│   │   │   ├── AnalyzeButton.jsx    # Animated CTA button
│   │   │   ├── LoadingState.jsx     # Step-by-step analysis progress
│   │   │   └── Login.jsx            # OAuth login screen
│   │   ├── App.jsx      # Auth shell, routing, analysis handler
│   │   └── index.css    # Full premium design system
│   └── index.html
├── analytics/
│   ├── jdParser.js              # Parses JD: role, experience, skills
│   ├── profileSkillExtractor.js # Multi-source skill extraction from repos
│   ├── matchEngine.js           # Calculates match score, matched/missing
│   ├── resultFormatter.js       # Converts raw metrics to strengths/weaknesses
│   └── processor.js             # Orchestrator: wires all engines together
├── services/
│   ├── github.service.js        # GitHub REST + GraphQL API client
│   └── analysis.service.js      # Main pipeline: fetch → deep scan → worker → format
├── server/
│   └── index.js                 # Express OAuth callback server
├── store/
│   ├── index.js                 # electron-store schema
│   └── cacheStore.js            # In-memory cache with TTL
└── .env                         # GitHub OAuth credentials
```

---

## 🔒 Security

- **No Client Secrets in Frontend** — All OAuth exchanges happen in the secure Node.js main process.
- **Context Isolation** — Renderer cannot access Node.js APIs directly; only `electronAPI` is exposed.
- **Environment Variables** — All sensitive credentials are loaded from `.env` via `dotenv`.
- **Preload Script** — IPC bridge is strictly typed and limited to required channels only.

---

## 📄 License

MIT
