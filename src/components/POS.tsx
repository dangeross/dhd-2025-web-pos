import React, { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon, TrashIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Item, BasketItem } from '../types';
import * as StorageService from '../services/storageService';
import { useNavigate } from 'react-router-dom';

type NotificationType = 'success' | 'error' | null;

interface Notification {
  type: NotificationType;
  message: string;
}

const POS: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
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

  const loadBasket = () => {
    setBasketItems(StorageService.getBasket());
  };

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

  const basketTotal = StorageService.getBasketTotal();

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
        {items.length === 0 ? (
          <div className="flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-gray-500 mb-2">No items available.</p>
              <p className="text-gray-500">Please add some items first.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
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
    </div>
  );
};

export default POS;