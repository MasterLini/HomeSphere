const { ObjectId } = require('mongodb');
const { getDB, connectDB } = require('../db/connectDB');

let dbInitialized = false;

const initializeDatabase = async () => {
    if (dbInitialized) {
        console.log('[DEBUG] Database already initialized');
        return;
    }

    try {
        console.log('[DEBUG] Starting database initialization');
        // Ensure we're connected first
        const client = await connectDB();
        console.log('[DEBUG] Database connected, creating indexes...');

        const db = getDB();

        // Create unique compound index for todo lists
        await db.collection('lists').createIndex(
            { userId: 1, type: 1 },
            { 
                unique: true, 
                partialFilterExpression: { type: 'todolist' },
                name: 'unique_user_todolist'
            }
        );

        dbInitialized = true;
        console.log('[DEBUG] Database indexes created successfully');
    } catch (error) {
        console.error('[DEBUG] Error initializing database:', error);
        throw error;
    }
};

// Initialize database
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

const UserModel = require('../models/User');

const findUserByEmail = async (email) => {
    const db = getDB();
    return await db.collection('users').findOne({ 
        email: email.toLowerCase().trim() 
    });
};

const findUserByUsername = async (username) => {
    const db = getDB();
    return await db.collection('users').findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') }
    });
};

const findExistingUser = async (username, email) => {
    const db = getDB();
    return await db.collection('users').findOne({
        $or: [
            { username: { $regex: new RegExp(`^${username}$`, 'i') } },
            { email: email.toLowerCase() }
        ]
    });
};

const updateUser = async (userId, update) => {
    const db = getDB();
    return await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: update }
    );
};

const findById = async (collection, id) => {
    const db = getDB();
    return await db.collection(collection).findOne({ 
        _id: new ObjectId(id) 
    });
};

const updateById = async (collection, id, update) => {
    const db = getDB();
    return await db.collection(collection).updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
    );
};

const deleteById = async (collection, id) => {
    const db = getDB();
    return await db.collection(collection).deleteOne({ 
        _id: new ObjectId(id) 
    });
};

const find = async (collection, query = {}, options = {}) => {
    const db = getDB();
    return await db.collection(collection).find(query, options).toArray();
};

const insert = async (collection, document) => {
    const db = getDB();
    const result = await db.collection(collection).insertOne(document);
    return result;
};

const getAllUsers = async () => {
    const db = getDB();
    return await db.collection('users').find({}).toArray();
};

const getUsersByFamilyId = async (familyId) => {
    const db = getDB();
    return await db.collection('users').find({ 
        familyId: new ObjectId(familyId) 
    }).toArray();
};

const getUserById = async (userId) => {
    const db = getDB();
    return await db.collection('users').findOne({ 
        _id: new ObjectId(userId) 
    });
};

const updateUserById = async (userId, updateData) => {
    const db = getDB();
    const user = await getUserById(userId);
    if (!user) return null;

    if (updateData.password) {
        const userModel = new UserModel(user.username, user.email, updateData.password);
        await userModel.hashPassword();
        updateData.password = userModel.password;
    }

    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
    );

    return await getUserById(userId);
};

module.exports = {
    findUserByEmail,
    findUserByUsername,
    findExistingUser,
    updateUser,
    findById,
    updateById,
    deleteById,
    find,
    insert,
    getAllUsers,
    getUsersByFamilyId,
    getUserById,
    updateUserById,
    getDB
};
