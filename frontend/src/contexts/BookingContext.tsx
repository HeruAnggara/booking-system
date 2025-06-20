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

  const addToBooking = (item: BookingItem) => {
    setCurrentBooking(prev => {
      const existingIndex = prev.findIndex(
        booking => booking.concertId === item.concertId && booking.ticketTypeId === item.ticketTypeId
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }
      
      return [...prev, item];
    });
  };

  const removeFromBooking = (concertId: string, ticketTypeId: string) => {
    setCurrentBooking(prev =>
      prev.filter(
        booking => !(booking.concertId === concertId && booking.ticketTypeId === ticketTypeId)
      )
    );
  };

  const clearBooking = () => {
    setCurrentBooking([]);
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