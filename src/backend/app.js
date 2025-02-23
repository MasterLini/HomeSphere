import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import shoppingRoutes from './routes/shoppingRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

connectDB();

// ✅ Load Swagger JSON using fs (Instead of Import)
let swaggerDocument;
try {
    const rawData = fs.readFileSync('./swagger-output.json');
    swaggerDocument = JSON.parse(rawData);
    console.log('✅ Swagger UI loaded successfully');
} catch (error) {
    console.error('❌ Error loading Swagger JSON:', error);
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/shopping', shoppingRoutes);

app.use(errorHandler);

export default app;
