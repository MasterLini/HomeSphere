import Family from '../models/Family.js';
import User from '../models/User.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Create a new family and add the authenticated user as admin
export const createFamily = async (req, res, next) => {
    try {
        if (req.user.family) {
            return res.status(400).json({ message: 'User is already in a family' });
        }

        const { name } = req.body;
        const joinCode = crypto.randomBytes(4).toString('hex');

        // Create family and add the creator as an admin
        const family = new Family({
            name,
            joinCode,
            members: [{ user: req.user._id, role: 'admin' }]
        });
        await family.save();

        // Update the user's family reference
        await User.findByIdAndUpdate(req.user._id, { family: family._id });

        logger.info(`Family created: ${name} with join code ${joinCode}`);
        res.status(201).json({ message: 'Family created successfully', family });
    } catch (error) {
        logger.error('Error creating family:', error);
        next(error);
    }
};

export const joinFamily = async (req, res, next) => {
    try {
        // Prevent joining another family if already in one
        if (req.user.family) {
            return res.status(400).json({ message: 'User is already in a family' });
        }

        const { joinCode } = req.body;
        const family = await Family.findOne({ joinCode });

        if (!family) {
            logger.warn(`Join attempt with invalid join code: ${joinCode}`);
            return res.status(404).json({ message: 'Family not found with provided join code' });
        }

        // Check if the user is already in the family
        const isAlreadyMember = family.members.some(member => member.user.toString() === req.user._id.toString());
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'User is already a member of this family' });
        }

        // Add the user to the family as a 'member'
        family.members.push({ user: req.user._id, role: 'member' });
        await family.save();

        // Update the user's family reference
        await User.findByIdAndUpdate(req.user._id, { family: family._id });

        logger.info(`User ${req.user.email} joined family ${family.name}`);
        res.status(200).json({ message: 'Joined family successfully', family });
    } catch (error) {
        logger.error('Error joining family:', error);
        next(error);
    }
};

// Invite someone to the family by email
export const inviteToFamily = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!req.user.family) {
            logger.warn(`User ${req.user.email} attempted to invite without a family`);
            return res.status(400).json({ message: 'You are not part of a family' });
        }
        const family = await Family.findById(req.user.family);
        if (!family) {
            logger.warn(`Family not found for user ${req.user.email}`);
            return res.status(404).json({ message: 'Family not found' });
        }
        const invitationToken = crypto.randomBytes(10).toString('hex');
        family.invitations.push({ email, invitationToken });
        await family.save();

        logger.info(`Invitation sent to ${email} with token ${invitationToken}`);
        res.status(200).json({ message: 'Invitation sent', invitationToken });
    } catch (error) {
        logger.error('Error inviting to family:', error);
        next(error);
    }
};

// Promote a family member to admin
export const promoteMember = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const family = await Family.findById(req.user.family);
        if (!family) {
            logger.warn(`Family not found for user ${req.user.email}`);
            return res.status(404).json({ message: 'Family not found' });
        }
        // Ensure the requester is admin
        const requester = family.members.find(member => member.user.toString() === req.user._id.toString());
        if (!requester || requester.role !== 'admin') {
            logger.warn(`User ${req.user.email} attempted to promote without sufficient privileges`);
            return res.status(403).json({ message: 'Not authorized to promote members' });
        }
        // Find target member and update role to 'admin'
        const target = family.members.find(member => member.user.toString() === userId);
        if (!target) {
            logger.warn(`User ${userId} not found in family ${family.name}`);
            return res.status(404).json({ message: 'User not found in family' });
        }
        target.role = 'admin';
        await family.save();
        logger.info(`User ${userId} promoted to admin in family ${family.name}`);
        res.status(200).json({ message: 'Member promoted to admin successfully' });
    } catch (error) {
        logger.error('Error promoting member:', error);
        next(error);
    }
};

// Demote a family member from admin to member
export const demoteMember = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const family = await Family.findById(req.user.family);
        if (!family) {
            logger.warn(`Family not found for user ${req.user.email}`);
            return res.status(404).json({ message: 'Family not found' });
        }
        // Ensure the requester is admin
        const requester = family.members.find(member => member.user.toString() === req.user._id.toString());
        if (!requester || requester.role !== 'admin') {
            logger.warn(`User ${req.user.email} attempted to demote without sufficient privileges`);
            return res.status(403).json({ message: 'Not authorized to demote members' });
        }
        // Find target member and update role to 'member' (if currently admin)
        const target = family.members.find(member => member.user.toString() === userId);
        if (!target) {
            logger.warn(`User ${userId} not found in family ${family.name}`);
            return res.status(404).json({ message: 'User not found in family' });
        }
        if (target.role !== 'admin') {
            logger.warn(`User ${userId} is not an admin, cannot demote`);
            return res.status(400).json({ message: 'User is not an admin' });
        }
        target.role = 'member';
        await family.save();
        logger.info(`User ${userId} demoted to member in family ${family.name}`);
        res.status(200).json({ message: 'Member demoted successfully' });
    } catch (error) {
        logger.error('Error demoting member:', error);
        next(error);
    }
};

// Get all family members
export const getFamilyMembers = async (req, res, next) => {
    try {
        const familyId = req.params.familyId;
        const family = await Family.findById(familyId).populate('members.user', 'firstName lastName username profileImage email');
        if (!family) {
            return res.status(404).json({ message: 'Family not found' });
        }
        // Map members to a simpler structure
        const members = family.members.map(member => ({
            userId: member.user._id,
            firstName: member.user.firstName,
            lastName: member.user.lastName,
            username: member.user.username,
            profilePic: member.user.profileImage,
            role: member.role
        }));
        res.status(200).json(members);
    } catch (error) {
        logger.error('Error fetching family members:', error);
        next(error);
    }
};

export const removeFamilyMember = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const family = await Family.findById(req.user.family);

        if (!family) {
            return res.status(404).json({ message: 'Family not found' });
        }

        // Ensure the requester is admin
        const requester = family.members.find(member => member.user.toString() === req.user._id.toString());
        if (!requester || requester.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to remove members' });
        }

        // Check if the user to remove is an admin and is the only admin
        const target = family.members.find(member => member.user.toString() === userId);
        if (!target) {
            return res.status(404).json({ message: 'User not found in family' });
        }

        const adminCount = family.members.filter(member => member.role === 'admin').length;
        if (target.role === 'admin' && adminCount === 1) {
            return res.status(400).json({ message: 'Cannot remove the last admin' });
        }

        // Remove the member from the family
        family.members = family.members.filter(member => member.user.toString() !== userId);
        await family.save();

        // Remove the user's family reference
        await User.findByIdAndUpdate(userId, { family: null });

        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        logger.error('Error removing family member:', error);
        next(error);
    }
};

