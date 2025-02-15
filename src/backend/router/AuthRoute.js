const express = require('express');
const UserModel = require('../models/User');
const { 
    sendVerificationEmail,
    sendPasswordResetEmail 
} = require('../utils/emailService');
const {
    sendSuccess,
    sendValidationError,
    sendAuthError,
    sendForbiddenError,
    sendServerError
} = require('../utils/responseUtils');
const {
    findUserByEmail,
    findExistingUser,
    updateUser,
    getDB,
    insert
} = require('../utils/dbUtils');
const {
    generateToken,
    blacklistToken,
    createAuthMiddleware,
    verifyToken
} = require('../utils/tokenUtils');
const {
    validateUserInput,
    sanitizeEmail,
    isValidEmail,
    isValidPassword
} = require('../utils/validationUtils');

const router = express.Router();
const authMiddleware = createAuthMiddleware();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendValidationError(res, 'Email and password are required');
        }

        const user = await findUserByEmail(sanitizeEmail(email));
        if (!user) {
            return sendAuthError(res, 'Invalid email or password');
        }

        // Convert plain user object to UserModel instance for using its methods
        const userModel = Object.assign(new UserModel(user.username, user.email, user.password), user);

        const isPasswordValid = await userModel.comparePassword(password);
        if (!isPasswordValid) {
            return sendAuthError(res, 'Invalid email or password');
        }

        if (!user.isVerified && !process.env.SKIP_EMAIL_VERIFICATION) {
            return sendForbiddenError(res, 'Please verify your email before logging in');
        }

        // Update last login time
        await updateUser(user._id, { lastLogin: new Date() });

        const tokenPayload = {
            userId: user._id,
            username: user.username,
            role: user.role
        };

        const isDevUser = email === process.env.DEV_EMAIL;
        const token = generateToken(tokenPayload, isDevUser);
        const message = isDevUser ? 'Development login successful' : 'Login successful';

        sendSuccess(res, { 
            message, 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                familyId: user.familyId
            }
        });

    } catch (err) {
        sendServerError(res, err);
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        try {
            validateUserInput(username, email, password);
        } catch (validationError) {
            return sendValidationError(res, validationError.message);
        }

        const existingUser = await findExistingUser(username, sanitizeEmail(email));
        if (existingUser) {
            return sendValidationError(res, 'Username or email is already taken');
        }

        const user = new UserModel(username, email, password);
        await user.hashPassword();

        const result = await insert('users', user);

        try {
            await sendVerificationEmail(email, user.verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            await updateUser(result.insertedId, { emailError: emailError.message });
        }

        sendSuccess(res, {
            message: 'Registration successful! Please check your email to verify your account.',
            userId: result.insertedId,
            username: user.username,
            requiresVerification: true
        }, 201);

    } catch (error) {
        // Handle validation errors separately
        if (error.message && (
            error.message.includes('Username') ||
            error.message.includes('Email') ||
            error.message.includes('Password')
        )) {
            return sendValidationError(res, error.message);
        }

        sendServerError(res, error);
    }
});

// Email verification endpoint
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!token || typeof token !== 'string' || token.length !== 64) {
            return res.status(400).json({ 
                message: 'Invalid verification token format'
            });
        }

        const db = getDB();

        // Find user with matching token
        const user = await db.collection('users').findOne({
            verificationToken: token
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid verification token. Please request a new verification email.',
                code: 'INVALID_TOKEN'
            });
        }

        // Convert to UserModel instance to use its methods
        const userModel = Object.assign(new UserModel(user.username, user.email, user.password), user);

        // Check if token is expired
        if (userModel.isVerificationTokenExpired()) {
            // Generate new verification token
            userModel.regenerateVerificationToken();

            // Update user with new token
            await db.collection('users').updateOne(
                { _id: user._id },
                { 
                    $set: { 
                        verificationToken: userModel.verificationToken,
                        verificationExpires: userModel.verificationExpires
                    }
                }
            );

            // Try to send new verification email
            try {
                await sendVerificationEmail(user.email, userModel.verificationToken);
                return res.status(400).json({ 
                    message: 'Verification token expired. A new verification email has been sent.',
                    code: 'TOKEN_EXPIRED'
                });
            } catch (emailError) {
                console.error('Failed to send new verification email:', emailError);
                return res.status(400).json({ 
                    message: 'Verification token expired. Please request a new verification email.',
                    code: 'TOKEN_EXPIRED'
                });
            }
        }

        // Update user as verified
        await db.collection('users').updateOne(
            { _id: user._id },
            { 
                $set: { 
                    isVerified: true,
                    verifiedAt: new Date()
                },
                $unset: { 
                    verificationToken: "",
                    verificationExpires: "" 
                }
            }
        );

        // Return success response
        res.status(200).json({
            message: 'Email verification successful! You can now log in.',
            code: 'VERIFICATION_SUCCESS'
        });

    } catch (error) {
        sendServerError(res, error);
    }
});

// Password reset endpoints
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !isValidEmail(email)) {
            return sendValidationError(res, 'Valid email is required');
        }

        const user = await findUserByEmail(sanitizeEmail(email));

        // Don't reveal if user exists
        if (!user) {
            return sendSuccess(res, {
                message: 'If an account exists with this email, you will receive a password reset link.',
                code: 'RESET_EMAIL_SENT'
            });
        }

        // Convert to UserModel instance
        const userModel = Object.assign(new UserModel(user.username, user.email, user.password), user);

        // Generate reset token
        const resetToken = userModel.generatePasswordResetToken();

        // Update user with reset token
        await updateUser(user._id, {
            passwordResetToken: userModel.passwordResetToken,
            passwordResetExpires: userModel.passwordResetExpires
        });

        // Send reset email
        try {
            await sendPasswordResetEmail(email, resetToken);
            sendSuccess(res, {
                message: 'If an account exists with this email, you will receive a password reset link.',
                code: 'RESET_EMAIL_SENT'
            });
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            sendServerError(res, 'Failed to send password reset email. Please try again later.');
        }
    } catch (error) {
        sendServerError(res, error);
    }
});

// Reset password endpoint
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || typeof token !== 'string') {
            return sendValidationError(res, 'Invalid reset token');
        }

        if (!password || !isValidPassword(password)) {
            return sendValidationError(res, 'Valid password is required');
        }

        const user = await getDB().collection('users').findOne({ passwordResetToken: token });

        if (!user) {
            return sendValidationError(res, 'Invalid or expired reset token');
        }

        // Convert to UserModel instance
        const userModel = Object.assign(new UserModel(user.username, user.email, user.password), user);

        // Verify token is not expired
        if (userModel.isPasswordResetTokenExpired()) {
            return sendValidationError(res, 'Password reset token has expired. Please request a new one.');
        }

        // Update password
        userModel.password = password;
        await userModel.hashPassword();

        // Update user in database
        await updateUser(user._id, {
            password: userModel.password,
            passwordUpdatedAt: new Date()
        }, {
            $unset: {
                passwordResetToken: "",
                passwordResetExpires: ""
            }
        });

        // Invalidate all existing tokens for this user
        const userTokens = Array.from(tokenBlacklist).filter(t => {
            const decoded = verifyToken(t);
            return decoded && decoded.userId === user._id.toString();
        });
        userTokens.forEach(blacklistToken);

        sendSuccess(res, {
            message: 'Password has been reset successfully. Please log in with your new password.',
            code: 'PASSWORD_RESET_SUCCESS'
        });

    } catch (error) {
        sendServerError(res, error);
    }
});

router.post('/logout', authMiddleware, async (req, res) => {
    try {
        const { token, user } = req;

        // Add token to blacklist
        blacklistToken(token);

        // Update user's last activity
        if (user && user.userId) {
            await updateUser(user.userId, { 
                lastLogout: new Date(),
                lastActivity: new Date()
            });
        }

        sendSuccess(res, { 
            message: 'Successfully logged out',
            code: 'LOGOUT_SUCCESS'
        });
    } catch (error) {
        sendServerError(res, error);
    }
});

module.exports = router;
