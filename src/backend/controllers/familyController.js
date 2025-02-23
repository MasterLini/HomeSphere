// controllers/familyController.js
import Family from '../models/Family.js';
import User from '../models/User.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Create a new family and add the authenticated user as a member
export const createFamily = async (req, res, next) => {
    try {
        const { name } = req.body;
        // Generate a join code (for simplicity, using 8 hex characters)
        const joinCode = crypto.randomBytes(4).toString('hex');

        const family = new Family({ name, joinCode, members: [req.user._id] });
        await family.save();

        // Update the user's family reference
        req.user.family = family._id;
        await req.user.save();

        logger.info(`Family created: ${name} with join code ${joinCode}`);
        res.status(201).json({ message: 'Family created successfully', family });
    } catch (error) {
        logger.error('Error creating family:', error);
        next(error);
    }
};

// Join a family using a join code
export const joinFamily = async (req, res, next) => {
    try {
        const { joinCode } = req.body;
        const family = await Family.findOne({ joinCode });
        if (!family) {
            logger.warn(`Join attempt with invalid join code: ${joinCode}`);
            return res.status(404).json({ message: 'Family not found with provided join code' });
        }

        // If the user isn't already a member, add them
        if (!family.members.includes(req.user._id)) {
            family.members.push(req.user._id);
            await family.save();
        }

        // Update the user's family reference
        req.user.family = family._id;
        await req.user.save();

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

        // Generate an invitation token
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
