const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const Joi = require('joi');

dotenv.config();

let client;

const configSchema = Joi.object({
    MONGO_URI: Joi.string().uri().required(),
    DB_NAME: Joi.string().required(),
}).unknown();

const { error } = configSchema.validate(process.env);
if (error) {
    console.error('Config validation error:', error.message);
    process.exit(1);
}

const connectDB = async () => {
    if (client) {
        console.log('Reusing existing database connection...');
        return client;
    }

    try {
        console.log('Establishing a new database connection...');
        client = new MongoClient(process.env.MONGO_URI, { connectTimeoutMS: 30000, useUnifiedTopology: true });
        await client.connect();
        console.log('Database connection established.');
        return client;
    } catch (error) {
        console.error('Failed to connect to the database:', error.message);
        // Implement retry mechanism or notify system here
        process.exit(1);
    }
};

const getDB = () => {
    if (!client) {
        throw new Error('Database connection not established. Call connectDB first.');
    }
    const dbName = process.env.DB_NAME;
    return client.db(dbName);
};

const disconnectDB = async () => {
    if (client) {
        await client.close();
        console.log('Database connection closed.');
    }
};

module.exports = { connectDB, getDB, disconnectDB };