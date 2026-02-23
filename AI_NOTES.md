# AI_NOTES.md

## LLM Provider & Rationale

**Provider:** [OpenRouter](https://openrouter.ai/) via `axios` (OpenAI-compatible API)  
**Model:** `arcee-ai/trinity-large-preview:free`

**Why OpenRouter + arcee-ai/trinity-large-preview?**
- Completely free tier — no credit card or billing required
- OpenAI-compatible `/chat/completions` endpoint — easy to swap models
- Quality sufficient for competitive diff summarization
- API key configured via `OPENROUTER_API_KEY` env var

---

## What I Used AI For

### 1. Summarization Prompt Design
I designed the LLM prompt to:
- Summarize diff changes in 2-3 sentences
- Produce a bullet-point breakdown
- Extract direct quote citations from the diff
- Assign an **Impact Level** (Low/Medium/High) with justification
- Identify "Changes That Matter" (pricing, features, deprecations)

I wrote and iterated this prompt myself based on what would be useful output.

### 2. Chunking Strategy
For diffs exceeding ~8000 characters, I split them into chunks of ~6000 chars, summarize each, then make a second LLM call to merge the chunk summaries. This is a deliberate design decision — not an AI suggestion.

### 3. Code Scaffolding
I used AI assistance for initial scaffolding of boilerplate Express routes and Mongoose schema structure. All business logic (diff pipeline, check controller, retry logic) was written and reviewed by me.

---

## What I Checked Myself

- **Scraper retry logic** — manually verified that User-Agent rotation and Googlebot fallback work by testing against known blocking sites
- **Diff correctness** — tested with synthetic text changes to verify added/removed lines are accurate
- **Change score formula** — `changedLines / baselineLines × 100` is intentional; reviewed for edge cases (empty content, first check)
- **LLM response parsing** — output is returned as a markdown string; no structured parsing needed, which avoids JSON extraction bugs
- **History trimming** — verified `CheckResult.deleteMany` only deletes IDs beyond the 5th entry, not all history
- **Security** — no API keys in code; CORS whitelist; rate limiting on Check Now endpoint (10 req/min)

---

## What Is Not AI-Generated (Built/Verified Manually)

- All Mongoose models and relationships
- The 3-retry scraping logic with exponential backoff
- The semantic content extraction (priority selector list)
- The diff pipeline orchestration in `checkController.js`
- The Zod validation schemas
- The status page health check logic (DB ping + LLM test call)
- All React UI components and CSS design system
- Docker Compose configuration
