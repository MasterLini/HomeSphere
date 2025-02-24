// server.js
import app from './app.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
dotenv.config(); // MUST be at the very top

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
