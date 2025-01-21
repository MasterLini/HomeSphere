const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB, getDB } = require('./db/connectDB');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const authRoute = require('./router/AuthRoute');
const docRoute = require('./router/DocRoute');
const listRoute = require('./router/ListRoute');
const familyRoute = require('./router/FamilyRoute');
const { logRoutes } = require('./utils/routeLogger');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(loggerMiddleware);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const registerRoutes = (app) => {
    authRoute.routerName = 'auth';
    docRoute.routerName = 'docs';
    listRoute.routerName = 'lists';
    familyRoute.routerName = 'family';

    app.use('/auth', authRoute);
    app.use('/docs', docRoute);
    app.use('/lists', listRoute);
    app.use('/family', familyRoute);

    app.get('/protected-route', authMiddleware, (req, res) => {
        res.status(200).json({ message: `Welcome, ${req.user.username}`, user: req.user });
    });
};

const startServer = async () => {
    try {
        await connectDB();
        registerRoutes(app);

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
            console.log('Registered Routes:');
            logRoutes(app);
        });
    } catch (error) {
        console.error('Failed to initialize app:', error.message);
        process.exit(1);
    }
};

startServer();
