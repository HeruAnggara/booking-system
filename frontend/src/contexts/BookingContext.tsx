import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BookingItem, BookingContextType } from '@/types';

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
  const [currentBooking, setCurrentBooking] = useState<BookingItem[]>([]);

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

      const data = await response.json();
      setCurrentBooking((prev) => {
        const existingIndex = prev.findIndex(
          (booking) => booking.concertId === item.concertId && booking.ticketTypeId === item.ticketTypeId
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + item.quantity,
            id: data.id,
            createdAt: data.created_at,
          };
          return updated;
        }

        return [...prev, { ...item, id: data.id, createdAt: data.created_at }];
      });
    } catch (err) {
      console.error('Error adding to booking:', err);
      throw err;
    }
  };

  const removeFromBooking = async (concertId: number, ticketTypeId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const item = currentBooking.find(
        (booking) => booking.concertId === Number(concertId) && booking.ticketTypeId === Number(ticketTypeId)
      );
      if (!item?.id) throw new Error('Booking item not found');

      const response = await fetch(`http://localhost:8082/api/bookings/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove from booking');
      }

      setCurrentBooking((prev) =>
        prev.filter(
          (booking) => !(booking.concertId === Number(concertId) && booking.ticketTypeId === Number(ticketTypeId))
        )
      );
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
    addToBooking,
    removeFromBooking,
    clearBooking,
    getTotalAmount,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};