const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Competitor name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        urls: {
            pricing: { type: String, default: '' },
            docs: { type: String, default: '' },
            changelog: { type: String, default: '' },
        },
        tags: {
            type: [String],
            default: [],
        },
        alertEmail: {
            type: String,
            default: '',
        },
        alertOnChangeScore: {
            type: Number,
            default: 0, // 0 = no alert; >0 = alert when changeScore exceeds this %
        },
        lastCheckedAt: {
            type: Date,
            default: null,
        },
        lastChangeScore: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Competitor', competitorSchema);
