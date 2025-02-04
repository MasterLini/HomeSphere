// src/backend/middleware/getUserIdByToken.js
const jwt = require('jsonwebtoken');

const getUserIdByToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || !tokenParts[1]) {
        return res.status(401).json({ error: 'Unauthorized: Bearer token missing or malformed' });
    }
    const token = tokenParts[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = getUserIdByToken;