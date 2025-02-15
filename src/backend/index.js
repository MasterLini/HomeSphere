const dotenv = require('dotenv');
const { connectDB } = require('./db/connectDB');
const { info: logInfo, error: logError } = require('./utils/logger');
const app = require('./app');

dotenv.config();
const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(port, () => {
            logInfo(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        logError('Failed to initialize app:', error);
        process.exit(1);
    }
};

startServer();
