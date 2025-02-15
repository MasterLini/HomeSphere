const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { requestLogger, error: logError } = require('./utils/logger');
const { createAuthMiddleware } = require('./utils/tokenUtils');
const { sendServerError } = require('./utils/responseUtils');
const authRoute = require('./router/AuthRoute');

const app = express();

// Basic middleware
app.use(cors());
app.use(bodyParser.json());

// Logging middleware
app.use(requestLogger);

// Routes
const docRoute = require('./router/DocRoute');
const listRoute = require('./router/ListRoute');
const familyRoute = require('./router/FamilyRoute');
const userRoute = require('./router/UserRoute');
const shoppingRoute = require('./router/ShoppingRoute');
const todoRoute = require('./router/TodoRoute');

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Public routes
app.use('/auth', authRoute);
app.use('/docs', docRoute);

// Protected routes
const auth = createAuthMiddleware();
app.use('/lists', auth, listRoute);
app.use('/family', auth, familyRoute);
app.use('/users', auth, userRoute);
app.use('/todo', auth, todoRoute);
app.use('/shopping', auth, shoppingRoute);

// Protected route for testing
app.get('/protected-route', auth, (req, res) => {
    const { user } = req;
    res.status(200).json({ 
        message: `Welcome, ${user.username}`, 
        user 
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logError('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        requestId: req.requestId
    });
    sendServerError(res, err);
});

module.exports = app;
