const { ObjectId } = require('mongodb');

class List {
    constructor(userId, type, items = []) {
        if (!['todolist', 'shoppinglist'].includes(type)) {
            throw new Error('Invalid list type. Must be "todolist" or "shoppinglist".');
        }

        this.userId = new ObjectId(userId); // Reference to the user
        this.type = type; // 'todolist' or 'shoppinglist'
        this.items = [];
        this.createdAt = new Date();

        // Validate and set initial items
        items.forEach(item => this.addItem(item));
    }

    // Method to validate and add an item
    addItem(item) {
        if (this.type === 'todolist') {
            if (!item.text || !item.description || !item.date) {
                throw new Error('Todo list items must include text, description, and date.');
            }
            this.items.push({
                id: new ObjectId(), // Unique ID for the item
                text: item.text,
                description: item.description,
                date: new Date(item.date),
                responsibilities: item.responsibilities ? new ObjectId(item.responsibilities) : this.userId, // Default responsibility to creator
            });
        } else if (this.type === 'shoppinglist') {
            if (!item.productName || item.quantity == null) {
                throw new Error('Shopping list items must include productName and quantity.');
            }
            this.items.push({
                id: new ObjectId(), // Unique ID for the item
                productName: item.productName,
                quantity: item.quantity,
            });
        }
    }

    // Method to remove an item by its ID
    removeItem(itemId) {
        const id = itemId instanceof ObjectId ? itemId.toString() : itemId;
        this.items = this.items.filter(item => item.id.toString() !== id);
    }

    // Method to get all items
    getItems() {
        return this.items;
    }

    // Method to update an item by its ID
    updateItem(itemId, updates) {
        const id = itemId instanceof ObjectId ? itemId.toString() : itemId;
        const item = this.items.find(item => item.id.toString() === id);

        if (!item) {
            throw new Error('Item not found.');
        }

        if (this.type === 'todolist') {
            if (updates.text) item.text = updates.text;
            if (updates.description) item.description = updates.description;
            if (updates.date) item.date = new Date(updates.date);
            if (updates.responsibilities) {
                item.responsibilities = new ObjectId(updates.responsibilities);
            }
        } else if (this.type === 'shoppinglist') {
            if (updates.productName) item.productName = updates.productName;
            if (updates.quantity != null) item.quantity = updates.quantity;
        }
    }
}

module.exports = List;