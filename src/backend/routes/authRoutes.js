// routes/authRoutes.js
import express from 'express';
import {
    register,
    login,
    verifyEmail,
    editProfile,
    requestPasswordReset,
    resetPassword,
    logout,
    getUserInfo, // Import getUserInfo
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.put('/edit', protect, editProfile);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', protect, logout);

// Add this new route:
router.get('/me', protect, getUserInfo);

export default router;
