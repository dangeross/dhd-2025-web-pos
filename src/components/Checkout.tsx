import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { BasketItem, InvoiceStatus } from '../types';
import * as StorageService from '../services/storageService';
import * as LightningService from '../services/lightningService';
import { QRCodeSVG } from 'qrcode.react';

type NotificationType = 'success' | 'error' | null;

interface Notification {
  type: NotificationType;
  message: string;
}

const Checkout: React.FC = () => {
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceStatus | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
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
    if (notification) {
      // Auto-dismiss notification after 3 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      // Show error notification instead of alert
      setNotification({
        type: 'error',
        message: 'Failed to create invoice: ' + (error.message || 'Unknown error')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
    // Show success notification instead of alert
    setNotification({
      type: 'success',
      message: 'Payment Received! Thank you for your payment.'
    });
    
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
    <div className="flex justify-center py-10 relative">
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
      
      <div 
        className="max-w-lg border border-gray-200 rounded-lg overflow-hidden p-6 shadow-lg bg-white"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center">Checkout</h2>
        </div>
        
        {error && (
          <div 
            className="p-4 bg-red-100 rounded-md mb-4"
          >
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {!isPaid ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
              <div>
                {basketItems.map((item) => (
                  <div key={item.id} className="flex justify-between mb-2">
                    <p>
                      {item.quantity}x {item.name}
                    </p>
                    <p>{Math.round(item.price * item.quantity)} sats</p>
                  </div>
                ))}
                <div 
                  className="border-t pt-2 mt-2"
                >
                  <div className="flex justify-between">
                    <p className="font-bold">Total:</p>
                    <p className="font-bold">{Math.round(total)} sats</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="py-4 mb-4">
              <h3 className="text-lg font-medium mb-4 text-center">
                Pay with Lightning
              </h3>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="ml-4">Generating invoice...</p>
                </div>
              ) : invoice ? (
                <div className="text-center">
                  <div className="flex justify-center">
                    <QRCodeSVG value={invoice.bolt11} size={200} />
                  </div>
                  <p className="text-sm mt-3 mb-3">
                    Scan with your Lightning wallet to pay {Math.round(total)} sats
                  </p>
                  <div 
                    className="border rounded-md p-2 bg-gray-50 mb-4 overflow-auto text-xs font-mono"
                  >
                    {invoice.bolt11}
                  </div>
                  <p className="text-sm text-blue-600 font-bold">
                    Waiting for payment... (demo: payment will auto-complete in 10 seconds)
                  </p>
                </div>
              ) : null}
            </div>
            
            <button 
              onClick={handleBack} 
              className="bg-gray-500 hover:bg-gray-600 text-white w-full py-2 rounded transition-colors"
            >
              Back to Store
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <h3 className="text-lg font-medium mb-4">Payment Successful!</h3>
            <div 
              className="p-2 bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-6xl text-green-500">✓</span>
            </div>
            <p className="mb-6">
              Thank you for your payment of {Math.round(total)} sats. Your order has been processed successfully.
            </p>
            <button 
              onClick={handleNewOrder} 
              className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded transition-colors"
            >
              New Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;