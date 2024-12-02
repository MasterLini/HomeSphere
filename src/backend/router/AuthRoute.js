const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { getDB } = require('../db/connectDB');

const router = express.Router();

const tokenBlacklist = new Set();

const isTokenBlacklist = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: 'Token has been invalidated' });
    }
    req.token = token;
    next();
};

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email or password is required' });
        }

        const db  = getDB(process.env.DB_NAME);

        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {userId: user._id, username: user.username},
            process.env.SECRET_KEY,
            { expiresIn: '2h'}
        );

        res.status(200).json({ message: 'Successfully logged in!', token });

    }catch(err) {
        console.error('Error while loging in', err);
        res.status(500).json({ message: 'Server Error', error: err });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const db = getDB(process.env.DB_NAME);
        const existingUser = await db.collection('users').findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const user = new User(username, email, password);
        await user.hashPassword();

        const result = await db.collection('users').insertOne(user);

        res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/logout', async (req, res) => {
    const token = req.token;
    tokenBlacklist.add(token);
    res.status(200).json({ message: 'User logged out!' });
})

module.exports = router;
