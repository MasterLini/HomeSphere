// routes/authRoutes.js
import express from 'express';
import {
    register,
    login,
    verifyEmail,
    editProfile,
    requestPasswordReset,
    resetPassword,
    logout, // Import logout
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Email verification
router.get('/verify-email/:token', verifyEmail);

// Edit profile (protected route)
router.put('/edit', protect, editProfile);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Reset password with token
router.post('/reset-password/:token', resetPassword);

// Logout (protected route, to confirm user identity)
router.post('/logout', protect, logout);

export default router;
