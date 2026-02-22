# REQUIREMENTS.md

## 1. Functional Requirements

### 1.1 Competitor Management
- User can add 5–10 competitor links
- Each competitor includes:
  - Name
  - Website URL
  - Pricing page URL
  - Docs page URL
  - Changelog URL
  - Optional tags

### 1.2 Content Fetching
- User clicks "Check Now"
- System:
  - Fetches content
  - Cleans HTML
  - Extracts meaningful text
  - Stores snapshot in DB

### 1.3 Change Detection
- Compare latest content to last snapshot
- Compute:
  - Added lines
  - Removed lines
  - Modified lines
- Store structured diff result

### 1.4 LLM Summary
- Generate:
  - Summary of changes
  - Bullet-point breakdown
  - Snippet citations
  - “Changes that matter” highlight

### 1.5 History
- Show last 5 checks per competitor
- Each entry includes:
  - Timestamp
  - Diff summary
  - LLM summary

### 1.6 Status Page
Displays:
- Backend health
- MongoDB connection
- LLM connection test

### 1.7 Input Handling
- Validate URLs
- Handle unreachable sites
- Handle empty content
- Show user-friendly errors

---

## 2. Non-Functional Requirements

- Dockerized setup
- One-command start
- Hosted publicly
- Secure environment variables
- Max response time target < 5 seconds per check (excluding LLM)
- Graceful failure on scraping errors