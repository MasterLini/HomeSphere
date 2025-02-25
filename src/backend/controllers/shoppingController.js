import ShoppingItem from '../models/ShoppingItem.js';
import logger from '../utils/logger.js';

export const createShoppingItem = async (req, res, next) => {
    try {
        const { productName, quantity, notes, isFamilyItem } = req.body;
        const familyId = req.user.family;

        // Build the item data
        const itemData = {
            productName,
            quantity,
            notes,
            createdBy: req.user._id,
            private: true // default is personal item
        };

        // If the user is in a family and the item is marked as a family item,
        // attach the family id and mark as not private.
        if (familyId && isFamilyItem) {
            itemData.family = familyId;
            itemData.private = false;
        }

        const item = new ShoppingItem(itemData);
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
        let items;
        if (familyId) {
            items = await ShoppingItem.find({
                $or: [
                    { family: familyId, private: false },
                    { createdBy: req.user._id, private: true }
                ]
            });
        } else {
            items = await ShoppingItem.find({ createdBy: req.user._id, private: true });
        }
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

        let item = null;
        if (familyId) {
            item = await ShoppingItem.findOne({ _id: id, family: familyId, private: false });
        }
        if (!item) {
            item = await ShoppingItem.findOne({ _id: id, createdBy: req.user._id, private: true });
        }
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
        let item = null;
        if (familyId) {
            item = await ShoppingItem.findOneAndDelete({ _id: id, family: familyId, private: false });
        }
        if (!item) {
            item = await ShoppingItem.findOneAndDelete({ _id: id, createdBy: req.user._id, private: true });
        }
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
