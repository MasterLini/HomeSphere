import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        isChecked: { type: Boolean, default: false },
        notes: { type: String },
        family: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true }
    },
    { timestamps: true }
);

const ShoppingItem = mongoose.model('ShoppingItem', shoppingItemSchema);
export default ShoppingItem;
