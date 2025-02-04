const jwt = require('jsonwebtoken');
const { getDB } = require('../db/connectDB');
const { ObjectId } = require('mongodb');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('Authorization header missing');
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.warn('Token is missing');
            return res.status(401).json({ message: 'Token is missing' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log('Token verified successfully:', decoded);

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
            console.error('Token verification error:', error.message);
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = authMiddleware;