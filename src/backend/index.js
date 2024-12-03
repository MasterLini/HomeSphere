const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const { connectDB, getDB } = require('./db/connectDB');
const authMiddleware = require('./middleware/authMiddleware');
const authRoute = require('./router/AuthRoute');
const docRoute = require('./router/DocRoute');

const app = express();
const port = 3000;

app.use(loggerMiddleware);

app.use(bodyParser.json());

(async () => {
    try {
        // Connect to the database
        await connectDB();
        const db = getDB();
        app.use(express.static(path.join(__dirname, 'public')));

        app.get('/protected-route', authMiddleware, (req, res) => {
            res.status(200).json({ message: `Welcome, ${req.user.username}`, user: req.user });
        });
        // Routes
        app.use('/auth', authRoute);
        app.use('/docs', docRoute);

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to initialize app:', error.message);
        process.exit(1);
    }
})();
