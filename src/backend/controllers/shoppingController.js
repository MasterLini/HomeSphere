import ShoppingItem from '../models/ShoppingItem.js';
import logger from '../utils/logger.js';

export const createShoppingItem = async (req, res, next) => {
    try {
        const { name, quantity, notes } = req.body;
        const familyId = req.user.family;
        if (!familyId) {
            return res.status(400).json({ message: 'User does not belong to a family' });
        }

        const item = new ShoppingItem({
            name,
            quantity,
            notes,
            family: familyId
        });
        await item.save();
        logger.info(`Shopping item created: ${item.name}`);
        res.status(201).json({ message: 'Shopping item created', item });
    } catch (error) {
        logger.error('Error creating shopping item:', error);
        next(error);
    }
};

export const getShoppingItems = async (req, res, next) => {
    try {
        const familyId = req.user.family;
        if (!familyId) {
            return res.status(400).json({ message: 'User does not belong to a family' });
        }
        const items = await ShoppingItem.find({ family: familyId });
        res.status(200).json({ items });
    } catch (error) {
        logger.error('Error fetching shopping items:', error);
        next(error);
    }
};

export const updateShoppingItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const familyId = req.user.family;
        const item = await ShoppingItem.findOne({ _id: id, family: familyId });
        if (!item) {
            return res.status(404).json({ message: 'Shopping item not found' });
        }
        Object.assign(item, updates);
        await item.save();
        logger.info(`Shopping item updated: ${item.name}`);
        res.status(200).json({ message: 'Shopping item updated', item });
    } catch (error) {
        logger.error('Error updating shopping item:', error);
        next(error);
    }
};

export const deleteShoppingItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const familyId = req.user.family;
        const item = await ShoppingItem.findOneAndDelete({ _id: id, family: familyId });
        if (!item) {
            return res.status(404).json({ message: 'Shopping item not found' });
        }
        logger.info(`Shopping item deleted: ${item.name}`);
        res.status(200).json({ message: 'Shopping item deleted' });
    } catch (error) {
        logger.error('Error deleting shopping item:', error);
        next(error);
    }
};
