import React, { useState, useEffect } from 'react';
import {
  Box, Grid, GridItem, Heading, Text, Button,
  Flex, Spacer, IconButton, Input 
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import type { Item, BasketItem } from '../types';
import * as StorageService from '../services/storageService';
import { useNavigate } from 'react-router-dom';

const POS: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
    loadBasket();
  }, []);

  const loadItems = () => {
    setItems(StorageService.getItems());
  };

  const loadBasket = () => {
    setBasketItems(StorageService.getBasket());
  };

  const handleAddToBasket = (item: Item) => {
    StorageService.addToBasket(item, 1);
    loadBasket();
    // Simple alert instead of toast
    alert(`${item.name} has been added to your basket`);
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
      alert('Please add items to your basket before checkout');
      return;
    }
    navigate('/checkout');
  };

  const clearBasket = () => {
    StorageService.clearBasket();
    loadBasket();
  };

  const basketTotal = StorageService.getBasketTotal();

  return (
    <Grid templateColumns="repeat(12, 1fr)" gap={4} p={4}>
      {/* Items Grid */}
      <GridItem colSpan={{ base: 12, md: 8 }} p={2}>
        <Box mb={4}>
          <Heading size="lg">Available Items</Heading>
        </Box>
        <Grid templateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap={6}>
          {items.length === 0 ? (
            <Box p={4} borderWidth="1px" borderRadius="lg">
              <Text>No items available. Please add some items first.</Text>
            </Box>
          ) : items.map((item) => (
            <Box key={item.id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={2}>{item.name}</Heading>
              <Text mb={2}>{item.description}</Text>
              <Text fontWeight="bold" mb={4}>{Math.round(item.price)} sats</Text>
              <Button 
                colorScheme="blue" 
                onClick={() => handleAddToBasket(item)}
                width="100%"
              >
                <Box mr={2}>
                  <AddIcon />
                </Box>
                Add to Basket
              </Button>
            </Box>
          ))}
        </Grid>
      </GridItem>

      {/* Basket */}
      <GridItem colSpan={{ base: 12, md: 4 }} p={2}>
        <Box 
          p={4} 
          borderWidth="1px" 
          borderRadius="lg" 
          position="sticky" 
          top="20px"
          bg="white"
        >
          <Flex align="center" mb={4}>
            <Heading size="lg">Basket</Heading>
            <Spacer />
            <Box bg="green.100" px={2} py={1} borderRadius="md">
              <Text color="green.800" fontWeight="bold">
                {basketItems.reduce((total, item) => total + item.quantity, 0)} items
              </Text>
            </Box>
          </Flex>
          
          {basketItems.length === 0 ? (
            <Text>Your basket is empty</Text>
          ) : (
            <Box>
              {basketItems.map((item) => (
                <Box key={item.id} p={2} borderWidth="1px" borderRadius="md" mb={2}>
                  <Flex align="center">
                    <Box>
                      <Text fontWeight="bold">{item.name}</Text>
                      <Text fontSize="sm">{Math.round(item.price)} sats each</Text>
                    </Box>
                    <Spacer />
                    <Flex align="center">
                      <Input
                        size="sm"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            handleUpdateQuantity(item.id, val);
                          }
                        }}
                        width="60px"
                        mr={2}
                      />
                      <IconButton
                        aria-label="Remove item"
                        onClick={() => handleRemoveFromBasket(item.id)}
                        size="sm"
                        colorScheme="red"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Flex>
                  </Flex>
                </Box>
              ))}
              
              <Box pt={4} borderTopWidth="1px" mt={2}>
                <Flex>
                  <Text fontWeight="bold">Total:</Text>
                  <Spacer />
                  <Text fontWeight="bold">{Math.round(basketTotal)} sats</Text>
                </Flex>
              </Box>
              
              <Button 
                colorScheme="green" 
                size="lg" 
                width="100%" 
                onClick={handleCheckout}
                disabled={basketItems.length === 0}
                mt={4}
              >
                Checkout
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                width="100%" 
                onClick={clearBasket}
                disabled={basketItems.length === 0}
                mt={2}
              >
                Clear Basket
              </Button>
            </Box>
          )}
        </Box>
      </GridItem>
    </Grid>
  );
};

export default POS;