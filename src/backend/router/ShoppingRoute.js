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
    deleteById,
    getDB
} = require('../utils/dbUtils');

const router = express.Router();
const authMiddleware = createAuthMiddleware();

// Get all shopping lists for the authenticated user
router.get('/lists', authMiddleware, async (req, res) => {
    try {
        console.log('[DEBUG] Fetching shopping lists for user:', req.user.userId);
        const lists = await find('lists', { 
            userId: new ObjectId(req.user.userId),
            type: 'shoppinglist'
        });
        sendSuccess(res, lists);
    } catch (error) {
        console.error('[DEBUG] Error fetching shopping lists:', error);
        sendServerError(res, error);
    }
});

// Create a new shopping list
router.post('/lists', authMiddleware, async (req, res) => {
    try {
        const { type, items = [] } = req.body;
        console.log('[DEBUG] Creating shopping list:', { type, itemCount: items.length });

        if (!type) {
            return sendValidationError(res, 'List type is required');
        }

        const db = getDB();
        
        // Create unique compound index if it doesn't exist
        await db.collection('lists').createIndex(
            { userId: 1, type: 1 },
            { 
                unique: true, 
                partialFilterExpression: { type: 'shoppinglist' },
                name: 'unique_user_shoppinglist'
            }
        );

        const newList = {
            userId: new ObjectId(req.user.userId),
            type,
            items,
            createdAt: new Date()
        };

        const result = await insert('lists', newList);
        console.log('[DEBUG] Created shopping list:', result.insertedId);
        
        const createdList = await findById('lists', result.insertedId);
        sendSuccess(res, createdList);
    } catch (error) {
        console.error('[DEBUG] Error creating shopping list:', error);
        if (error.code === 11000) {
            return sendValidationError(res, 'User already has a shopping list');
        }
        sendServerError(res, error);
    }
});

// Update a shopping list
router.put('/lists/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, items } = req.body;
        console.log('[DEBUG] Updating shopping list:', { id, itemCount: items?.length });

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
        console.error('[DEBUG] Error updating shopping list:', error);
        sendServerError(res, error);
    }
});

// Delete a shopping list
router.delete('/lists/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[DEBUG] Deleting shopping list:', id);

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
        console.error('[DEBUG] Error deleting shopping list:', error);
        sendServerError(res, error);
    }
});

// Add item to shopping list
router.post('/lists/:id/items', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const item = req.body;
        console.log('[DEBUG] Adding item to shopping list:', { listId: id, item });

        if (!ObjectId.isValid(id)) {
            return sendValidationError(res, 'Invalid list ID');
        }

        const list = await findById('lists', id);
        if (!list) {
            return sendNotFoundError(res, 'List not found');
        }

        if (list.userId.toString() !== req.user.userId) {
            return sendValidationError(res, 'You can only modify your own lists');
        }

        const updatedItems = [...(list.items || []), { ...item, id: new ObjectId() }];
        await updateById('lists', id, { items: updatedItems });
        
        const updatedList = await findById('lists', id);
        sendSuccess(res, updatedList);
    } catch (error) {
        console.error('[DEBUG] Error adding item to shopping list:', error);
        sendServerError(res, error);
    }
});

// Update item in shopping list
router.put('/lists/:listId/items/:itemId', authMiddleware, async (req, res) => {
    try {
        const { listId, itemId } = req.params;
        const itemData = req.body;
        console.log('[DEBUG] Updating item in shopping list:', { listId, itemId, itemData });

        if (!ObjectId.isValid(listId)) {
            return sendValidationError(res, 'Invalid list ID');
        }

        const list = await findById('lists', listId);
        if (!list) {
            return sendNotFoundError(res, 'List not found');
        }

        if (list.userId.toString() !== req.user.userId) {
            return sendValidationError(res, 'You can only modify your own lists');
        }

        const updatedItems = list.items.map(item => 
            item.id.toString() === itemId ? { ...item, ...itemData } : item
        );

        await updateById('lists', listId, { items: updatedItems });
        const updatedList = await findById('lists', listId);
        sendSuccess(res, updatedList);
    } catch (error) {
        console.error('[DEBUG] Error updating item in shopping list:', error);
        sendServerError(res, error);
    }
});

// Delete item from shopping list
router.delete('/lists/:listId/items/:itemId', authMiddleware, async (req, res) => {
    try {
        const { listId, itemId } = req.params;
        console.log('[DEBUG] Deleting item from shopping list:', { listId, itemId });

        if (!ObjectId.isValid(listId)) {
            return sendValidationError(res, 'Invalid list ID');
        }

        const list = await findById('lists', listId);
        if (!list) {
            return sendNotFoundError(res, 'List not found');
        }

        if (list.userId.toString() !== req.user.userId) {
            return sendValidationError(res, 'You can only modify your own lists');
        }

        const updatedItems = list.items.filter(item => item.id.toString() !== itemId);
        await updateById('lists', listId, { items: updatedItems });
        
        const updatedList = await findById('lists', listId);
        sendSuccess(res, updatedList);
    } catch (error) {
        console.error('[DEBUG] Error deleting item from shopping list:', error);
        sendServerError(res, error);
    }
});

module.exports = router;