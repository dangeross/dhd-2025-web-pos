import React, { useState, useEffect } from 'react';
import {
  Box, Button, Input, Heading, IconButton, Textarea
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
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
    <Box p={4}>
      <Heading size="lg" mb={4}>Item Manager</Heading>
      
      {!showForm ? (
        <Button 
          colorScheme="blue" 
          onClick={openNewItemForm}
          mb={4}
        >
          <Box mr={2}>
            <AddIcon />
          </Box>
          Add New Item
        </Button>
      ) : (
        <Box mb={6} p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
          <Heading size="md" mb={4}>
            {editingItemId ? 'Edit Item' : 'Add New Item'}
          </Heading>
          
          <form onSubmit={handleSubmit}>
            <Box mb={3}>
              <Heading size="xs" mb={1}>Name</Heading>
              <Input
                name="name"
                value={currentItem.name}
                onChange={handleInputChange}
                placeholder="Item name"
                required
                mb={3}
              />
              
              <Heading size="xs" mb={1}>Price (sats)</Heading>
              <Input
                name="price"
                type="number"
                min={1}
                step={1}
                value={currentItem.price}
                onChange={handleInputChange}
                placeholder="0"
                required
                mb={3}
              />
              
              <Heading size="xs" mb={1}>Description</Heading>
              <Textarea
                name="description"
                value={currentItem.description || ''}
                onChange={handleInputChange}
                placeholder="Item description"
                mb={4}
              />
            </Box>
            
            <Box>
              <Button colorScheme="blue" type="submit" mr={3}>
                {editingItemId ? 'Update' : 'Save'}
              </Button>
              <Button variant="ghost" onClick={cancelEdit}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      )}
      
      {/* Item List */}
      <Box>
        {items.length === 0 ? (
          <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
            <Heading size="sm" color="gray.500">No items added yet</Heading>
          </Box>
        ) : (
          items.map(item => (
            <Box 
              key={item.id} 
              p={3} 
              mb={2} 
              borderWidth="1px" 
              borderRadius="md"
              display="flex"
              alignItems="center"
            >
              <Box flex="1">
                <Heading size="sm">{item.name}</Heading>
                <Box display="flex" mt={1}>
                  <Box fontWeight="bold" mr={4}>
                    {Math.round(item.price)} sats
                  </Box>
                  <Box color="gray.600" fontSize="sm">
                    {item.description}
                  </Box>
                </Box>
              </Box>
              
              <Box>
                <IconButton
                  aria-label="Edit item"
                  size="sm"
                  mr={2}
                  onClick={() => handleEdit(item.id)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  aria-label="Delete item"
                  colorScheme="red"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default ItemManager;