import express from 'express';
import {
    createFamily,
    joinFamily,
    inviteToFamily,
    promoteMember,
    demoteMember,
    getFamilyMembers,
    removeFamilyMember
} from '../controllers/familyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createFamily);
router.post('/join', protect, joinFamily);
router.post('/invite', protect, inviteToFamily);
router.post('/promote', protect, promoteMember);
router.post('/demote', protect, demoteMember);
router.get('/:familyId/members', protect, getFamilyMembers);
router.delete('/member/:userId', protect, removeFamilyMember);

export default router;
