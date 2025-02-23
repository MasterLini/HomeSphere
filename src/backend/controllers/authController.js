// controllers/authController.js
import User from '../models/User.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { sendEmail } from '../utils/mailer.js';

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

// Register a new user
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn(`Registration attempt with existing email: ${email}`);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const user = new User({ name, email, password, verificationToken });
        await user.save();

        // Send verification email
        const verifyUrl = `http://localhost:${process.env.PORT || 3000}/api/auth/verify-email/${verificationToken}`;
        await sendEmail({
            to: user.email,
            subject: 'HomeSphere - Verify Your Email',
            text: `Please verify your email by clicking the following link: ${verifyUrl}`,
            html: `<p>Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`,
        });

        logger.info(`User registered successfully: ${email}`);
        res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
    } catch (error) {
        logger.error('Error during user registration:', error);
        next(error);
    }
};

// Login user
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(`Login attempt with invalid email: ${email}`);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger.warn(`Invalid password attempt for email: ${email}`);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            logger.warn(`Login attempt before email verification for: ${email}`);
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
        logger.info(`User logged in successfully: ${email}`);
        res.status(200).json({ token });
    } catch (error) {
        logger.error('Error during login:', error);
        next(error);
    }
};

// Verify email address
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            logger.warn('Invalid or expired verification token provided.');
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        logger.info(`Email verified for user: ${user.email}`);
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        logger.error('Error during email verification:', error);
        next(error);
    }
};

// Edit profile (requires authentication middleware)
export const editProfile = async (req, res, next) => {
    try {
        // Assume authentication middleware sets req.user
        const userId = req.user.id;
        const { name, password } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            logger.warn(`User not found for profile update: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (password) user.password = password; // pre-save hook will hash it

        await user.save();
        logger.info(`User profile updated: ${user.email}`);
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        logger.error('Error updating profile:', error);
        next(error);
    }
};

// Request password reset
export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn(`Password reset requested for non-existent email: ${email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        // Send password reset email
        const resetUrl = `http://localhost:${process.env.PORT || 3000}/api/auth/reset-password/${resetToken}`;
        await sendEmail({
            to: user.email,
            subject: 'HomeSphere - Reset Your Password',
            text: `Reset your password by clicking the following link: ${resetUrl}`,
            html: `<p>Reset your password by clicking <a href="${resetUrl}">here</a>.</p>`,
        });

        logger.info(`Password reset requested for: ${email}`);
        res.status(200).json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
        logger.error('Error requesting password reset:', error);
        next(error);
    }
};

// Reset password using the provided token
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            logger.warn('Invalid or expired password reset token.');
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        user.password = password; // pre-save hook will hash the new password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        logger.info(`Password reset successfully for: ${user.email}`);
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        logger.error('Error resetting password:', error);
        next(error);
    }
};

export const logout = (req, res) => {
    logger.info(`User logged out: ${req.user ? req.user.email : 'Unknown user'}`);
    res.status(200).json({ message: 'User logged out successfully' });
};
