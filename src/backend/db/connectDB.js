const { MongoClient } = require('mongodb');

let client;

const connectDB = async () => {
    if (client) {
        console.log('Reusing existing database connection...');
        return client;
    }

    try {
        console.log('Establishing a new database connection...');
        client = new MongoClient(process.env.MONGO_URI, { connectTimeoutMS: 30000 });
        await client.connect();
        console.log('Database connection established.');
        return client;
    } catch (error) {
        console.error('Failed to connect to the database:', error.message);
        process.exit(1);
    }
};

const getDB = () => {
    if (!client) {
        throw new Error('Database connection not established. Call connectDB first.');
    }
    const dbName = process.env.DB_NAME || 'homesphere';
    return client.db(dbName);
};

module.exports = { connectDB, getDB };
