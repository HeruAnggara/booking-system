import React, { useState } from 'react';
import { Concert, TicketType, BookingItem } from '@/types';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Ticket, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TicketSelectorProps {
  concert: Concert;
  ticketType: TicketType;
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({ concert, ticketType }) => {
  const { addToBooking } = useBooking();
  const [quantity, setQuantity] = useState(1);

  const handleAddToBooking = () => {
    const bookingItem: BookingItem = {
      concertId: concert.id,
      ticketTypeId: ticketType.id,
      quantity,
      price: ticketType.price,
    };

    addToBooking(bookingItem);
    
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${ticketType.name} ticket${quantity > 1 ? 's' : ''} added to your cart.`,
    });

    setQuantity(1);
  };

  const incrementQuantity = () => {
    if (quantity < Math.min(ticketType.available, 10)) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const maxQuantity = Math.min(ticketType.available, 10);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{ticketType.name}</CardTitle>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Users className="h-3 w-3 mr-1" />
            {ticketType.available} left
          </Badge>
        </div>
        <CardDescription>{ticketType.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            ${ticketType.price}
          </div>
          <div className="text-sm text-gray-500">per ticket</div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-medium">Total:</span>
            <span className="text-xl font-bold text-blue-600">
              ${(ticketType.price * quantity).toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          onClick={handleAddToBooking}
          disabled={ticketType.available === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Ticket className="h-4 w-4 mr-2" />
          {ticketType.available === 0 ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};