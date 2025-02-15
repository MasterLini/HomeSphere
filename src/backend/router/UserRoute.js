const express = require('express');
const router = express.Router();
const { 
    getAllUsers,
    getUsersByFamilyId,
    getUserById,
    updateUserById 
} = require('../utils/dbUtils');
const { 
    sendSuccess,
    sendServerError,
    sendNotFoundError,
    sendValidationError 
} = require('../utils/responseUtils');
const { isValidObjectId } = require('../utils/validationUtils');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await getAllUsers();
        sendSuccess(res, users);
    } catch (error) {
        sendServerError(res, error);
    }
});

// Get users by family ID
router.get('/family/:familyId', async (req, res) => {
    const { familyId } = req.params;

    if (!isValidObjectId(familyId)) {
        return sendValidationError(res, 'Invalid family ID format');
    }

    try {
        const users = await getUsersByFamilyId(familyId);
        sendSuccess(res, users);
    } catch (error) {
        sendServerError(res, error);
    }
});

// Get authenticated user info
router.get('/me', async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await getUserById(userId);

        if (!user) {
            return sendNotFoundError(res, 'User not found');
        }

        sendSuccess(res, user);
    } catch (error) {
        sendServerError(res, error);
    }
});

// Update authenticated user
router.put('/me', async (req, res) => {
    try {
        const { userId } = req.user;
        const { username, email, password, familyId } = req.body;

        if (familyId && !isValidObjectId(familyId)) {
            return sendValidationError(res, 'Invalid family ID format');
        }

        const updatedUser = await updateUserById(userId, { 
            username, 
            email, 
            password, 
            familyId: familyId ? new ObjectId(familyId) : undefined 
        });

        if (!updatedUser) {
            return sendNotFoundError(res, 'User not found');
        }

        sendSuccess(res, updatedUser);
    } catch (error) {
        sendServerError(res, error);
    }
});

// Search users
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        const users = await getAllUsers();
        const filteredUsers = users.filter(user => 
            user.username.toLowerCase().includes(q.toLowerCase()) ||
            (user.name && user.name.toLowerCase().includes(q.toLowerCase()))
        );
        sendSuccess(res, filteredUsers);
    } catch (error) {
        sendServerError(res, error);
    }
});

// Update user password
router.put('/me/password', async (req, res) => {
    try {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendValidationError(res, 'Both current and new passwords are required');
        }

        const user = await getUserById(userId);
        if (!user) {
            return sendNotFoundError(res, 'User not found');
        }

        // Add password validation logic here
        const updatedUser = await updateUserById(userId, { password: newPassword });
        sendSuccess(res, { message: 'Password updated successfully' });
    } catch (error) {
        sendServerError(res, error);
    }
});

// Upload profile image
router.post('/me/profile-image', async (req, res) => {
    try {
        const { userId } = req.user;
        if (!req.files || !req.files.image) {
            return sendValidationError(res, 'No image file uploaded');
        }

        const imageFile = req.files.image;
        const uploadPath = `uploads/profile-images/${userId}_${Date.now()}_${imageFile.name}`;

        await imageFile.mv(uploadPath);
        const updatedUser = await updateUserById(userId, { profileImage: uploadPath });

        sendSuccess(res, { 
            message: 'Profile image uploaded successfully',
            imageUrl: uploadPath 
        });
    } catch (error) {
        sendServerError(res, error);
    }
});

module.exports = router;
