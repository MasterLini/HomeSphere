const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');

class UserModel {
    constructor(username, email, password, familyId = null) {
        this.username = username.trim();
        this.email = email.toLowerCase().trim(); // Normalize email
        this.password = password;
        this.createdAt = new Date();
        this.isVerified = false;
        this.verificationToken = crypto.randomBytes(32).toString('hex');
        this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        this.role = 'user'; // Default role
        this.familyId = familyId ? new ObjectId(familyId) : null; // Reference to the family, if any
    }

    // Hash the password
    async hashPassword() {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    // Compare password
    async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    }

    // Generate a new verification token
    regenerateVerificationToken() {
        this.verificationToken = crypto.randomBytes(32).toString('hex');
        this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // Check if the verification token is expired
    isVerificationTokenExpired() {
        return Date.now() > this.verificationExpires.getTime();
    }
}

module.exports = UserModel;
