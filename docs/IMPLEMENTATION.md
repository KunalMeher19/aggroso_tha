# IMPLEMENTATION.md

## Architecture Overview

Frontend (React)
        |
        v
Backend (Node.js Express)
        |
        v
MongoDB
        |
        v
LLM API Provider

---

## Backend Design

### 1. Models

Competitor
- name
- urls (pricing, docs, changelog)
- tags
- createdAt

Snapshot
- competitorId
- rawContent
- cleanedContent
- createdAt

CheckResult
- competitorId
- snapshotId
- diffData
- llmSummary
- createdAt

---

## 2. Scraping

Use:
- Axios to fetch page
- Cheerio to extract body text
- Remove scripts, nav, footer

Normalize content:
- Remove extra whitespace
- Split into line blocks

---

## 3. Diff Algorithm

Approach:
- Compare previous snapshot cleaned text
- Use diff library (e.g., diff npm package)
- Convert to structured JSON:
  - added
  - removed
  - unchanged

Store only significant changes

---

## 4. LLM Integration

### Provider
OpenAI GPT-4o or Anthropic Claude

### Prompt Strategy
- Provide:
  - Diff output
  - Instructions to summarize
  - Ask for:
    - Important business changes
    - Pricing updates
    - Feature updates
    - Breaking changes
  - Ask to cite snippets

### Chunking
If diff > token limit:
- Split into chunks
- Summarize per chunk
- Merge summaries

---

## 5. Status Page Implementation

Endpoint: /api/status

Checks:
- DB connection
- LLM test call (short prompt)
- Process uptime

Returns:
{
  backend: "ok",
  database: "ok",
  llm: "ok"
}

---

## 6. Error Handling

Scenarios:
- Invalid URL
- Timeout
- No previous snapshot
- LLM failure
- DB failure

Implement:
- Try/catch blocks
- Structured error responses
- Retry logic for scraping

---

## 7. Security

- Store API keys in .env
- CORS configuration
- Rate limit “Check Now”
- Input validation via Joi or Zod

---

## 8. Deployment Strategy

Backend:
- Deploy on Render/Railway
- Persistent Mongo Atlas DB

Frontend:
- Deploy on Vercel

Environment:
- NODE_ENV=production
- MONGODB_URI
- LLM_API_KEY