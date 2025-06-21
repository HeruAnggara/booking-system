import React, { useState } from 'react';
import { Concert, TicketType, BookingItem } from '@/types';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Ticket, Users, ShoppingCart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TicketSelectorProps {
  concert: Concert;
  ticketType: TicketType;
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({ concert, ticketType }) => {
  const { addToBooking } = useBooking();
  const [quantity, setQuantity] = useState(0);

  const handleAddToBooking = async () => {
    if (quantity === 0) return;

    const bookingItem: BookingItem = {
      concertId: concert.id,
      ticketTypeId: ticketType.id,
      quantity,
      price: ticketType.price,
    };

    try {
      await addToBooking(bookingItem);
      toast({
        title: "Added to cart!",
        description: `${quantity} x ${ticketType.type} ticket${quantity > 1 ? 's' : ''} added to your cart.`,
      });
      setQuantity(0);
    } catch (err) {
      console.error('Add to cart error:', err);
      toast({
        title: "Error",
        description: 'Failed to add to cart. Please try again or check your authentication.',
        variant: 'destructive',
      });
    }
  };

  const incrementQuantity = () => {
    if (quantity < Math.min(ticketType.available_seats, 10)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1);
    }
  };

  const maxQuantity = Math.min(ticketType.available_seats, 10);
  const isAvailable = ticketType.available_seats > 0;

  return (
    <Card className={`transition-all duration-200 ${!isAvailable ? 'opacity-60' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg text-gray-900">{ticketType.type}</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${ticketType.price.toFixed(2)}</div>
                <div className="text-xs text-gray-500">per ticket</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant={isAvailable ? 'outline' : 'destructive'}
                className={isAvailable ? 'text-green-600 border-green-600' : ''}
              >
                <Users className="h-3 w-3 mr-1" />
                {isAvailable ? `${ticketType.available_seats} available` : 'Sold Out'}
              </Badge>
              {quantity > 0 && (
                <div className="text-sm font-medium text-blue-600">
                  Total: ${(ticketType.price * quantity).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {isAvailable && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={quantity <= 0}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium text-lg">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={quantity >= maxQuantity}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {maxQuantity < 10 && (
                <span className="text-xs text-gray-500">Max {maxQuantity} due to availability</span>
              )}
            </div>

            <Button
              onClick={handleAddToBooking}
              disabled={quantity === 0}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        )}

        {!isAvailable && (
          <div className="pt-3 border-t">
            <Button disabled className="w-full" variant="secondary">
              <Ticket className="h-4 w-4 mr-2" />
              Sold Out
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};