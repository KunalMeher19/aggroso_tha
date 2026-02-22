const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Rotate user agents for better scraping success
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
];

const getRandomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

/**
 * Fetch a URL with retry logic.
 * Strategy:
 *   1. Try with browser-like headers (follows redirects, gzip)
 *   2. On 403/blocked → retry as Googlebot
 *   3. On timeout → retry once with longer timeout
 */
const fetchWithRetry = async (url, attempt = 1) => {
    const isGoogleBot = attempt === 2;
    const timeout = attempt <= 2 ? 15000 : 30000;

    try {
        const response = await axios.get(url, {
            timeout,
            maxRedirects: 5,
            responseType: 'text',
            decompress: true,
            headers: {
                'User-Agent': isGoogleBot
                    ? 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                    : getRandomUA(),
                Accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
            },
        });
        return response.data;
    } catch (err) {
        const status = err.response?.status;

        if (attempt < 3) {
            const delay = attempt * 2000;
            logger.warn(`Fetch attempt ${attempt} failed for ${url} (${status || err.code}). Retrying in ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
            return fetchWithRetry(url, attempt + 1);
        }

        // Classify the error
        if (status === 403 || status === 429) {
            throw Object.assign(new Error(`Access blocked (${status}): ${url}`), { type: 'blocked' });
        }
        if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
            throw Object.assign(new Error(`Timeout fetching: ${url}`), { type: 'timeout' });
        }
        throw Object.assign(new Error(`Failed to fetch ${url}: ${err.message}`), { type: 'failed' });
    }
};

/**
 * Extract meaningful text from raw HTML.
 * Removes: scripts, styles, nav, footer, header, ads, cookie banners.
 * Preserves: headings, paragraphs, lists, tables, pre/code blocks.
 */
const extractText = (html, url) => {
    const $ = cheerio.load(html);

    // Remove noise elements
    $(
        'script, style, noscript, iframe, img, svg, canvas, ' +
        'nav, footer, header, aside, ' +
        '[aria-hidden="true"], ' +
        '.cookie-banner, .cookie-notice, .cookie-bar, ' +
        '.ad, .ads, .advertisement, .banner, ' +
        '.sidebar, .modal, .popup, .overlay, ' +
        '.social-share, .newsletter-signup, ' +
        'meta, link'
    ).remove();

    // Main content priority: look for semantic main content areas first
    const contentSelectors = [
        'main',
        '[role="main"]',
        'article',
        '.content',
        '.main-content',
        '#content',
        '#main',
        '.page-content',
        '.docs-content',
        '.markdown-body',
        '.prose',
    ];

    let contentEl = null;
    for (const sel of contentSelectors) {
        if ($(sel).length > 0) {
            contentEl = $(sel).first();
            break;
        }
    }

    // Fallback to body
    const target = contentEl || $('body');

    // Extract text preserving structure
    const lines = [];

    target.find('h1, h2, h3, h4, h5, h6, p, li, td, th, pre, code, blockquote, dt, dd').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 2) {
            const tagName = el.tagName.toLowerCase();
            if (['h1', 'h2', 'h3'].includes(tagName)) {
                lines.push(`## ${text}`);
            } else if (['h4', 'h5', 'h6'].includes(tagName)) {
                lines.push(`### ${text}`);
            } else {
                lines.push(text);
            }
        }
    });

    // Deduplicate adjacent identical lines
    const deduped = lines.filter((line, i) => i === 0 || line !== lines[i - 1]);

    // Normalize: collapse multiple spaces, filter very short lines (noise)
    const normalized = deduped
        .map((l) => l.replace(/\s+/g, ' ').trim())
        .filter((l) => l.length > 3);

    return normalized.join('\n');
};

/**
 * Generate a hash of content for quick change detection.
 */
const hashContent = (content) =>
    crypto.createHash('sha256').update(content).digest('hex');

/**
 * Main scraping function.
 * Returns { rawContent, cleanedContent, contentHash, fetchStatus, errorMessage }
 */
const scrapeUrl = async (url) => {
    if (!url || url.trim() === '') {
        return {
            rawContent: '',
            cleanedContent: '',
            contentHash: '',
            fetchStatus: 'failed',
            errorMessage: 'Empty URL provided',
        };
    }

    try {
        const rawHtml = await fetchWithRetry(url);
        const cleanedContent = extractText(rawHtml, url);
        const contentHash = hashContent(cleanedContent);

        logger.debug(`Scraped ${url}: ${cleanedContent.length} chars extracted`);

        return {
            rawContent: rawHtml.substring(0, 50000), // cap raw storage
            cleanedContent,
            contentHash,
            fetchStatus: 'success',
            errorMessage: '',
        };
    } catch (err) {
        logger.warn(`Scraping failed for ${url}: ${err.message}`);
        return {
            rawContent: '',
            cleanedContent: '',
            contentHash: '',
            fetchStatus: err.type || 'failed',
            errorMessage: err.message,
        };
    }
};

module.exports = { scrapeUrl, hashContent };
