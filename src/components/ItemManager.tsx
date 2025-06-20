import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';
import type { Item, Category } from '../types';
import * as StorageService from '../services/storageService';

const ItemManager: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newItem, setNewItem] = useState<Item>({
    id: '',
    name: '',
    price: 0,
    description: ''
  });
  const [newCategory, setNewCategory] = useState<Category>({
    id: '',
    name: '',
    color: '#3b82f6' // Default blue color
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  const loadItems = () => {
    setItems(StorageService.getItems());
  };

  const loadCategories = () => {
    setCategories(StorageService.getCategories());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingItemId) {
      const updatedItems = items.map(item => {
        if (item.id === editingItemId) {
          return { 
            ...item, 
            [name]: name === 'price' 
              ? parseInt(value) || 0 
              : name === 'categoryId' && value === '' 
                ? undefined 
                : value 
          };
        }
        return item;
      });
      setItems(updatedItems);
    } else {
      setNewItem({ 
        ...newItem, 
        [name]: name === 'price' 
          ? parseInt(value) || 0 
          : name === 'categoryId' && value === '' 
            ? undefined 
            : value 
      });
    }
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingCategoryId) {
      const updatedCategories = categories.map(category => {
        if (category.id === editingCategoryId) {
          return { ...category, [name]: value };
        }
        return category;
      });
      setCategories(updatedCategories);
    } else {
      setNewCategory({ ...newCategory, [name]: value });
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
        description: '',
        categoryId: undefined
      });
    }
    setShowForm(false);
    loadItems();
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategoryId) {
      const editedCategory = categories.find(category => category.id === editingCategoryId);
      if (editedCategory) {
        StorageService.updateCategory(editedCategory);
      }
      setEditingCategoryId(null);
    } else {
      const categoryWithId = { ...newCategory, id: uuidv4() };
      StorageService.addCategory(categoryWithId);
      setNewCategory({
        id: '',
        name: '',
        color: '#3b82f6'
      });
    }
    setShowCategoryModal(false);
    loadCategories();
  };

  const handleEdit = (id: string) => {
    setEditingItemId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    StorageService.deleteItem(id);
    loadItems();
  };

  const handleCategoryEdit = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setEditingCategoryId(id);
      setNewCategory(category);
      setShowCategoryModal(true);
    }
  };

  const handleCategoryDelete = (id: string) => {
    if (window.confirm('Are you sure? Items in this category will become uncategorized.')) {
      StorageService.deleteCategory(id);
      loadCategories();
      loadItems(); // Reload items as some might have been updated
    }
  };

  const openNewItemForm = () => {
    setEditingItemId(null);
    setNewItem({
      id: '',
      name: '',
      price: 0,
      description: '',
      categoryId: undefined
    });
    setShowForm(true);
  };

  const openNewCategoryForm = () => {
    setEditingCategoryId(null);
    setNewCategory({
      id: '',
      name: '',
      color: '#3b82f6'
    });
    setShowCategoryModal(true);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setShowForm(false);
    loadItems(); // Reset any unsaved changes
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setShowCategoryModal(false);
    loadCategories(); // Reset any unsaved changes
  };

  // Get item being edited or new item
  const currentItem = editingItemId 
    ? items.find(item => item.id === editingItemId) || newItem 
    : newItem;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Item Manager</h2>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'items' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('items')}
            >
              Items
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'items' ? (
        <>
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
                  
                  <h4 className="text-sm font-medium mb-1">Category</h4>
                  <div className="flex mb-3">
                    <select
                      className="flex-grow px-3 py-2 border rounded mr-2"
                      name="categoryId"
                      value={currentItem.categoryId || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      type="button"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
                      onClick={() => {
                        setShowCategoryModal(true);
                        setEditingCategoryId(null);
                        setNewCategory({
                          id: '',
                          name: '',
                          color: '#3b82f6'
                        });
                      }}
                    >
                      New Category
                    </button>
                  </div>
                  
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
              items.map(item => {
                const category = item.categoryId 
                  ? categories.find(c => c.id === item.categoryId)
                  : undefined;
                  
                return (
                  <div 
                    key={item.id} 
                    className="p-3 mb-2 border rounded-md flex items-center bg-white"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-medium">{item.name}</h3>
                        {category && (
                          <span 
                            className="ml-2 px-2 py-0.5 text-xs rounded-full text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        )}
                      </div>
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
                );
              })
            )}
          </div>
        </>
      ) : (
        // Categories tab
        <>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white mb-4 px-4 py-2 rounded flex items-center transition-colors"
            onClick={openNewCategoryForm}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Category
          </button>
          
          {/* Category List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.length === 0 ? (
              <div className="p-4 border rounded-md bg-gray-50 col-span-full">
                <h3 className="text-sm text-gray-500">No categories added yet</h3>
              </div>
            ) : (
              categories.map(category => {
                // Count items in this category
                const itemCount = items.filter(item => item.categoryId === category.id).length;
                return (
                  <div 
                    key={category.id} 
                    className="p-3 border rounded-md bg-white"
                  >
                    <div className="flex items-center mb-2">
                      <span 
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: category.color }}
                      ></span>
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                    <div className="flex justify-end">
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded mr-2 transition-colors"
                        onClick={() => handleCategoryEdit(category.id)}
                        aria-label="Edit category"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                        onClick={() => handleCategoryDelete(category.id)}
                        aria-label="Delete category"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
      
      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {editingCategoryId ? 'Edit Category' : 'New Category'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={cancelCategoryEdit}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input
                  className="w-full px-3 py-2 border rounded"
                  name="name"
                  value={newCategory.name}
                  onChange={handleCategoryInputChange}
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    name="color"
                    className="h-10 w-10 border rounded mr-2"
                    value={newCategory.color}
                    onChange={handleCategoryInputChange}
                  />
                  <input
                    className="flex-1 px-3 py-2 border rounded"
                    type="text"
                    name="color"
                    value={newCategory.color}
                    onChange={handleCategoryInputChange}
                    placeholder="#HEX Color"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="button"
                  className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded mr-2 transition-colors"
                  onClick={cancelCategoryEdit}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                  {editingCategoryId ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemManager;