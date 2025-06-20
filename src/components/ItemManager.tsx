import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';
import type { Item } from '../types';
import * as StorageService from '../services/storageService';

const ItemManager: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Item>({
    id: '',
    name: '',
    price: 0,
    description: ''
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    setItems(StorageService.getItems());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingItemId) {
      const updatedItems = items.map(item => {
        if (item.id === editingItemId) {
          return { ...item, [name]: name === 'price' ? parseInt(value) || 0 : value };
        }
        return item;
      });
      setItems(updatedItems);
    } else {
      setNewItem({ 
        ...newItem, 
        [name]: name === 'price' ? parseInt(value) || 0 : value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItemId) {
      const editedItem = items.find(item => item.id === editingItemId);
      if (editedItem) {
        StorageService.updateItem(editedItem);
      }
      setEditingItemId(null);
    } else {
      const itemWithId = { ...newItem, id: uuidv4() };
      StorageService.addItem(itemWithId);
      setNewItem({
        id: '',
        name: '',
        price: 0,
        description: ''
      });
    }
    setShowForm(false);
    loadItems();
  };

  const handleEdit = (id: string) => {
    setEditingItemId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    StorageService.deleteItem(id);
    loadItems();
  };

  const openNewItemForm = () => {
    setEditingItemId(null);
    setNewItem({
      id: '',
      name: '',
      price: 0,
      description: ''
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setShowForm(false);
    loadItems(); // Reset any unsaved changes
  };

  // Get item being edited or new item
  const currentItem = editingItemId 
    ? items.find(item => item.id === editingItemId) || newItem 
    : newItem;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Item Manager</h2>
      
      {!showForm ? (
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white mb-4 px-4 py-2 rounded flex items-center transition-colors"
          onClick={openNewItemForm}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Item
        </button>
      ) : (
        <div className="mb-6 p-4 border rounded-md shadow-sm bg-white">
          <h3 className="text-lg font-medium mb-4">
            {editingItemId ? 'Edit Item' : 'Add New Item'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-1">Name</h4>
              <input
                className="w-full px-3 py-2 border rounded mb-3"
                name="name"
                value={currentItem.name}
                onChange={handleInputChange}
                placeholder="Item name"
                required
              />
              
              <h4 className="text-sm font-medium mb-1">Price (sats)</h4>
              <input
                className="w-full px-3 py-2 border rounded mb-3"
                name="price"
                type="number"
                min={1}
                step={1}
                value={currentItem.price}
                onChange={handleInputChange}
                placeholder="0"
                required
              />
              
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <textarea
                className="w-full px-3 py-2 border rounded mb-4 resize-y"
                name="description"
                value={currentItem.description || ''}
                onChange={handleInputChange}
                placeholder="Item description"
                rows={3}
              />
            </div>
            
            <div>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-3 transition-colors" 
                type="submit"
              >
                {editingItemId ? 'Update' : 'Save'}
              </button>
              <button 
                className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded transition-colors" 
                type="button" 
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Item List */}
      <div>
        {items.length === 0 ? (
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="text-sm text-gray-500">No items added yet</h3>
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id} 
              className="p-3 mb-2 border rounded-md flex items-center bg-white"
            >
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex mt-1">
                  <div className="font-bold mr-4">
                    {Math.round(item.price)} sats
                  </div>
                  <div className="text-gray-600 text-sm">
                    {item.description}
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded mr-2 transition-colors"
                  onClick={() => handleEdit(item.id)}
                  aria-label="Edit item"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                <button
                  className="p-2 text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete item"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ItemManager;