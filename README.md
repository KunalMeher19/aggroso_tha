# CompTracker — Competitive Intelligence Tracker

Monitor competitor websites, detect content changes, and get AI-powered summaries. Built with Node.js, React, MongoDB, and Google Gemini.

---

## 🚀 Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/aggroso_tha.git
cd aggroso_tha

# 2. Set your Gemini API key
export GEMINI_API_KEY=your_key_here
# (Windows PowerShell) $env:GEMINI_API_KEY="your_key_here"

# 3. One command start
docker-compose up --build
```

Open `http://localhost` — frontend is live.  
API available at `http://localhost:5000/api`.

---

## 🛠 Local Development (Without Docker)

### Prerequisites
- Node.js 20+
- MongoDB running locally (`mongod`)

### Backend
```bash
cd backend
cp .env.example .env      # fill in GEMINI_API_KEY and MONGODB_URI
npm install
npm run dev               # starts on :5000
```

### Frontend
```bash
cd frontend
cp .env.example .env      # set VITE_API_URL=http://localhost:5000
npm install
npm run dev               # starts on :3000
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `FRONTEND_URL` | Allowed CORS origin |
| `NODE_ENV` | development / production |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL for API calls |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20 + Express 4 |
| Database | MongoDB + Mongoose |
| Scraping | Axios + Cheerio (3-retry, UA rotation) |
| Diff | `diff` npm package (line-level) |
| AI | Google Gemini 1.5-flash |
| Frontend | React + Vite |
| Deployment | Docker + Nginx |

---

## ✅ What's Done

- [x] Add 5–10 competitors with pricing / docs / changelog URLs + tags
- [x] "Check Now" — scrapes all URLs, 3-attempt retry with Googlebot fallback
- [x] Line-level diff with change score (% content changed)
- [x] Gemini AI summary with business-critical highlights and citations
- [x] Diff chunking for large pages (token limit handling)
- [x] History: last 5 checks per competitor per URL type
- [x] Status page: backend uptime, DB ping, LLM test call
- [x] Input validation (Zod — client + server)
- [x] Tags, tag filter, alert threshold config
- [x] Premium dark theme React UI
- [x] Docker Compose one-command run
- [x] `.env.example` for both backend and frontend

## ❌ What's Not Done (Future Work)

- Email alerts when change score exceeds threshold
- Scheduled auto-checks (cron) — code stub exists (`node-cron` installed)
- Support for JavaScript-rendered SPAs (requires Playwright, too heavy for free hosting)
- Full unit test suite (basic structure in place)
- User authentication / multi-tenancy

---

## 🔑 Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. Add to `backend/.env` as `GEMINI_API_KEY=...`

Gemini 1.5-flash is free tier with generous limits — perfect for this use case.

---

## 🐳 Docker Notes

The `docker-compose.yml` starts:
1. `mongo` — MongoDB 7 with a named volume for persistence
2. `backend` — Express API (waits for MongoDB health check)
3. `frontend` — Nginx serving the React build + proxying `/api` to backend

---

*Built by Ardhendu Abhishek Meher*
