// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        logger.warn('No token provided in request.');
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            logger.warn(`User not found for token: ${decoded.id}`);
            return res.status(401).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        logger.error('Token verification failed:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
