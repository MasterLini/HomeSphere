const bcrypt = require('bcrypt');
const crypto = require('crypto');

class UserModel {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = new Date();
        this.isVerified = false;
        this.verificationToken = crypto.randomBytes(32).toString('hex');
        this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    // Hash the password
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    // Compare password
    async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    }
}

module.exports = UserModel;
