# ROADMAP.md

## ✅ Phase 1 – Project Setup
- [x] Initialize backend (Express)
- [x] Initialize frontend (React + Vite)
- [x] Setup MongoDB connection
- [x] Docker configuration

## ✅ Phase 2 – Core Backend
- [x] Competitor schema (name, urls, tags, alertThreshold)
- [x] Snapshot schema (competitorId, urlType, cleanedContent)
- [x] CheckResult schema (diffData, llmSummary, changeScore)
- [x] Scraper service (3-retry, Googlebot UA fallback)
- [x] Diff utility (line-level, changeScore)
- [x] REST endpoints (competitors, checks, history, status)

## ✅ Phase 3 – Frontend UI
- [x] Home page (competitor dashboard)
- [x] Add competitor form (Zod validation)
- [x] Competitor list page with tag filter
- [x] Check Now button with loading state
- [x] History view with diff + LLM summary
- [x] **SnapshotPreview component** — full scraped content on detail page (no char limit)
- [x] **`_redirects` file** — SPA routing fix for Netlify/Render (`/* /index.html 200`)
- [x] Modal preview with scrollable, unrestricted height

## ✅ Phase 4 – LLM Integration
- [x] Connect to Google Gemini 1.5-flash
- [x] Create diff summarization prompt (summary, bullets, citations, impact level)
- [x] Implement chunking strategy (~6000 char chunks + merge prompt)
- [x] Add citation extraction ("Changes That Matter")

## ✅ Phase 5 – Status Page
- [x] Health check endpoint (`GET /api/status`)
- [x] LLM test call (`Reply with: OK`)
- [x] Mongo test ping (Mongoose connection check)

## ✅ Phase 6 – Enhancements
- [x] Tags and tag filter
- [x] Alert threshold config per competitor
- [x] "Changes That Matter" highlight in LLM output
- [ ] Cron auto-check (stub exists, not wired to UI)

## ✅ Phase 7 – Deployment
- [x] Dockerize app (docker-compose.yml)
- [x] Deploy backend on Render
- [x] Deploy frontend on Netlify
- [x] Configure environment variables on each platform
- [x] Test live LLM integration (Gemini API)

## ✅ Phase 8 – Documentation
- [x] README (setup, deploy, env vars, tech stack)
- [x] AI_NOTES (LLM choices, chunking rationale, what was AI-assisted vs manual)
- [x] ABOUTME (author, tech stack, design decisions)
- [x] PROMPTS_USED (all key prompts with explanations)
- [x] IMPLEMENTATION.md (architecture, models, services)
- [x] ROADMAP.md (this file, status of all phases)
