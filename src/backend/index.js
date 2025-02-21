const dotenv = require('dotenv');
const { connectDB, getDB } = require('./db/connectDB');
const { info: logInfo, error: logError } = require('./utils/logger');
const { configureApp } = require('./app');
const { initializeSecurity, cleanup: cleanupSecurity } = require('./utils/securityInit');
const MongoStore = require('connect-mongo');

dotenv.config();
const port = process.env.PORT || 3000;

let sessionStore; // Move to global scope for cleanup access

// Cleanup handlers
const cleanup = async () => {
    logInfo('Starting server cleanup...');
    try {
        // Cleanup security features
        cleanupSecurity();
        logInfo('Security cleanup completed');

        // Close session store if it exists
        if (sessionStore) {
            await sessionStore.close();
            logInfo('Session store closed');
        }

        logInfo('Cleanup completed successfully');
    } catch (error) {
        logError('Cleanup failed:', error);
    }
    process.exit(0);
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        const db = getDB();

        // Configure session with MongoDB store
        logInfo('Configuring session store...');
        let sessionStore;
        try {
            sessionStore = MongoStore.create({
                client: db.client,
                dbName: process.env.DB_NAME || 'homesphere',
                collectionName: 'sessions',
                ttl: 24 * 60 * 60, // 1 day
                autoRemove: 'native',
                touchAfter: 24 * 3600, // 24 hours
                crypto: {
                    secret: process.env.SESSION_SECRET || 'session-secret'
                }
            });

            // Add store error handler
            sessionStore.on('error', (error) => {
                logError('Session store error:', error);
            });

            logInfo('Session store configured successfully');
        } catch (error) {
            logError('Failed to create session store:', error);
            throw error;
        }

        const sessionConfig = {
            secret: process.env.SESSION_SECRET || 'session-secret',
            name: 'sessionId',
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            }
        };

        // Configure and initialize app
        const app = configureApp(sessionConfig);
        await initializeSecurity(app, db);

        // Start server
        app.listen(port, () => {
            logInfo(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        logError('Failed to initialize app:', error);
        process.exit(1);
    }
};

startServer();
