const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const competitorRoutes = require('./routes/competitors');
const statusRoutes = require('./routes/status');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://aggroso-tha-backend.onrender.com', // live production
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // local frontend
];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS: origin ${origin} not allowed`));
            }
        },
        credentials: true,
    })
);

// Body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limit
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 min
        max: 200,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// Request logger
app.use((req, _res, next) => {
    logger.debug(`→ ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/competitors', competitorRoutes);
app.use('/api/status', statusRoutes);

// Serve built frontend static files
app.use(express.static(path.join(__dirname, '../public')));
app.get('*name', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check (lightweight, no DB)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
