const express = require('express');
const FamilyModel = require('../models/Family');
const { ObjectId } = require('mongodb');
const {getDB} = require("../db/connectDB");

const router = express.Router();

function validateObjectId(req, res, next) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ObjectId' });
    }
    next();
}

router.post('/create', async (req, res) => {
    const { name, members } = req.body;

    if (!name || !Array.isArray(members)) {
        return res.status(400).json({ error: 'Name and members are required' });
    }

    try {
        const family = new FamilyModel(name, members);
        const savedFamily = await saveFamilyToDatabase(family);
        res.status(201).json(savedFamily);
    } catch (error) {
        console.error('Error creating family:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id/members', validateObjectId, async (req, res) => {
    const { id } = req.params;

    try {
        const family = await getFamilyFromDatabase(id);
        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }
        res.status(200).json(family.members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:id/members', validateObjectId, async (req, res) => {
    const { id } = req.params;
    const { role, userId } = req.body;

    if (!role || !userId) {
        return res.status(400).json({ error: 'Role and userId are required' });
    }

    try {
        const updatedFamily = await addMemberToFamily(id, { role, userId });
        if (!updatedFamily) {
            return res.status(404).json({ error: 'Family not found' });
        }
        res.status(200).json(updatedFamily);
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id/members/:memberId', validateObjectId, async (req, res) => {
    const { id, memberId } = req.params;

    try {
        const updatedFamily = await removeMemberFromFamily(id, memberId);
        if (!updatedFamily) {
            return res.status(404).json({ error: 'Family or member not found' });
        }
        res.status(200).json(updatedFamily);
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:id/members/:memberId/promote', validateObjectId, async (req, res) => {
    const { id, memberId } = req.params;
    const { newRole } = req.body;

    if (!newRole) {
        return res.status(400).json({ error: 'New role is required' });
    }

    try {
        const updatedFamily = await updateMemberRole(id, memberId, newRole);
        if (!updatedFamily) {
            return res.status(404).json({ error: 'Family or member not found' });
        }
        res.status(200).json(updatedFamily);
    } catch (error) {
        console.error('Error promoting member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Demote a member (change role)
router.patch('/:id/members/:memberId/demote', validateObjectId, async (req, res) => {
    const { id, memberId } = req.params;
    const { newRole } = req.body;

    if (!newRole) {
        return res.status(400).json({ error: 'New role is required' });
    }

    try {
        const updatedFamily = await updateMemberRole(id, memberId, newRole); // Replace with DB logic
        if (!updatedFamily) {
            return res.status(404).json({ error: 'Family or member not found' });
        }
        res.status(200).json(updatedFamily);
    } catch (error) {
        console.error('Error demoting member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


async function addMemberToFamily(familyId, member) {
    const familiesCollection = getDB().collection('families');
    const family = await familiesCollection.findOne({ _id: new ObjectId(familyId) });
    if (!family) return null;

    member.userId = new ObjectId(member.userId);
    family.members.push(member);

    await familiesCollection.updateOne(
        { _id: new ObjectId(familyId) },
        { $set: { members: family.members } }
    );

    return family;
}

async function updateMemberRole(familyId, memberId, newRole) {
    const familiesCollection = getDB().collection('families');
    const family = await familiesCollection.findOne({ _id: new ObjectId(familyId) });
    if (!family) return null;

    const member = family.members.find(m => m.userId.toString() === memberId);
    if (!member) return null;

    member.role = newRole;

    await familiesCollection.updateOne(
        { _id: new ObjectId(familyId) },
        { $set: { members: family.members } }
    );

    return family;
}
async function removeMemberFromFamily(familyId, memberId) {
    const familyCollection = getDB().collection('families'); // Replace `db` with your database connection

    try {
        // Find the family document
        const family = await familyCollection.findOne({ _id: new ObjectId(familyId) });
        if (!family) {
            return null; // Family not found
        }

        // Check if the member exists in the family
        const memberIndex = family.members.findIndex(
            (member) => member.userId.toString() === memberId
        );
        if (memberIndex === -1) {
            return null; // Member not found in the family
        }

        // Remove the member from the members array
        family.members.splice(memberIndex, 1);

        // Update the family document in the database
        const updateResult = await familyCollection.updateOne(
            { _id: new ObjectId(familyId) },
            { $set: { members: family.members } }
        );

        if (updateResult.modifiedCount === 0) {
            return null; // No modifications were made (unlikely at this point)
        }

        // Return the updated family
        return await familyCollection.findOne({ _id: new ObjectId(familyId) });
    } catch (error) {
        console.error('Error removing member from family:', error);
        throw error;
    }
}

async function getFamilyFromDatabase(familyId) {
    const familyCollection = getDB().collection('families'); // Replace `db` with your database connection

    try {
        const family = await familyCollection.findOne({ _id: new ObjectId(familyId) });
        return family; // Return the family document if found
    } catch (error) {
        console.error('Error retrieving family from database:', error);
        throw error;
    }
}

async function saveFamilyToDatabase(familyData) {
    const familyCollection = getDB().collection('families'); // Replace `db` with your database connection

    try {
        const result = await familyCollection.insertOne(familyData);
        return await familyCollection.findOne({ _id: result.insertedId }); // Return the saved family
    } catch (error) {
        console.error('Error saving family to database:', error);
        throw error;
    }
}


module.exports = router;
