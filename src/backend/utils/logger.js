const morgan = require('morgan');
const winston = require('winston');
const path = require('path');

// Configure winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ 
            filename: path.join(__dirname, '../logs/error.log'), 
            level: 'error'
        }),
        new winston.transports.File({ 
            filename: path.join(__dirname, '../logs/combined.log')
        })
    ]
});

// Add request context
const addRequestContext = (req, res, next) => {
    req.requestId = require('crypto').randomBytes(16).toString('hex');
    req.startTime = Date.now();
    next();
};

// Create HTTP request logger
const httpLogger = morgan((tokens, req, res) => {
    const logData = {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        responseTime: tokens['response-time'](req, res),
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: req.user ? req.user.id : undefined
    };

    // Log request body in development
    if (process.env.NODE_ENV === 'development' && req.method !== 'GET') {
        logData.body = req.body;
    }

    return JSON.stringify(logData);
}, { 
    stream: { 
        write: message => logger.info(message.trim()) 
    }
});

// Combine middleware
const requestLogger = [addRequestContext, httpLogger];

// Export logger functions
module.exports = {
    logger,
    requestLogger,
    error: (...args) => logger.error(...args),
    warn: (...args) => logger.warn(...args),
    info: (...args) => logger.info(...args),
    debug: (...args) => logger.debug(...args)
};