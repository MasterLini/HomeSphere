const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const { connectDB, getDB } = require('./db/connectDB');
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

        // Get the database instance
        const db = getDB(process.env.DB_NAME);

        app.post('/add-data', async (req, res) => {
            try {
                const { name, age } = req.body;

                if (!name || !age) {
                    return res.status(400).json({ message: 'Name and age are required' });
                }

                const result = await db.collection('test').insertOne({ name, age, createdAt: new Date() });

                res.status(201).json({ message: 'Data added successfully', insertedId: result.insertedId });
            } catch (err) {
                console.error('Error adding data:', err);
                res.status(500).json({ message: `Error adding data: ${err.message}` });
            }
        });

        // Define routes that use the database
        app.get('/data', async (req, res) => {
            try {
                const collection = db.collection('test'); // Access collection
                const data = await collection.find({}).toArray(); // Fetch data
                res.json(data);
            } catch (err) {
                console.error('Error fetching data:', err);
                res.status(500).json({ message: `Error fetching data: ${err.message}` });
            }
        });

        // Static files and middleware
        app.use(express.static(path.join(__dirname, 'public')));

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
