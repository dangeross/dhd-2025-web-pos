import React, { useState, useEffect } from 'react';
import {
  Box, Center, Heading, Text, Spinner,
  Button, Flex, Spacer
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import type { BasketItem, InvoiceStatus } from '../types';
import * as StorageService from '../services/storageService';
import * as LightningService from '../services/lightningService';
import { QRCodeSVG } from 'qrcode.react';

const Checkout: React.FC = () => {
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceStatus | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const items = StorageService.getBasket();
    if (items.length === 0) {
      navigate('/');
      return;
    }
    
    setBasketItems(items);
    const basketTotal = StorageService.getBasketTotal();
    setTotal(basketTotal);
    
    // Generate invoice when component loads
    generateInvoice(basketTotal);
  }, [navigate]);

  useEffect(() => {
    // Set up payment listener if we have an invoice
    if (invoice?.bolt11) {
      LightningService.listenForPayment(invoice.bolt11, (paid) => {
        if (paid) {
          handlePaymentSuccess();
        }
      });
      
      // Poll for payment status every 3 seconds
      const intervalId = setInterval(async () => {
        if (!isPaid && invoice?.bolt11) {
          try {
            const paymentStatus = await LightningService.checkPaymentStatus(invoice.bolt11);
            if (paymentStatus) {
              handlePaymentSuccess();
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }
      }, 3000);
      
      return () => clearInterval(intervalId);
    }
  }, [invoice, isPaid]);

  const generateInvoice = async (amount: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create an invoice memo from basket items
      const itemNames = basketItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
      const memo = `POS Payment: ${itemNames}`;
      
      // Amount is already in satoshis, no need for conversion
      const satoshis = Math.round(amount);
      
      const invoiceData = await LightningService.createInvoice(satoshis, memo);
      setInvoice(invoiceData);
    } catch (error: any) {
      console.error('Failed to create lightning invoice:', error);
      setError(error.message || 'Failed to create lightning invoice');
      alert('Failed to create invoice: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
    alert('Payment Received! Thank you for your payment.');
    
    // Clear the basket after successful payment
    StorageService.clearBasket();
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleNewOrder = () => {
    navigate('/');
  };

  return (
    <Center py={10}>
      <Box 
        maxW="lg" 
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden" 
        p={6} 
        boxShadow="lg"
      >
        <Box mb={6}>
          <Heading size="lg" textAlign="center">Checkout</Heading>
        </Box>
        
        {error && (
          <Box 
            p={4} 
            bg="red.100" 
            borderRadius="md" 
            mb={4}
          >
            <Text color="red.700">{error}</Text>
          </Box>
        )}
        
        {!isPaid ? (
          <>
            <Box mb={6}>
              <Heading size="md" mb={4}>Order Summary</Heading>
              <Box>
                {basketItems.map((item) => (
                  <Flex key={item.id} mb={2}>
                    <Text>
                      {item.quantity}x {item.name}
                    </Text>
                    <Spacer />
                    <Text>{Math.round(item.price * item.quantity)} sats</Text>
                  </Flex>
                ))}
                <Box 
                  borderTopWidth="1px" 
                  pt={2} 
                  mt={2}
                >
                  <Flex>
                    <Text fontWeight="bold">Total:</Text>
                    <Spacer />
                    <Text fontWeight="bold">{Math.round(total)} sats</Text>
                  </Flex>
                </Box>
              </Box>
            </Box>
            
            <Box py={4} mb={4}>
              <Heading size="md" mb={4} textAlign="center">
                Pay with Lightning
              </Heading>
              
              {isLoading ? (
                <Center py={8}>
                  <Spinner size="xl" />
                  <Text ml={4}>Generating invoice...</Text>
                </Center>
              ) : invoice ? (
                <Box textAlign="center">
                  <Center>
                    <QRCodeSVG value={invoice.bolt11} size={200} />
                  </Center>
                  <Text fontSize="sm" mt={3} mb={3}>
                    Scan with your Lightning wallet to pay {Math.round(total)} sats
                  </Text>
                  <Box 
                    borderWidth="1px" 
                    borderRadius="md" 
                    p={2} 
                    bg="gray.50"
                    mb={4}
                    overflow="auto"
                    fontSize="xs"
                    fontFamily="monospace"
                  >
                    {invoice.bolt11}
                  </Box>
                  <Text fontSize="sm" color="blue.600" fontWeight="bold">
                    Waiting for payment... (demo: payment will auto-complete in 10 seconds)
                  </Text>
                </Box>
              ) : null}
            </Box>
            
            <Button onClick={handleBack} colorScheme="gray" width="100%">
              Back to Store
            </Button>
          </>
        ) : (
          <Box textAlign="center" py={4}>
            <Heading size="md" mb={4}>Payment Successful!</Heading>
            <Box 
              p={2} 
              bg="green.100" 
              borderRadius="full"
              width="100px"
              height="100px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              margin="0 auto"
              mb={4}
            >
              <Text fontSize="6xl" color="green.500">✓</Text>
            </Box>
            <Text mb={6}>
              Thank you for your payment of {Math.round(total)} sats. Your order has been processed successfully.
            </Text>
            <Button onClick={handleNewOrder} colorScheme="blue" width="100%">
              New Order
            </Button>
          </Box>
        )}
      </Box>
    </Center>
  );
};

export default Checkout;