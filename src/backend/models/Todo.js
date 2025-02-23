import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
    {
            title: { type: String, required: true },
            description: { type: String },
            dueDate: { type: Date }, // Added dueDate field
            status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
            assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            family: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true }
    },
    { timestamps: true }
);

const Todo = mongoose.model('Todo', todoSchema);
export default Todo;
