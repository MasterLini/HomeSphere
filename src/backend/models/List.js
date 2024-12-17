const { ObjectId } = require('mongodb');

class List {
    constructor(userId, type, items = []) {
        this.userId = userId; // Reference to the user
        this.type = type; // 'todo' or 'shopping'
        this.items = items; // Array of items
        this.createdAt = new Date();
    }

    // Method to add an item
    addItem(item) {
        this.items.push(item);
    }

    // Method to remove an item
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
    }
}

module.exports = List;
