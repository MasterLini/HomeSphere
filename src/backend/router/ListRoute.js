const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const List = require('../models/List');
const { getDB } = require('../db/connectDB');

// POST: Create a new list
router.post('/', async (req, res) => {
    const { userId, type, items } = req.body;

    try {
        const db = getDB();
        const processedItems = items.map(item => ({
            ...item,
            id: new ObjectId(),
            date: item.date ? new Date(item.date) : undefined,
            responsibilities: item.responsibilities || new ObjectId(userId),
        }));

        const result = await db.collection('lists').insertOne({
            userId: new ObjectId(userId),
            type,
            items: processedItems,
            createdAt: new Date(),
        });

        res.status(201).json({ message: 'List created successfully', listId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the list.' });
    }
});

// GET: Retrieve lists
router.get('/', async (req, res) => {
    const { userId, type } = req.query;

    try {
        const db = getDB();
        const query = {};

        if (userId) query.userId = new ObjectId(userId);
        if (type) query.type = type;

        const lists = await db.collection('lists').find(query).toArray();
        res.status(200).json(lists);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving the lists.' });
    }
});

// PATCH: Update a list or its items
router.patch('/:listId', async (req, res) => {
    const { listId } = req.params;
    const { type, items, userId } = req.body;

    try {
        const db = getDB();
        const list = await db.collection('lists').findOne({ _id: new ObjectId(listId) });

        if (!list) {
            return res.status(404).json({ error: 'List not found.' });
        }

        const updates = {};

        if (type) {
            if (!['todolist', 'shoppinglist'].includes(type)) {
                return res.status(400).json({ error: 'Invalid list type.' });
            }
            updates.type = type;
        }

        if (items && Array.isArray(items)) {
            items.forEach(update => {
                const itemIndex = list.items.findIndex(item => item.id.toString() === update.id);
                if (itemIndex !== -1) {
                    const item = list.items[itemIndex];
                    if (list.type === 'todolist') {
                        if (update.text) item.text = update.text;
                        if (update.description) item.description = update.description;
                        if (update.date) item.date = new Date(update.date);
                        item    .responsibilities = update.responsibilities || new ObjectId(userId || list.userId);
                    } else if (list.type === 'shoppinglist') {
                        if (update.productName) item.productName = update.productName;
                        if (update.quantity != null) item.quantity = update.quantity;
                    }
                }
            });

            updates.items = list.items;
        }

        await db.collection('lists').updateOne({ _id: new ObjectId(listId) }, { $set: updates });
        res.status(200).json({ message: 'List updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the list.' });
    }
});

// DELETE: Remove a list or specific items from a list
router.delete('/:listId', async (req, res) => {
    const { listId } = req.params;
    const { itemId } = req.body;

    try {
        const db = getDB();

        if (itemId) {
            const list = await db.collection('lists').findOne({ _id: new ObjectId(listId) });
            if (!list) {
                return res.status(404).json({ error: 'List not found.' });
            }

            const updatedItems = list.items.filter(item => item.id.toString() !== itemId);
            await db.collection('lists').updateOne({ _id: new ObjectId(listId) }, { $set: { items: updatedItems } });
            res.status(200).json({ message: 'Item removed successfully.' });
        } else {
            await db.collection('lists').deleteOne({ _id: new ObjectId(listId) });
            res.status(200).json({ message: 'List removed successfully.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the list.' });
    }
});

module.exports = router;