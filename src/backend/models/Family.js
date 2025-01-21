const { ObjectId } = require('mongodb');

class FamilyModel {
    constructor(name, members = []) {
        this.name = name.trim(); // Family name
        this.createdAt = new Date(); // Timestamp
        this.members = members.map(member => ({
            role: member.role.trim(), // Role in the family (e.g., Parent, Child)
            userId: new ObjectId(member.userId), // MongoDB ObjectId for the associated user
        }));
    }
}

module.exports = FamilyModel;
