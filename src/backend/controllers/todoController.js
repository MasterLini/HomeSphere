import Todo from '../models/Todo.js';
import logger from '../utils/logger.js';

export const createTodo = async (req, res, next) => {
    try {
        const { title, description, dueDate, assignedTo, isFamilyTodo } = req.body;
        const familyId = req.user.family;

        const todoData = {
            title,
            description,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            private: true
        }

        if (familyId && isFamilyTodo) {
            todoData.family = familyId;
            todoData.private = false;
        }

        const todo = new Todo(todoData);

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
        let todos;
        if (familyId) {
            todos = await Todo.find({
                $or: [
                    { family: familyId, private: false },
                    { createdBy: req.user._id, private: true }
                ]
            });
        } else {
            todos = await Todo.find({ createdBy: req.user._id });
        }
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

        let todo = await Todo.findOne({ _id: id, family: familyId, private: false });
        if (!todo){
            todo = await Todo.findOne({ _id: id, createdBy: req.user._id, private: true });
        }
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        console.log("Before update:", todo.title);
        // Use todo.set() instead of Object.assign
        todo.set(updates);
        await todo.save();
        console.log("After save:", todo.title);

        res.status(200).json({ message: 'Todo updated', todo });
    } catch (error) {
        next(error);
    }
};



export const deleteTodo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const familyId = req.user.family;

        let todo = await Todo.findOne({ _id: id, family: familyId, private: false });

        if (!todo){
            todo = await Todo.findOne({ _id: id, createdBy: req.user._id, private: true });
        }

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
