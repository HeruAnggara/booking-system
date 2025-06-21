import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useBooking } from './BookingContext';
import { toast } from '@/hooks/use-toast';

interface PaymentContextType {
  processPayment: (customerInfo: { name: string; email: string; phone: string }) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentBooking, clearBooking } = useBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (customerInfo: { name: string; email: string; phone: string }) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const paymentData = {
        userId: user?.id,
        customerInfo,
        bookings: currentBooking.map(item => ({
          concertId: item.concertId,
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: currentBooking.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };

      const response = await fetch('http://localhost:8083/api/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
      }

      const data = await response.json();
      if (data.status == 201) {
        clearBooking();
        toast({
          title: "Payment successful!",
          description: "Your tickets have been booked successfully.",
        });
        return true;
      } else {
        throw new Error(data.message || 'Payment processing failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    processPayment,
    loading,
    error,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};