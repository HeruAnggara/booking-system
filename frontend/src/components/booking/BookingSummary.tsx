import React, { useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Trash2, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useConcert } from '@/contexts/ConcertContext';
import { usePayment } from '@/contexts/PaymentContext';

export const BookingSummary: React.FC = () => {
  const navigate = useNavigate();
  const { currentBooking, pendingBookings, removeFromBooking } = useBooking();console.log(pendingBookings)
  const { user } = useAuth();
  const { getConcertById } = useConcert();
  const { processPayment, loading: paymentLoading, error: paymentError } = usePayment();
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [bookingComplete, setBookingComplete] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleRemoveItem = (concertId: number, ticketTypeId: number, isPending: boolean) => {    
    if (isPending) {
      // Logic to cancel pending booking (e.g., call backend to update status)
      toast({
        title: "Pending item removal",
        description: "Pending bookings cannot be removed directly. Contact support to cancel.",
        variant: "default",
      });
      return;
    }
    removeFromBooking(concertId, ticketTypeId);
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const handleProcessPayment = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all customer information fields.",
        variant: "destructive",
      });
      return;
    }

    const success = await processPayment(customerInfo);
    if (success) {
      setBookingComplete(true);
    }
  };

  if (bookingComplete) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">Booking Confirmed!</h3>
            <p className="text-gray-600">
              Your tickets have been successfully booked. Check your email for confirmation details.
            </p>
            <Button onClick={() => setBookingComplete(false)} className="w-full">
              Book More Tickets
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentBooking.length === 0 && pendingBookings.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
            <p className="text-gray-600">
              Browse concerts and add tickets to your cart to get started.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Back to Concert List
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
        <CardDescription>Review your current cart and pending bookings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Cart Items */}
        {currentBooking.length > 0 && (
          <>
            <h3 className="font-semibold">Current Cart</h3>
            <div className="space-y-4">
              {currentBooking.map((item) => {
                const concert = getConcertById(item.concertId.toString());
                const ticketType = concert?.ticketTypes.find(t => t.id === item.ticketTypeId);
                if (!concert || !ticketType) return null;
                return (
                  <div key={`${item.concertId}-${item.ticketTypeId}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{concert.title}</h4>
                      <p className="text-sm text-gray-600">{ticketType.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.concertId, item.ticketTypeId, false)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator />
          </>
        )}

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <>
            <h3 className="font-semibold">Pending Bookings</h3>
            <div className="space-y-4">
              {pendingBookings.map((item) => {
                const concert = getConcertById(item.concert_id?.toString() ?? '');
                const ticketType = concert?.ticketTypes;
                if (!concert || !ticketType) return null;
                return (
                  <div key={`${item.concert_id}-${item.userId}`} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-semibold">{concert.name}</h4>
                      <p className="text-sm text-gray-600">{ticketType?.[0]?.type}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.ticket_count} × ${item?.total_price?.toFixed(2)}
                      </p>
                      <p className="text-sm text-yellow-600">Status: Pending</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">${item.ticket_count && item.total_price ? (item.ticket_count * item.total_price).toFixed(2) : '0'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.concert_id ?? 0, ticketType?.[0].id, false)}
                        className="text-gray-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator />
          </>
        )}

        {/* Total */}
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount (Current Cart):</span>
          <span className="text-blue-600">
            <span className="font-semibold">
              ${pendingBookings.reduce((acc, item) => acc + ((item.ticket_count ?? 0) * (item.total_price ?? 0)), 0).toFixed(2)}
            </span>
          </span>
        </div>

        <Separator />

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="font-semibold">Customer Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name</Label>
              <Input
                id="customerName"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handleProcessPayment}
          disabled={paymentLoading || pendingBookings.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {paymentLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Complete Payment (${pendingBookings.reduce((acc, item) => acc + ((item.ticket_count ?? 0) * (item.total_price ?? 0)), 0).toFixed(2)})
            </>
          )}
        </Button>
        {paymentError && <p className="text-red-600 text-sm mt-2">{paymentError}</p>}
      </CardContent>
    </Card>
  );
};