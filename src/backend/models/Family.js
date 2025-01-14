// Import Mongoose
const mongoose = require('mongoose');

// Create the schema for a family
const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    members: [
        {
            role: {
                type: String,
                required: true,
                trim: true,
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Christian has to change this, i don't know right now what the ref should be
                required: true,
            },
        },
    ],
});

// Create the Family model
const Family = mongoose.model('Family', familySchema);

// Export the model
module.exports = Family;
