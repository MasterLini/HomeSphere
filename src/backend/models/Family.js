// models/Family.js
import mongoose from 'mongoose';

const familySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        invitations: [
            {
                email: { type: String },
                invitationToken: { type: String }
            }
        ],
        joinCode: { type: String, unique: true }
    },
    { timestamps: true }
);

const Family = mongoose.model('Family', familySchema);
export default Family;
