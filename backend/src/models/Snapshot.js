const mongoose = require('mongoose');

const snapshotSchema = new mongoose.Schema(
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
        rawContent: {
            type: String,
            default: '',
        },
        cleanedContent: {
            type: String,
            default: '',
        },
        contentHash: {
            type: String,
            default: '',
        },
        fetchStatus: {
            type: String,
            enum: ['success', 'failed', 'timeout', 'blocked'],
            default: 'success',
        },
        errorMessage: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Snapshot', snapshotSchema);
