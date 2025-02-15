const express = require('express');
const { ObjectId } = require('mongodb');
const { createAuthMiddleware } = require('../utils/tokenUtils');
const {
    sendSuccess,
    sendValidationError,
    sendNotFoundError,
    sendServerError
} = require('../utils/responseUtils');
const {
    find,
    findById,
    insert,
    updateById,
    deleteById
} = require('../utils/dbUtils');

const router = express.Router();
const authMiddleware = createAuthMiddleware();

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const db = getDB();
        if (!db) {
            console.error('[DEBUG] Database not initialized in health check');
            return sendServerError(res, new Error('Database not initialized'));
        }

        // Try to ping the database
        await db.command({ ping: 1 });

        sendSuccess(res, {
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[DEBUG] Health check failed:', error);
        sendServerError(res, new Error('Service health check failed'));
    }
});

// Get all todo lists for the authenticated user
router.get('/lists', authMiddleware, async (req, res) => {
    try {
        const lists = await find('lists', { 
            userId: new ObjectId(req.user.userId),
            type: 'todolist'
        });
        sendSuccess(res, lists);
    } catch (error) {
        sendServerError(res, error);
    }
});

// Create a new todo list
router.post('/lists', authMiddleware, async (req, res) => {
    try {
        console.log('[DEBUG] Creating new todo list, body:', req.body);
        const { type, items = [] } = req.body;

        if (!type) {
            console.log('[DEBUG] List type missing in request');
            return sendValidationError(res, 'List type is required');
        }

        const db = getDB();
        if (!db) {
            console.error('[DEBUG] Database not initialized');
            return sendServerError(res, new Error('Database not initialized'));
        }

        console.log('[DEBUG] Checking for existing todo list');
        // Use findOne for atomicity and add index check
        const existingList = await db.collection('lists').findOne({
            userId: new ObjectId(req.user.userId),
            type: 'todolist'
        });

        console.log('[DEBUG] Checking for existing todo list:', {
            userId: req.user.userId,
            existingList: existingList?._id
        });

        if (existingList) {
            console.log('[DEBUG] User already has a todo list:', existingList._id);
            return sendValidationError(res, 'User already has a todo list');
        }

        // Create unique compound index if it doesn't exist
        await db.collection('lists').createIndex(
            { userId: 1, type: 1 },
            { unique: true, partialFilterExpression: { type: 'todolist' } }
        );

        const newList = {
            userId: new ObjectId(req.user.userId),
            type,
            items,
            createdAt: new Date()
        };

        // Try to create the list with retries
        let result;
        let retries = 3;
        while (retries > 0) {
            try {
                result = await db.collection('lists').insertOne(newList);
                console.log('[DEBUG] Created new list:', result.insertedId);
                break;
            } catch (insertError) {
                retries--;
                if (insertError.code === 11000 || retries === 0) {
                    throw insertError;
                }
                console.log(`[DEBUG] Retry creating list, attempts left: ${retries}`);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        if (!result) {
            throw new Error('Failed to create todo list after retries');
        }

        const createdList = await findById('lists', result.insertedId);
        if (!createdList) {
            console.error('[DEBUG] List created but not found on verification');
            throw new Error('List creation verification failed');
        }

        console.log('[DEBUG] Successfully created and verified list:', createdList._id);
        sendSuccess(res, createdList);
    } catch (error) {
        console.error('[DEBUG] Error in create todo list:', {
            error: error.message,
            code: error.code,
            stack: error.stack
        });

        // Handle specific error cases
        if (error.code === 11000) {
            console.log('[DEBUG] Duplicate todo list attempt caught by index');
            return sendValidationError(res, 'User already has a todo list');
        }

        if (error.message.includes('verification failed')) {
            return sendServerError(res, new Error('Failed to verify list creation. Please try again.'));
        }

        if (error.message.includes('not initialized')) {
            return sendServerError(res, new Error('Service temporarily unavailable. Please try again.'));
        }

        // Generic error with more details in debug mode
        const errorMessage = process.env.NODE_ENV === 'development' 
            ? `Failed to create todo list: ${error.message}`
            : 'Failed to create todo list. Please try again.';

        sendServerError(res, new Error(errorMessage));
    }
});

// Update a todo list
router.put('/lists/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, items } = req.body;

        if (!ObjectId.isValid(id)) {
            return sendValidationError(res, 'Invalid list ID');
        }

        const list = await findById('lists', id);
        if (!list) {
            return sendNotFoundError(res, 'List not found');
        }

        if (list.userId.toString() !== req.user.userId) {
            return sendValidationError(res, 'You can only update your own lists');
        }

        const updateData = {
            type: type || list.type,
            items: items || list.items,
            updatedAt: new Date()
        };

        await updateById('lists', id, updateData);
        const updatedList = await findById('lists', id);
        sendSuccess(res, updatedList);
    } catch (error) {
        sendServerError(res, error);
    }
});

// Delete a todo list
router.delete('/lists/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return sendValidationError(res, 'Invalid list ID');
        }

        const list = await findById('lists', id);
        if (!list) {
            return sendNotFoundError(res, 'List not found');
        }

        if (list.userId.toString() !== req.user.userId) {
            return sendValidationError(res, 'You can only delete your own lists');
        }

        await deleteById('lists', id);
        sendSuccess(res, { message: 'List deleted successfully' });
    } catch (error) {
        sendServerError(res, error);
    }
});

module.exports = router;
