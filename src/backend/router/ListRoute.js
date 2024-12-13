const express = require('express');
const router = express.Router();
const { getDB } = require('../db/connectDB');
const List = require('../models/List');

router.post('/', async (req, res) => {
    try {
        const { userId, type, items } = req.body;
        if (!type || !['todo', 'shopping'].includes(type)) {
            return res.status(400).json({ message: 'List type must be either todo or shopping' });
        }

        const db = getDB(process.env.DB_NAME);
        const newList = new List(userId, type, items);
        await db.collection('lists').insertOne(newList);
        res.status(201).json({ message: 'List created successfully', list: newList });
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { type } = req.query;
        const db = getDB(process.env.DB_NAME);
        const query = { userId };
        if (type) {
            query.type = type;
        }
        const lists = await db.collection('lists').find(query).toArray();
        res.status(200).json(lists);
    } catch (error) {
        console.error('Error retrieving lists:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:listId', async (req, res) => {
    try {
        const { listId } = req.params;
        const { items } = req.body;
        const db = getDB(process.env.DB_NAME);
        await db.collection('lists').updateOne({ _id: new ObjectId(listId) }, { $set: { items } });
        res.status(200).json({ message: 'List updated successfully' });
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:listId', async (req, res) => {
    try {
        const { listId } = req.params;
        const db = getDB(process.env.DB_NAME);
        await db.collection('lists').deleteOne({ _id: new ObjectId(listId) });
        res.status(200).json({ message: 'List deleted successfully' });
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;