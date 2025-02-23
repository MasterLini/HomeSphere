import apiClient from './index';

export const createShoppingItem = itemData =>
    apiClient.post('/shopping', itemData);
export const getShoppingItems = () =>
    apiClient.get('/shopping');
export const updateShoppingItem = (id, updates) =>
    apiClient.put(`/shopping/${id}`, updates);
export const deleteShoppingItem = id =>
    apiClient.delete(`/shopping/${id}`);
