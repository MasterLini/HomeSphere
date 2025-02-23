import Todo from '../models/Todo.js';
import logger from '../utils/logger.js';

export const createTodo = async (req, res, next) => {
    try {
        const { title, description, dueDate, assignedTo } = req.body;
        const familyId = req.user.family;
        if (!familyId) {
            return res.status(400).json({ message: 'User does not belong to a family' });
        }

        const todo = new Todo({
            title,
            description,
            dueDate,
            assignedTo,
            family: familyId,
            status: 'pending'
        });
        await todo.save();
        logger.info(`Todo created: ${todo.title} in family ${familyId}`);
        res.status(201).json({ message: 'Todo created', todo });
    } catch (error) {
        logger.error('Error creating todo:', error);
        next(error);
    }
};

export const getTodos = async (req, res, next) => {
    try {
        const familyId = req.user.family;
        if (!familyId) {
            return res.status(400).json({ message: 'User does not belong to a family' });
        }
        const todos = await Todo.find({ family: familyId });
        res.status(200).json({ todos });
    } catch (error) {
        logger.error('Error fetching todos:', error);
        next(error);
    }
};

export const updateTodo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const familyId = req.user.family;
        const todo = await Todo.findOne({ _id: id, family: familyId });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        Object.assign(todo, updates);
        await todo.save();
        logger.info(`Todo updated: ${todo.title}`);
        res.status(200).json({ message: 'Todo updated', todo });
    } catch (error) {
        logger.error('Error updating todo:', error);
        next(error);
    }
};

export const deleteTodo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const familyId = req.user.family;
        const todo = await Todo.findOneAndDelete({ _id: id, family: familyId });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        logger.info(`Todo deleted: ${todo.title}`);
        res.status(200).json({ message: 'Todo deleted' });
    } catch (error) {
        logger.error('Error deleting todo:', error);
        next(error);
    }
};
