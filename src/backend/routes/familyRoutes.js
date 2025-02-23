// routes/familyRoutes.js
import express from 'express';
import { createFamily, joinFamily, inviteToFamily } from '../controllers/familyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes for family management
router.post('/create', protect, createFamily);
router.post('/join', protect, joinFamily);
router.post('/invite', protect, inviteToFamily);

export default router;
