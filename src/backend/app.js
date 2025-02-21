const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { requestLogger, error: logError } = require('./utils/logger');
const { createAuthMiddleware } = require('./utils/tokenUtils');
const { sendServerError } = require('./utils/responseUtils');
const csrf = require('csurf');
const authRoute = require('./router/AuthRoute');

// Create CSRF protection middleware
const csrfProtection = csrf({
    cookie: {
        key: '_csrf',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    }
});

// Function to configure the application
const configureApp = (sessionConfig) => {
    const app = express();

    // Basic middleware setup
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:8080',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cookie']
    }));

    // Request parsing middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));

    // Session and security middleware
    app.use(session(sessionConfig));
    app.use(csrfProtection);

    // CSRF token endpoint
    app.get('/csrf-token', (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken(), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
        res.json({ csrfToken: req.csrfToken() });
    });

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

    return app;
};

// Create default app instance
const app = configureApp({
    secret: process.env.SESSION_SECRET || 'session-secret',
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
});

module.exports = { app, configureApp };
