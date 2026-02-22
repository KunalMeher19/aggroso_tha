const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
    getAll,
    getOne,
    create,
    update,
    remove,
} = require('../controllers/competitorController');
const { checkNow, getHistory } = require('../controllers/checkController');
const { validate, createCompetitorSchema, updateCompetitorSchema } = require('../middleware/validate');

// Rate limit "Check Now" to 10 requests per minute per IP
const checkLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many check requests. Please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', validate(createCompetitorSchema), create);
router.put('/:id', validate(updateCompetitorSchema), update);
router.delete('/:id', remove);
router.post('/:id/check', checkLimiter, checkNow);
router.get('/:id/history', getHistory);

module.exports = router;
