// config/db.js
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/homesphere';
    try {
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info(`Connected to: ${conn.connection.host}`);
    } catch (error) {
        logger.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit process if connection fails
    }
};

export default connectDB;
