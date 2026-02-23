const axios = require('axios');
const logger = require('../utils/logger');

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
// Free model on OpenRouter — reliable and fast
const MODEL = 'google/gemini-2.0-flash-exp:free';

const MAX_DIFF_CHARS = 8000;
const CHUNK_SIZE = 6000;

const getApiKey = () => {
    const key = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) throw new Error('OPENROUTER_API_KEY is not configured');
    return key;
};

/**
 * Call OpenRouter chat completions endpoint.
 */
const callLLM = async (prompt) => {
    const response = await axios.post(
        `${OPENROUTER_BASE}/chat/completions`,
        {
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024,
            temperature: 0.3,
        },
        {
            headers: {
                Authorization: `Bearer ${getApiKey()}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost',
                'X-Title': 'CompTracker',
            },
            timeout: 30000,
        }
    );

    const choice = response.data?.choices?.[0];
    if (!choice) throw new Error('Empty response from OpenRouter');
    return choice.message.content;
};

/**
 * Build the summarization prompt for a diff.
 */
const buildPrompt = (competitorName, urlType, added, removed) => {
    const addedText = added.slice(0, 80).map((l) => `+ ${l}`).join('\n');
    const removedText = removed.slice(0, 80).map((l) => `- ${l}`).join('\n');

    return `You are a competitive intelligence analyst. Analyze the following content changes on ${competitorName}'s ${urlType} page and write a concise professional summary.

CHANGES DETECTED:
--- REMOVED ---
${removedText || '(none)'}

+++ ADDED +++
${addedText || '(none)'}

Please respond with:
1. **Summary**: 2-3 sentence overview of what changed
2. **Key Changes** (bullet list):
   - Each key change with a direct quote snippet in "quotes"
3. **Changes That Matter**: Which changes are most business-critical (pricing shifts, feature additions, deprecations, breaking changes)?
4. **Impact Level**: Low / Medium / High — and why

Keep your response focused and cite specific text snippets from the diff.`;
};

/**
 * Split long diff content into manageable chunks.
 */
const chunkDiff = (added, removed) => {
    const allLines = [
        ...added.map((l) => `+${l}`),
        ...removed.map((l) => `-${l}`),
    ];

    const chunks = [];
    let current = [];
    let charCount = 0;

    for (const line of allLines) {
        if (charCount + line.length > CHUNK_SIZE) {
            chunks.push(current);
            current = [line];
            charCount = line.length;
        } else {
            current.push(line);
            charCount += line.length;
        }
    }
    if (current.length) chunks.push(current);
    return chunks;
};

/**
 * Summarize a diff using OpenRouter.
 * Handles chunking for large diffs.
 */
const summarizeDiff = async (competitorName, urlType, diffData) => {
    const { added = [], removed = [] } = diffData;

    if (added.length === 0 && removed.length === 0) {
        return { summary: 'No meaningful changes detected.', status: 'no_changes' };
    }

    try {
        const totalChars = [...added, ...removed].join('').length;
        let summaryText;

        if (totalChars <= MAX_DIFF_CHARS) {
            // Single call
            const prompt = buildPrompt(competitorName, urlType, added, removed);
            summaryText = await callLLM(prompt);
        } else {
            // Chunked summarization → merge
            logger.info(`Diff too large (${totalChars} chars), chunking for ${competitorName}`);
            const chunks = chunkDiff(added, removed);
            const chunkSummaries = [];

            for (const [i, chunk] of chunks.entries()) {
                const chunkAdded = chunk.filter((l) => l.startsWith('+')).map((l) => l.slice(1));
                const chunkRemoved = chunk.filter((l) => l.startsWith('-')).map((l) => l.slice(1));
                const prompt = buildPrompt(competitorName, urlType, chunkAdded, chunkRemoved);
                const text = await callLLM(prompt);
                chunkSummaries.push(`[Part ${i + 1}]\n${text}`);
            }

            // Merge summaries
            const mergePrompt = `You analyzed changes on ${competitorName}'s ${urlType} page in ${chunks.length} parts. Here are the part summaries:\n\n${chunkSummaries.join('\n\n---\n\n')}\n\nWrite a unified, concise final summary combining all parts. Include key changes, important citations, and impact level.`;
            summaryText = await callLLM(mergePrompt);
        }

        return { summary: summaryText, status: 'success' };
    } catch (err) {
        logger.error(`LLM summarization failed: ${err.message}`);
        return {
            summary: `AI summary unavailable: ${err.message}`,
            status: 'failed',
        };
    }
};

/**
 * Test LLM connectivity with a minimal prompt.
 */
const testLLMConnection = async () => {
    try {
        const text = await callLLM('Reply with exactly: OK');
        return { ok: true, response: text.trim() };
    } catch (err) {
        return { ok: false, error: err.message };
    }
};

module.exports = { summarizeDiff, testLLMConnection };
