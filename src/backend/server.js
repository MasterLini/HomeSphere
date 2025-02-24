// server.js
import app from './app.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
dotenv.config(); // MUST be at the very top

console.log({
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS ? 'exists' : 'missing'
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
