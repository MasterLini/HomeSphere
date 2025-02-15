const { ObjectId } = require('mongodb');

const isValidObjectId = (id) => {
    if (!id) return false;
    return ObjectId.isValid(id);
};

const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

const isValidPassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    return passwordRegex.test(password);
};

const isValidUsername = (username) => {
    if (!username || typeof username !== 'string') return false;
    // 3-30 characters, letters, numbers, underscores, and hyphens only
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username.trim());
};

const validateRequired = (obj, fields) => {
    const missing = fields.filter(field => !obj[field]);
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
};

const validateEnum = (value, allowedValues, fieldName = 'value') => {
    if (!allowedValues.includes(value)) {
        throw new Error(`Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`);
    }
};

const sanitizeEmail = (email) => {
    return email.toLowerCase().trim();
};

const sanitizeUsername = (username) => {
    return username.trim();
};

const validateUserInput = (username, email, password) => {
    const errors = [];

    if (!isValidUsername(username)) {
        errors.push('Username must be 3-30 characters long and can only contain letters, numbers, underscores, and hyphens');
    }

    if (!isValidEmail(email)) {
        errors.push('Invalid email format');
    }

    if (!isValidPassword(password)) {
        errors.push('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    if (errors.length > 0) {
        throw new Error(errors.join('. '));
    }
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidUsername,
    isValidObjectId,
    validateRequired,
    validateEnum,
    sanitizeEmail,
    sanitizeUsername,
    validateUserInput
};
