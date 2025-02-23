import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' }
}, { _id: false });

const familySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        members: [memberSchema],
        invitations: [
            {
                email: { type: String },
                invitationToken: { type: String }
            }
        ],
        joinCode: { type: String, unique: true },
        parentFamily: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', default: null }
    },
    { timestamps: true }
);

const Family = mongoose.model('Family', familySchema);
export default Family;
