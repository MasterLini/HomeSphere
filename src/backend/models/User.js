const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');

class UserModel {
    static PASSWORD_MIN_LENGTH = 8;
    static USERNAME_MIN_LENGTH = 3;
    static USERNAME_MAX_LENGTH = 30;

    constructor(username, email, password, familyId = null) {
        this.validateInput(username, email, password);

        this.username = username.trim();
        this.email = email.toLowerCase().trim(); // Normalize email
        this.password = password;
        this.createdAt = new Date();
        this.isVerified = false;
        this.verificationToken = this.generateVerificationToken();
        this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        this.role = 'user'; // Default role
        this.familyId = familyId ? new ObjectId(familyId) : null; // Reference to the family, if any
        this.lastLogin = null;
        this.passwordResetToken = null;
        this.passwordResetExpires = null;
    }

    validateInput(username, email, password) {
        // Username validation
        if (!username || typeof username !== 'string') {
            throw new Error('Username is required');
        }
        if (username.trim().length < UserModel.USERNAME_MIN_LENGTH) {
            throw new Error(`Username must be at least ${UserModel.USERNAME_MIN_LENGTH} characters long`);
        }
        if (username.trim().length > UserModel.USERNAME_MAX_LENGTH) {
            throw new Error(`Username must not exceed ${UserModel.USERNAME_MAX_LENGTH} characters`);
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
            throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
        }

        // Email validation
        if (!email || typeof email !== 'string') {
            throw new Error('Email is required');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            throw new Error('Invalid email format');
        }

        // Password validation
        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }
        if (password.length < UserModel.PASSWORD_MIN_LENGTH) {
            throw new Error(`Password must be at least ${UserModel.PASSWORD_MIN_LENGTH} characters long`);
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(password)) {
            throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        }
    }

    // Hash the password
    async hashPassword() {
        const saltRounds = 12; // Increased from 10 for better security
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    // Compare password
    async comparePassword(candidatePassword) {
        if (!candidatePassword) {
            throw new Error('Password is required for comparison');
        }
        return bcrypt.compare(candidatePassword, this.password);
    }

    // Generate a new verification token
    generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    regenerateVerificationToken() {
        this.verificationToken = this.generateVerificationToken();
        this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // Check if the verification token is expired
    isVerificationTokenExpired() {
        return this.verificationExpires ? Date.now() > this.verificationExpires.getTime() : true;
    }

    // Generate password reset token
    generatePasswordResetToken() {
        this.passwordResetToken = crypto.randomBytes(32).toString('hex');
        this.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now
        return this.passwordResetToken;
    }

    // Check if password reset token is expired
    isPasswordResetTokenExpired() {
        return this.passwordResetExpires ? Date.now() > this.passwordResetExpires.getTime() : true;
    }

    // Update last login
    updateLastLogin() {
        this.lastLogin = new Date();
    }
}

module.exports = UserModel;
