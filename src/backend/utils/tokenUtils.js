const jwt = require('jsonwebtoken');

// Store blacklisted tokens
const tokenBlacklist = new Set();

const generateToken = (payload, isDevToken = false) => {
    const options = isDevToken ? {} : {
        expiresIn: '2h',
        issuer: 'HomeSphere',
        audience: 'HomeSphere-client'
    };
    
    return jwt.sign(payload, process.env.SECRET_KEY, options);
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
        return null;
    }
};

const blacklistToken = (token) => {
    tokenBlacklist.add(token);
};

const isTokenBlacklisted = (token) => {
    return tokenBlacklist.has(token);
};

const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
};

const createAuthMiddleware = () => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided',
                code: 'NO_TOKEN'
            });
        }

        if (isTokenBlacklisted(token)) {
            return res.status(401).json({ 
                message: 'Token has been invalidated',
                code: 'TOKEN_BLACKLISTED'
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ 
                message: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

        req.user = decoded;
        req.token = token;
        next();
    };
};

module.exports = {
    generateToken,
    verifyToken,
    blacklistToken,
    isTokenBlacklisted,
    extractTokenFromHeader,
    createAuthMiddleware
};