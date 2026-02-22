const mongoose = require('mongoose');

const checkResultSchema = new mongoose.Schema(
    {
        competitorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Competitor',
            required: true,
            index: true,
        },
        urlType: {
            type: String,
            enum: ['pricing', 'docs', 'changelog'],
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        snapshotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Snapshot',
        },
        previousSnapshotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Snapshot',
        },
        diffData: {
            added: [String],
            removed: [String],
            stats: {
                addedCount: { type: Number, default: 0 },
                removedCount: { type: Number, default: 0 },
                totalLines: { type: Number, default: 0 },
            },
        },
        changeScore: {
            type: Number,
            default: 0, // percentage of content that changed
        },
        llmSummary: {
            type: String,
            default: '',
        },
        llmStatus: {
            type: String,
            enum: ['success', 'failed', 'skipped', 'no_changes'],
            default: 'skipped',
        },
        isFirstCheck: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Only keep last 5 results per competitor per urlType (enforced at app level)
checkResultSchema.index({ competitorId: 1, urlType: 1, createdAt: -1 });

module.exports = mongoose.model('CheckResult', checkResultSchema);
