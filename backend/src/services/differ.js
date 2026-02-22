const { diffLines } = require('diff');

/**
 * Compare two text strings line-by-line.
 * Returns structured diff data including added/removed lines and stats.
 */
const computeDiff = (previousContent, currentContent) => {
    // Handle first-time checks
    if (!previousContent) {
        const lines = currentContent.split('\n').filter((l) => l.trim());
        return {
            added: lines.slice(0, 100), // preview of first 100 lines
            removed: [],
            stats: {
                addedCount: lines.length,
                removedCount: 0,
                totalLines: lines.length,
            },
            changeScore: 100,
            isFirstCheck: true,
        };
    }

    const changes = diffLines(previousContent, currentContent, {
        ignoreWhitespace: true,
        newlineIsToken: true,
    });

    const added = [];
    const removed = [];
    let totalPrev = 0;

    for (const part of changes) {
        const lines = (part.value || '')
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

        if (part.added) {
            added.push(...lines);
        } else if (part.removed) {
            removed.push(...lines);
            totalPrev += lines.length;
        } else {
            totalPrev += lines.length;
        }
    }

    // Change score = % of previous content that changed
    const changedLines = Math.max(added.length, removed.length);
    const baselineLines = totalPrev || 1;
    const changeScore = Math.min(100, Math.round((changedLines / baselineLines) * 100));

    return {
        added: added.slice(0, 200),   // cap to avoid huge payloads
        removed: removed.slice(0, 200),
        stats: {
            addedCount: added.length,
            removedCount: removed.length,
            totalLines: baselineLines,
        },
        changeScore,
        isFirstCheck: false,
    };
};

/**
 * Check if diff is significant enough to send to LLM.
 * Skip LLM if nothing changed or truly trivial (e.g., only 1 word changed).
 */
const isSignificantChange = (diffResult) => {
    if (diffResult.isFirstCheck) return false; // no need to summarize first snapshot
    const { addedCount, removedCount } = diffResult.stats;
    return addedCount + removedCount >= 3;
};

module.exports = { computeDiff, isSignificantChange };
