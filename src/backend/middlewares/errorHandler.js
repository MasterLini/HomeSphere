// middlewares/errorHandler.js
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
};
