// routes/shoppingRoutes.js
import express from 'express';
import { createShoppingItem, getShoppingItems, updateShoppingItem, deleteShoppingItem } from '../controllers/shoppingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createShoppingItem);
router.get('/', protect, getShoppingItems);
router.put('/:id', protect, updateShoppingItem);
router.delete('/:id', protect, deleteShoppingItem);

export default router;