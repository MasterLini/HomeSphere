const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const Joi = require('joi');

dotenv.config();

let client;

const configSchema = Joi.object({
    MONGO_URI: Joi.string().uri().required(),
    DB_NAME: Joi.string().required(),
}).unknown();

const { value: config, error } = configSchema.validate(process.env, { abortEarly: false });
if (error) {
    console.error('Config validation error:', error.details.map(err => err.message).join(', '));
    process.exit(1);
}

const mongoOptions = {
    connectTimeoutMS: 30000,
    useUnifiedTopology: true,
};

const connectWithRetry = async (retries = 5, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log('Trying to establish a database connection...');
            client = new MongoClient(config.MONGO_URI, mongoOptions);
            await client.connect();
            console.log('Database connection established.');
            return client;
        } catch (error) {
            console.error(`Database connection attempt ${i + 1} failed: ${error.message}`);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const connectDB = async () => {
    if (client) {
        console.log('Reusing existing database connection...');
        return client;
    }
    return await connectWithRetry();
};

const getDB = () => {
    if (!client) {
        throw new Error('Database connection not established. Call connectDB first.');
    }
    return client.db(config.DB_NAME);
};

const disconnectDB = async () => {
    if (client) {
        await client.close();
        console.log('Database connection closed.');
    }
};

const setupShutdownHook = () => {
    process.on('SIGINT', async () => {
        console.log('SIGINT signal received: closing database connection...');
        await disconnectDB();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('SIGTERM signal received: closing database connection...');
        await disconnectDB();
        process.exit(0);
    });
};

setupShutdownHook();

module.exports = { connectDB, getDB, disconnectDB };
