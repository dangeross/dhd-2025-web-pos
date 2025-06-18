import type { Item, BasketItem } from '../types';

const ITEMS_KEY = 'pos_items';
const BASKET_KEY = 'pos_basket';

// Item management
export const getItems = (): Item[] => {
  const items = localStorage.getItem(ITEMS_KEY);
  return items ? JSON.parse(items) : [];
};

export const saveItems = (items: Item[]): void => {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
};

export const addItem = (item: Item): void => {
  const items = getItems();
  items.push(item);
  saveItems(items);
};

export const updateItem = (item: Item): void => {
  const items = getItems();
  const index = items.findIndex(i => i.id === item.id);
  if (index !== -1) {
    items[index] = item;
    saveItems(items);
  }
};

export const deleteItem = (id: string): void => {
  const items = getItems();
  saveItems(items.filter(item => item.id !== id));
};

// Basket management
export const getBasket = (): BasketItem[] => {
  const basket = localStorage.getItem(BASKET_KEY);
  return basket ? JSON.parse(basket) : [];
};

export const saveBasket = (basket: BasketItem[]): void => {
  localStorage.setItem(BASKET_KEY, JSON.stringify(basket));
};

export const addToBasket = (item: Item, quantity: number = 1): void => {
  const basket = getBasket();
  const existingItem = basket.find(i => i.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    basket.push({ ...item, quantity });
  }
  
  saveBasket(basket);
};

export const updateBasketItem = (id: string, quantity: number): void => {
  const basket = getBasket();
  const index = basket.findIndex(i => i.id === id);
  
  if (index !== -1) {
    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      basket.splice(index, 1);
    } else {
      basket[index].quantity = quantity;
    }
    saveBasket(basket);
  }
};

export const clearBasket = (): void => {
  saveBasket([]);
};

export const getBasketTotal = (): number => {
  return getBasket().reduce((total, item) => total + (item.price * item.quantity), 0);
};