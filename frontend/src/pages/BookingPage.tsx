import React from 'react';
import { Header } from '@/components/layout/Header';
import { BookingSummary } from '@/components/booking/BookingSummary';

export const BookingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your selection and proceed with payment</p>
        </div>
        
        <BookingSummary />
      </main>
    </div>
  );
};