import apiClient from './index';

export const createTodo = todoData =>
    apiClient.post('/todos', todoData);
export const getTodos = () =>
    apiClient.get('/todos');
export const updateTodo = (id, updates) =>
    apiClient.put(`/todos/${id}`, updates);
export const deleteTodo = id =>
    apiClient.delete(`/todos/${id}`);
