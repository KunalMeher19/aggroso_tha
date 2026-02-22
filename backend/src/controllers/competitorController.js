const Competitor = require('../models/Competitor');
const logger = require('../utils/logger');

// GET /api/competitors
const getAll = async (req, res, next) => {
    try {
        const { tag } = req.query;
        const filter = tag ? { tags: tag } : {};
        const competitors = await Competitor.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: competitors });
    } catch (err) {
        next(err);
    }
};

// GET /api/competitors/:id
const getOne = async (req, res, next) => {
    try {
        const competitor = await Competitor.findById(req.params.id);
        if (!competitor) {
            return res.status(404).json({ success: false, message: 'Competitor not found' });
        }
        res.json({ success: true, data: competitor });
    } catch (err) {
        next(err);
    }
};

// POST /api/competitors
const create = async (req, res, next) => {
    try {
        const competitor = await Competitor.create(req.body);
        logger.info(`Competitor created: ${competitor.name}`);
        res.status(201).json({ success: true, data: competitor });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'Duplicate entry' });
        }
        next(err);
    }
};

// PUT /api/competitors/:id
const update = async (req, res, next) => {
    try {
        const competitor = await Competitor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!competitor) {
            return res.status(404).json({ success: false, message: 'Competitor not found' });
        }
        res.json({ success: true, data: competitor });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/competitors/:id
const remove = async (req, res, next) => {
    try {
        const competitor = await Competitor.findByIdAndDelete(req.params.id);
        if (!competitor) {
            return res.status(404).json({ success: false, message: 'Competitor not found' });
        }
        // Clean up snapshots and check results
        const Snapshot = require('../models/Snapshot');
        const CheckResult = require('../models/CheckResult');
        await Promise.all([
            Snapshot.deleteMany({ competitorId: req.params.id }),
            CheckResult.deleteMany({ competitorId: req.params.id }),
        ]);
        logger.info(`Competitor deleted: ${competitor.name}`);
        res.json({ success: true, message: 'Competitor and all its data deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAll, getOne, create, update, remove };
