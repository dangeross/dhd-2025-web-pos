import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, MinusIcon, CheckCircleIcon, ExclamationCircleIcon, BackspaceIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Item, BasketItem, Category } from '../types';
import * as StorageService from '../services/storageService';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

type NotificationType = 'success' | 'error' | null;

interface Notification {
  type: NotificationType;
  message: string;
}

interface ItemsByCategory {
  [categoryId: string]: Item[];
  uncategorized: Item[];
}

const POS: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
    loadCategories();
    loadBasket();
  }, []);

  useEffect(() => {
    if (notification) {
      // Auto-dismiss notification after 3 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadItems = () => {
    setItems(StorageService.getItems());
  };

  const loadCategories = () => {
    setCategories(StorageService.getCategories());
  };

  const loadBasket = () => {
    setBasketItems(StorageService.getBasket());
  };

  // Group items by category
  const itemsByCategory = useMemo<ItemsByCategory>(() => {
    const grouped: ItemsByCategory = {
      uncategorized: []
    };
    
    // Add all items to their respective category group
    items.forEach(item => {
      if (!item.categoryId) {
        grouped.uncategorized.push(item);
      } else {
        if (!grouped[item.categoryId]) {
          grouped[item.categoryId] = [];
        }
        grouped[item.categoryId].push(item);
      }
    });
    
    return grouped;
  }, [items]);

  // Filter items based on selected category
  const displayedItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return items;
    } else if (selectedCategory === 'uncategorized') {
      return itemsByCategory.uncategorized;
    } else {
      return itemsByCategory[selectedCategory] || [];
    }
  }, [items, itemsByCategory, selectedCategory]);

  const handleAddToBasket = (item: Item) => {
    StorageService.addToBasket(item, 1);
    loadBasket();
    // Show toast notification instead of alert
    setNotification({
      type: 'success',
      message: `${item.name} has been added to your basket`
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    StorageService.updateBasketItem(id, quantity);
    loadBasket();
  };

  const handleRemoveFromBasket = (id: string) => {
    StorageService.updateBasketItem(id, 0); // 0 quantity will remove the item
    loadBasket();
  };

  const handleCheckout = () => {
    if (basketItems.length === 0) {
      // Show error notification instead of alert
      setNotification({
        type: 'error',
        message: 'Please add items to your basket before checkout'
      });
      return;
    }
    navigate('/checkout');
  };

  const clearBasket = () => {
    StorageService.clearBasket();
    loadBasket();
  };

  const handleIncrementQuantity = (id: string, currentQuantity: number) => {
    handleUpdateQuantity(id, currentQuantity + 1);
  };

  const handleDecrementQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      handleUpdateQuantity(id, currentQuantity - 1);
    } else {
      // If quantity is 1 and we decrement, remove the item
      handleRemoveFromBasket(id);
    }
  };

  const handleCustomAmountSubmit = () => {
    const amount = parseInt(customAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid amount'
      });
      return;
    }
    
    // Create a custom amount item and add it to the basket
    const customItem: Item = {
      id: uuidv4(),
      name: 'Custom Amount',
      price: amount,
      description: 'Custom amount payment'
    };
    
    handleAddToBasket(customItem);
    setShowCustomAmountModal(false);
    setCustomAmount('');
  };
  
  const handleDirectCheckout = () => {
    const amount = parseInt(customAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid amount'
      });
      return;
    }
    
    // Clear any existing basket items
    StorageService.clearBasket();
    
    // Create a custom amount item and add it to the basket
    const customItem: Item = {
      id: uuidv4(),
      name: 'Custom Amount',
      price: amount,
      description: 'Custom amount payment'
    };
    
    StorageService.addToBasket(customItem, 1);
    setShowCustomAmountModal(false);
    setCustomAmount('');
    
    // Navigate directly to checkout
    navigate('/checkout');
  };

  const handleNumberPadClick = (value: string) => {
    if (value === 'backspace') {
      setCustomAmount(prev => prev.slice(0, -1));
    } else if (value === 'clear') {
      setCustomAmount('');
    } else {
      setCustomAmount(prev => prev + value);
    }
  };

  const basketTotal = StorageService.getBasketTotal();

  const renderCategoryItems = (categoryId: string) => {
    const categoryItems = categoryId === 'uncategorized' 
      ? itemsByCategory.uncategorized 
      : itemsByCategory[categoryId] || [];
      
    if (categoryItems.length === 0) return null;
    
    const category = categories.find(c => c.id === categoryId);
    
    return (
      <div key={categoryId} className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          {category ? (
            <>
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: category.color }}
              ></span>
              {category.name}
            </>
          ) : (
            'Uncategorized'
          )}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg shadow-md bg-white flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                <p className="mb-4 text-gray-600">{item.description}</p>
              </div>
              <div className="mt-auto">
                <p className="font-bold mb-3">{Math.round(item.price)} sats</p>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white w-full px-4 py-2 rounded flex items-center justify-center transition-colors"
                  onClick={() => handleAddToBasket(item)}
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add to Basket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4 relative">
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center shadow-lg border px-4 py-3 rounded-lg transition-all transform ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 mr-2" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
          )}
          <p>{notification.message}</p>
          <button 
            className="ml-4 text-gray-500 hover:text-gray-700"
            onClick={() => setNotification(null)}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Items Grid */}
      <div className="col-span-12 md:col-span-8 p-2">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Store</h1>
          
          <button
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            onClick={() => setShowCustomAmountModal(true)}
          >
            Custom Amount
          </button>
        </div>
        
        <div className="mb-4">
          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex space-x-2">
                <button
                  className={`py-1 px-3 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All Items
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`py-1 px-3 rounded-full text-sm whitespace-nowrap transition-colors flex items-center ${
                      selectedCategory === category.id
                        ? 'text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    style={selectedCategory === category.id ? { backgroundColor: category.color } : {}}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span 
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    ></span>
                    {category.name}
                  </button>
                ))}
                
                {itemsByCategory.uncategorized.length > 0 && (
                  <button
                    className={`py-1 px-3 rounded-full text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === 'uncategorized'
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    onClick={() => setSelectedCategory('uncategorized')}
                  >
                    Uncategorized
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Items Display */}
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
            <div className="text-center p-8">
              <p className="text-gray-500 mb-2">No items available.</p>
              <p className="text-gray-500">Please add some items first.</p>
            </div>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
            <div className="text-center p-8">
              <p className="text-gray-500 mb-2">No items in this category.</p>
            </div>
          </div>
        ) : selectedCategory === 'all' ? (
          // Show items grouped by category
          <div>
            {categories.map(category => renderCategoryItems(category.id))}
            {itemsByCategory.uncategorized.length > 0 && renderCategoryItems('uncategorized')}
          </div>
        ) : (
          // Show items for the selected category
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedItems.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg shadow-md bg-white flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                  <p className="mb-4 text-gray-600">{item.description}</p>
                </div>
                <div className="mt-auto">
                  <p className="font-bold mb-3">{Math.round(item.price)} sats</p>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white w-full px-4 py-2 rounded flex items-center justify-center transition-colors"
                    onClick={() => handleAddToBasket(item)}
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add to Basket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Basket */}
      <div className="col-span-12 md:col-span-4 p-2">
        <div 
          className="p-4 border rounded-lg sticky top-5 bg-white shadow"
        >
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold">Basket</h2>
            <div className="ml-auto">
              <span className="bg-green-100 px-2 py-1 rounded text-green-800 font-bold text-sm">
                {basketItems.reduce((total, item) => total + item.quantity, 0)} items
              </span>
            </div>
          </div>
          
          {basketItems.length === 0 ? (
            <p>Your basket is empty</p>
          ) : (
            <div>
              {basketItems.map((item) => (
                <div key={item.id} className="p-2 border rounded mb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex-grow pr-2">
                      <p className="font-bold text-left">{item.name}</p>
                      <p className="text-sm text-gray-600 text-left">{Math.round(item.price)} sats each</p>
                    </div>
                    <div className="flex items-center shrink-0">
                      <button 
                        className="w-8 h-8 flex items-center justify-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-l-md border border-gray-300 transition-colors"
                        onClick={() => handleDecrementQuantity(item.id, item.quantity)}
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <div className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300 bg-white text-center">
                        {item.quantity}
                      </div>
                      <button 
                        className="w-8 h-8 flex items-center justify-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-r-md border border-gray-300 transition-colors"
                        onClick={() => handleIncrementQuantity(item.id, item.quantity)}
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t mt-2">
                <div className="flex items-center">
                  <p className="font-bold">Total:</p>
                  <p className="font-bold ml-auto">{Math.round(basketTotal)} sats</p>
                </div>
              </div>
              
              <button 
                className={`w-full mt-4 px-4 py-2 rounded text-white text-lg font-medium ${
                  basketItems.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 transition-colors'
                }`}
                onClick={handleCheckout}
                disabled={basketItems.length === 0}
              >
                Checkout
              </button>
              
              <button 
                className={`w-full mt-2 px-4 py-1 rounded border text-sm ${
                  basketItems.length === 0
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-gray-400 hover:bg-gray-100 transition-colors'
                }`}
                onClick={clearBasket}
                disabled={basketItems.length === 0}
              >
                Clear Basket
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Amount Modal */}
      {showCustomAmountModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Enter Custom Amount</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowCustomAmountModal(false);
                  setCustomAmount('');
                }}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4 bg-gray-50 p-4 border rounded-md text-right">
                <span className="text-gray-500 mr-1">Amount:</span>
                <span className="text-3xl font-medium">
                  {customAmount || '0'} <span className="text-lg">sats</span>
                </span>
              </div>
              
              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    className="p-4 text-xl font-medium bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    onClick={() => handleNumberPadClick(num.toString())}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="p-4 text-xl font-medium bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  onClick={() => handleNumberPadClick('clear')}
                >
                  C
                </button>
                <button
                  className="p-4 text-xl font-medium bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  onClick={() => handleNumberPadClick('0')}
                >
                  0
                </button>
                <button
                  className="p-4 text-xl font-medium bg-gray-100 hover:bg-gray-200 rounded transition-colors flex items-center justify-center"
                  onClick={() => handleNumberPadClick('backspace')}
                >
                  <BackspaceIcon className="w-6 h-6" />
                </button>
              </div>
              
              {/* Quick Amounts */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[1000, 5000, 10000, 25000, 50000, 100000].map((amount) => (
                  <button
                    key={amount}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                    onClick={() => setCustomAmount(amount.toString())}
                  >
                    {amount.toLocaleString()} sats
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="mr-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  onClick={handleDirectCheckout}
                  disabled={!customAmount || parseInt(customAmount) <= 0}
                >
                  Direct Checkout
                </button>
                <button 
                  className="mr-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setShowCustomAmountModal(false);
                    setCustomAmount('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  onClick={handleCustomAmountSubmit}
                  disabled={!customAmount || parseInt(customAmount) <= 0}
                >
                  Add to Basket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;