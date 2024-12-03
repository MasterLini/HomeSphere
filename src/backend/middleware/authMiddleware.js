function authMiddleware(req, res, next) {
    const token = req.token;
    next();
}

module.exports = authMiddleware;