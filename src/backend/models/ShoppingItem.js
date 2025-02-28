// models/ShoppingItem.js
import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema(
    {
            productName: { type: String, required: true },
            quantity: { type: Number, default: 1 },
            isChecked: { type: Boolean, default: false },
            notes: { type: String },
            unit: { type: String, default: 'amount' },
            family: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' }, // now optional
            private: { type: Boolean, default: true },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

const ShoppingItem = mongoose.model('ShoppingItem', shoppingItemSchema);
export default ShoppingItem;
