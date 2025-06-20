import type { Item, BasketItem, Category } from '../types';

const ITEMS_KEY = 'pos_items';
const BASKET_KEY = 'pos_basket';
const CATEGORIES_KEY = 'pos_categories';

// Category management
export const getCategories = (): Category[] => {
  const categories = localStorage.getItem(CATEGORIES_KEY);
  return categories ? JSON.parse(categories) : [];
};

export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const addCategory = (category: Category): void => {
  const categories = getCategories();
  categories.push(category);
  saveCategories(categories);
};

export const updateCategory = (category: Category): void => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index !== -1) {
    categories[index] = category;
    saveCategories(categories);
  }
};

export const deleteCategory = (id: string): void => {
  const categories = getCategories();
  saveCategories(categories.filter(category => category.id !== id));
  
  // Update items that were in this category
  const items = getItems();
  const updatedItems = items.map(item => 
    item.categoryId === id ? {...item, categoryId: undefined} : item
  );
  saveItems(updatedItems);
};

export const getCategoryById = (id: string): Category | undefined => {
  return getCategories().find(category => category.id === id);
};

export const getItemsByCategory = (categoryId?: string): Item[] => {
  const items = getItems();
  if (!categoryId) {
    return items.filter(item => !item.categoryId);
  }
  return items.filter(item => item.categoryId === categoryId);
};

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