// src/backend/router/UserRoute.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const UserModel = require('../models/User');
const { getDB } = require('../db/connectDB');
const getUserIdByToken = require('../middleware/getUserIdByToken');
const authMiddleware = require('../middleware/authMiddleware');


// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get users by family ID
router.get('/family/:familyId', async (req, res) => {
    const { familyId } = req.params;

    try {
        const users = await getUsersByFamilyId(familyId);
        res.status(200).json(users);
    } catch (error) {
        console.error('Error getting users by family ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get authenticated user info using token
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const db = getDB();
        // Use the 'id' property from req.user (set in auth middleware)
        const { id } = req.user;
        if (!id) {
            return res.status(401).json({ error: 'No authenticated user found' });
        }
        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Edit user by token
router.put('/me', getUserIdByToken, async (req, res) => {
    const userId = req.userId;
    const { username, email, password, familyId } = req.body;

    try {
        const updatedUser = await updateUserById(userId, { username, email, password, familyId });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function getAllUsers() {
    const userCollection = getDB().collection('users');
    try {
        const users = await userCollection.find({}).toArray();
        return users;
    } catch (error) {
        console.error('Error retrieving users from database:', error);
        throw error;
    }
}

async function getUsersByFamilyId(familyId) {
    const userCollection = getDB().collection('users');
    try {
        const users = await userCollection.find({ familyId: new ObjectId(familyId) }).toArray();
        return users;
    } catch (error) {
        console.error('Error retrieving users by family ID from database:', error);
        throw error;
    }
}

async function getUserById(userId) {
    const userCollection = getDB().collection('users');
    try {
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });
        return user;
    } catch (error) {
        console.error('Error retrieving user from database:', error);
        throw error;
    }
}

async function updateUserById(userId, updateData) {
    const userCollection = getDB().collection('users');
    try {
        const user = await userCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) return null;

        if (updateData.password) {
            const userModel = new UserModel(user.username, user.email, updateData.password);
            await userModel.hashPassword();
            updateData.password = userModel.password;
        }

        await userCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        return await userCollection.findOne({ _id: new ObjectId(userId) });
    } catch (error) {
        console.error('Error updating user in database:', error);
        throw error;
    }
}

module.exports = router;