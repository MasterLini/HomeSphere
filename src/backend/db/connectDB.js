require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI; // Load URI from environment variables
let client; // MongoDB client instance

const connectDB = async () => {
    if (client) {
        console.log('Reusing existing database connection...');
        return client;
    }

    try {
        console.log('Establishing a new database connection...');
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Database connection established.');
        return client;
    } catch (error) {
        console.error('Failed to connect to the database:', error.message);
        process.exit(1);
    }
};

const getDB = (dbName) => {
    if (!client) {
        throw new Error('Database connection not established. Call connectDB first.');
    }
    return client.db(dbName);
};

module.exports = { connectDB, getDB };