const mongoose = require('mongoose');
const { testLLMConnection } = require('../services/llmService');
const logger = require('../utils/logger');

// GET /api/status
const getStatus = async (req, res) => {
    const startTime = Date.now();

    // 1. Backend health (always ok if we got here)
    const backend = { status: 'ok', uptime: Math.floor(process.uptime()) };

    // 2. Database health
    let database = { status: 'unknown' };
    try {
        const dbState = mongoose.connection.readyState;
        // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        if (dbState === 1) {
            await mongoose.connection.db.admin().ping();
            database = { status: 'ok', message: 'Connected' };
        } else {
            database = { status: 'error', message: `DB state: ${dbState}` };
        }
    } catch (err) {
        logger.warn(`DB health check failed: ${err.message}`);
        database = { status: 'error', message: err.message };
    }

    // 3. LLM health
    let llm = { status: 'unknown' };
    try {
        const result = await testLLMConnection();
        llm = result.ok
            ? { status: 'ok', message: 'Gemini 1.5-flash connected' }
            : { status: 'error', message: result.error };
    } catch (err) {
        llm = { status: 'error', message: err.message };
    }

    const responseTime = Date.now() - startTime;
    const allOk = backend.status === 'ok' && database.status === 'ok' && llm.status === 'ok';

    res.status(allOk ? 200 : 207).json({
        success: true,
        overall: allOk ? 'ok' : 'degraded',
        responseTime: `${responseTime}ms`,
        services: { backend, database, llm },
        checkedAt: new Date().toISOString(),
    });
};

module.exports = { getStatus };
