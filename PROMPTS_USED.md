# PROMPTS_USED.md

This file records the key prompts used during development of the CompTracker application. Agent/LLM responses are excluded as per project guidelines.

---

## 1. Diff Summarization Prompt (used in `llmService.js`)

```
You are a competitive intelligence analyst. Analyze the following content changes on {competitorName}'s {urlType} page and write a concise professional summary.

CHANGES DETECTED:
--- REMOVED ---
{removedLines}

+++ ADDED +++
{addedLines}

Please respond with:
1. **Summary**: 2-3 sentence overview of what changed
2. **Key Changes** (bullet list):
   - Each key change with a direct quote snippet in "quotes"
3. **Changes That Matter**: Which changes are most business-critical (pricing shifts, feature additions, deprecations, breaking changes)?
4. **Impact Level**: Low / Medium / High — and why

Keep your response focused and cite specific text snippets from the diff.
```

---

## 2. Chunk Merge Prompt (used in `llmService.js` for large diffs)

```
You analyzed changes on {competitorName}'s {urlType} page in {N} parts. Here are the part summaries:

{partSummaries}

Write a unified, concise final summary combining all parts. Include key changes, important citations, and impact level.
```

---

## 3. LLM Health Test Prompt (used in `statusController.js`)

```
Reply with: OK
```

---

## 4. App Planning (used in project design phase)

```
Design a competitive intelligence tracker web app. It should:
- Track competitor pricing, docs, and changelog pages
- Show line-level diffs when content changes
- Generate an AI summary of what changed and why it matters
- Store history of last 5 checks per competitor
What architecture would you suggest for a Node.js + MongoDB + React stack?
```

---

## 5. Scraper Design Prompt (research phase)

```
What is the best approach to scrape content from web pages using Axios and Cheerio that:
- Handles redirects and gzip compression
- Works around basic bot detection (403 responses)
- Extracts only meaningful text (strips nav, footer, scripts)
- Normalizes whitespace for text comparison

Give me the key implementation patterns, not full code.
```

---

*Note: All prompt responses were reviewed and code was manually checked before use.*
