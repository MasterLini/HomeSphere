const jwt = require('jsonwebtoken');
const { getDB } = require('../db/connectDB');
const { ObjectId } = require('mongodb');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.warn('Authorization header is missing');
            return res.status(401).json({ message: 'Authorization header is missing' });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;
        if (!token) {
            console.warn('Token is missing');
            return res.status(401).json({ message: 'Token is missing' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const db = getDB();
        const cacheKey = `user_${decoded.userId}`;
        // Implement caching logic here (e.g., Redis)

        const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });

        if (!user) {
            console.warn(`User not found for ID: ${decoded.userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = authMiddleware;