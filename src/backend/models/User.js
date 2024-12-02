const bcrypt = require('bcrypt');

class UserModel {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = new Date();
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
