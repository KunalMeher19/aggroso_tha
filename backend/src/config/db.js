const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set');
    }

    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        logger.error(`MongoDB connection error: ${err.message}`);
        throw err;
    }
};

module.exports = connectDB;
