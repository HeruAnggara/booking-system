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
  const { pendingBookings, clearBooking } = useBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (customerInfo: { name: string; email: string; phone: string }) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      if (pendingBookings.length === 0) throw new Error('No bookings in cart');
      const bookingId = pendingBookings[0].id || 1; // Adjust based on your BookingContext structure
      const totalAmount = pendingBookings.reduce((acc, item) => acc + ((item.ticket_count ?? 0) * (item.total_price ?? 0)), 0).toFixed(2)

      const paymentData = {
        user_id: user?.id || 1,
        booking_id: bookingId,
        amount: Number(totalAmount),
      };

      console.log('Sending payment request:', paymentData);
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
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 201) {
        // Notify booking service to complete the booking
        const completeResponse = await fetch(`http://localhost:8082/api/bookings/${bookingId}/complete`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!completeResponse.ok) {
          const errorData = await completeResponse.json();
          throw new Error(errorData.message || `Failed to complete booking! status: ${completeResponse.status}`);
        }

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
      console.error('Payment error:', err);
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