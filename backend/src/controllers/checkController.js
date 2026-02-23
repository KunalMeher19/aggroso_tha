const Competitor = require('../models/Competitor');
const Snapshot = require('../models/Snapshot');
const CheckResult = require('../models/CheckResult');
const { scrapeUrl } = require('../services/scraper');
const { computeDiff, isSignificantChange } = require('../services/differ');
const { summarizeDiff } = require('../services/llmService');
const logger = require('../utils/logger');

const URL_TYPES = ['pricing', 'docs', 'changelog'];

/**
 * Run a check for a single URL type of a competitor.
 */
const checkUrlType = async (competitor, urlType) => {
    const url = competitor.urls[urlType];
    if (!url) return null;

    // 1. Scrape
    const scraped = await scrapeUrl(url);

    // 2. Get previous snapshot
    const prevSnapshot = await Snapshot.findOne({
        competitorId: competitor._id,
        urlType,
    }).sort({ createdAt: -1 });

    // 3. Save new snapshot
    const newSnapshot = await Snapshot.create({
        competitorId: competitor._id,
        urlType,
        url,
        rawContent: scraped.rawContent,
        cleanedContent: scraped.cleanedContent,
        contentHash: scraped.contentHash,
        fetchStatus: scraped.fetchStatus,
        errorMessage: scraped.errorMessage,
    });

    // 4. Compute diff
    const diffResult = computeDiff(
        prevSnapshot?.cleanedContent || null,
        scraped.cleanedContent
    );

    // 5. LLM summary (only if significant change and scraping succeeded)
    let llmSummary = '';
    let llmStatus = 'skipped';

    if (scraped.fetchStatus === 'success' && isSignificantChange(diffResult)) {
        const llmResult = await summarizeDiff(
            competitor.name,
            urlType,
            diffResult
        );
        llmSummary = llmResult.summary;
        llmStatus = llmResult.status;
    } else if (!isSignificantChange(diffResult) && !diffResult.isFirstCheck) {
        llmStatus = 'no_changes';
        llmSummary = 'No significant changes detected since last check.';
    }

    // 6. Save check result
    const checkResult = await CheckResult.create({
        competitorId: competitor._id,
        urlType,
        url,
        snapshotId: newSnapshot._id,
        previousSnapshotId: prevSnapshot?._id || null,
        diffData: {
            added: diffResult.added,
            removed: diffResult.removed,
            stats: diffResult.stats,
        },
        changeScore: diffResult.changeScore,
        llmSummary,
        llmStatus,
        isFirstCheck: diffResult.isFirstCheck,
    });

    // 7. Enforce max 5 results per competitor per urlType (keep latest 5)
    const allResults = await CheckResult.find({
        competitorId: competitor._id,
        urlType,
    }).sort({ createdAt: -1 });

    if (allResults.length > 5) {
        const toDelete = allResults.slice(5).map((r) => r._id);
        await CheckResult.deleteMany({ _id: { $in: toDelete } });
    }

    // Return the check result + a content preview for the dashboard modal
    const lines = scraped.cleanedContent ? scraped.cleanedContent.split('\n').filter(Boolean) : [];
    return {
        ...checkResult.toObject(),
        contentPreview: scraped.cleanedContent?.slice(0, 800) || '',
        lineCount: lines.length,
        fetchStatus: scraped.fetchStatus,
        errorMessage: scraped.errorMessage || '',
    };
};

// POST /api/competitors/:id/check
const checkNow = async (req, res, next) => {
    try {
        const competitor = await Competitor.findById(req.params.id);
        if (!competitor) {
            return res.status(404).json({ success: false, message: 'Competitor not found' });
        }

        const hasAnyUrl = URL_TYPES.some((t) => competitor.urls[t]);
        if (!hasAnyUrl) {
            return res.status(400).json({
                success: false,
                message: 'Competitor has no URLs configured',
            });
        }

        logger.info(`Starting check for ${competitor.name}`);

        // Run all URL type checks in parallel
        const results = await Promise.allSettled(
            URL_TYPES.map((t) => checkUrlType(competitor, t))
        );

        const checkResults = results
            .map((r, i) => ({
                urlType: URL_TYPES[i],
                status: r.status,
                data: r.status === 'fulfilled' ? r.value : null,
                error: r.status === 'rejected' ? r.reason?.message : null,
            }))
            .filter((r) => r.data !== null || r.status === 'rejected');

        // Update competitor's lastCheckedAt and max changeScore
        const maxScore = Math.max(
            0,
            ...checkResults
                .filter((r) => r.data)
                .map((r) => r.data.changeScore)
        );

        await Competitor.findByIdAndUpdate(competitor._id, {
            lastCheckedAt: new Date(),
            lastChangeScore: maxScore,
        });

        logger.info(`Check complete for ${competitor.name}. Max change score: ${maxScore}%`);

        res.json({
            success: true,
            message: `Check complete for ${competitor.name}`,
            data: checkResults,
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/competitors/:id/history
const getHistory = async (req, res, next) => {
    try {
        const { urlType } = req.query;
        const filter = {
            competitorId: req.params.id,
            ...(urlType ? { urlType } : {}),
        };

        const history = await CheckResult.find(filter)
            .sort({ createdAt: -1 })
            .limit(15) // up to 5 per urlType (3 types × 5 = 15 max)
            .populate('snapshotId', 'fetchStatus errorMessage createdAt')
            .lean();

        res.json({ success: true, data: history });
    } catch (err) {
        next(err);
    }
};

module.exports = { checkNow, getHistory };
