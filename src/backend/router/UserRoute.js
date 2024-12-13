const express = require('express');
const router = express.Router();
const { getDB } = require('../db/connectDB');
const { ObjectId } = require('mongodb'); // Add this line

// Get user info
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const db = getDB(process.env.DB_NAME);
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error retrieving user info:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Edit user info
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email } = req.body;
        const db = getDB(process.env.DB_NAME);
        const updateFields = {};

        if (username) updateFields.username = username;
        if (email) updateFields.email = email;

        await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: updateFields });
        res.status(200).json({ message: 'User info updated successfully' });
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;