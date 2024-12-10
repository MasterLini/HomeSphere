const morgan = require('morgan');
const winston = require('winston');

// Konfigurieren Sie winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

// HTTP-Anfragenlogging mit morgan
const loggerMiddleware = morgan((tokens, req, res) => {
    return [
        `[${tokens.date(req, res)}]`,
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['response-time'](req, res), 'ms',
        `- ${req.ip}`,
        `- User-Agent: ${req.headers['user-agent']}`,
    ].join(' ');
}, { stream: { write: message => logger.info(message.trim()) } });

module.exports = loggerMiddleware;