# IMPLEMENTATION.md

## Architecture Overview

```
Frontend (React + Vite)
        |
        v
Backend (Node.js + Express)
        |             \
        v              v
    MongoDB        Google Gemini API
```

---

## Backend Design

### 1. Models

**Competitor**
- name
- urls (pricing, docs, changelog)
- tags
- alertThreshold
- createdAt

**Snapshot**
- competitorId
- urlType (pricing / docs / changelog)
- rawContent
- cleanedContent
- createdAt

**CheckResult**
- competitorId
- urlType
- snapshotId (ref → Snapshot, with `snapshotContent` populated in API response)
- diffData (added[], removed[], changeScore)
- llmSummary
- createdAt

---

## 2. Scraping

Implementation (`scraperService.js`):
- Axios to fetch page (gzip + redirect support)
- 3-attempt retry with exponential backoff
- Googlebot User-Agent as final fallback
- Cheerio to extract body text
- Priority selector list (article, main, .content, body)
- Strips scripts, nav, footer, ads

Normalize content:
- Remove extra whitespace
- Split into line blocks for diffing

---

## 3. Diff Algorithm

Implementation (`diffUtil.js`):
- Compare previous snapshot `cleanedContent` to new
- Use `diff` npm package (line-level)
- Outputs structured JSON:
  - `added[]` — new lines
  - `removed[]` — deleted lines
  - `changeScore` — `(changedLines / baselineLines) × 100`
- History trimmed to last 5 entries per competitor+urlType

---

## 4. LLM Integration

### Provider
**OpenRouter** (`https://openrouter.ai/api/v1`) via `axios`  
**Model:** `arcee-ai/trinity-large-preview:free`

**Why OpenRouter + arcee-ai/trinity-large-preview?**
- Completely free tier — no billing required
- Accessed via standard OpenAI-compatible chat completions API
- Sufficient context and quality for diff summarization tasks
- API key set via `OPENROUTER_API_KEY` env var (falls back to `GEMINI_API_KEY`)

### Prompt Strategy
- Diff summarization prompt (`llmService.js`):
  - 2–3 sentence overview
  - Bullet-point key changes with cited snippets
  - "Changes That Matter" (pricing, features, breaking changes)
  - Impact Level: Low / Medium / High

### Chunking
If diff > ~8000 chars:
- Split into ~6000-char chunks
- Summarize each chunk independently
- Final merge prompt combines chunk summaries

---

## 5. Status Page Implementation

Endpoint: `GET /api/status`

Checks:
- DB connection (Mongoose ping)
- LLM test call (`Reply with: OK`)
- Process uptime

Returns:
```json
{
  "backend": "ok",
  "database": "ok",
  "llm": "ok",
  "uptime": 12345
}
```

---

## 6. Key Frontend Components

- **`SnapshotPreview`** — renders full scraped snapshot content on the competitor detail page without character limit
- **`DiffViewer`** — renders line-level diff with added/removed highlighting
- **Modal preview** — scrollable with generous max-height, no truncation
- **`_redirects` file** (`frontend/public/_redirects`) — `/* /index.html 200` for SPA routing on Netlify/Render

---

## 7. Error Handling

Scenarios handled:
- Invalid URL (Zod client + server validation)
- Fetch timeout / 403 (retry with UA rotation)
- No previous snapshot (first-check baseline mode)
- LLM failure (graceful error, diff stored without summary)
- DB failure (health check reports status)

---

## 8. Security

- All API keys in `.env` (never committed)
- CORS whitelist via `FRONTEND_URL` env var
- Rate limiting on `POST /api/check` — 10 req/min
- Input validation with Zod on both client and server

---

## 9. Deployment Strategy

**Backend:** Render (free tier, auto-sleep disabled via paid plan or keep-alive ping)  
**Database:** MongoDB Atlas (free M0 cluster)  
**Frontend:** Netlify (free tier, `_redirects` file handles SPA routes)

Environment variables set in each platform's dashboard:
- `NODE_ENV=production`
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `FRONTEND_URL`
- `VITE_API_URL`
