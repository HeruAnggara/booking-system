import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BookingItem, BookingContextType } from '@/types';
import { useAuth } from './AuthContext';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [currentBooking, setCurrentBooking] = useState<BookingItem[]>([]);
   const [pendingBookings, setPendingBookings] = useState<BookingItem[]>([]);

  const fetchPendingBookings = async () => {
    if (!user?.id || !token) return;
    try {
      const response = await fetch('http://localhost:8082/api/bookings/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pending bookings');
      const data = await response.json();
      setPendingBookings(data.data || []);
    } catch (err) {
      console.error('Error fetching pending bookings:', err);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, [user?.id, token]);

  const addToBooking = async (item: BookingItem) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:8082/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          concert_id: item.concertId,
          ticket_type_id: item.ticketTypeId,
          ticket_count: item.quantity,
          total_price: item.price,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to booking: ' + (await response.text()));
      }

      await response.json();

       await fetchPendingBookings();
    } catch (err) {
      console.error('Error adding to booking:', err);
      throw err;
    }
  };

  const removeFromBooking = async (concertId: number, ticketTypeId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const id = pendingBookings.filter(b => b.concert_id  === concertId)[0].id;

      const response = await fetch(`http://localhost:8082/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove from booking');
      }
      await fetchPendingBookings();
    } catch (err) {
      console.error('Error removing from booking:', err);
      throw err;
    }
  };

  const clearBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      for (const item of currentBooking) {
        if (item.id) {
          await fetch(`http://localhost:8082/api/bookings/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        }
      }

      setCurrentBooking([]);
    } catch (err) {
      console.error('Error clearing booking:', err);
      throw err;
    }
  };

  const getTotalAmount = () => {
    return currentBooking.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value: BookingContextType = {
    currentBooking,
    pendingBookings,
    fetchPendingBookings,
    addToBooking,
    removeFromBooking,
    clearBooking,
    getTotalAmount,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};