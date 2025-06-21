import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Music, ShoppingCart, LogOut, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import { useConcert } from '@/contexts/ConcertContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentBooking, removeFromBooking, getTotalAmount } = useBooking();
  const { getConcertById } = useConcert();

  const concerts = useMemo(() => {
    return currentBooking.map((item) => getConcertById(item.concertId.toString()));
  }, [currentBooking, getConcertById]);
    
  const totalItems = currentBooking.reduce((sum, item) => sum + item.quantity, 0);

  const handleViewCart = () => {
    navigate('/booking');
  };

  const handleRemoveItem = (concertId: number, ticketTypeId: number) => {
    removeFromBooking(concertId, ticketTypeId);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Music className="4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ConcertBook</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative hover:bg-gray-100">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Shopping Cart</h3>
                    <Badge variant="outline">{totalItems} items</Badge>
                  </div>
                  
                  {currentBooking.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Your cart is empty</p>
                      <p className="text-gray-400 text-xs">Add some tickets to get started</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {currentBooking.map((item, index) => {
                          const concert = concerts[index];
                          const ticketType = concert?.ticketTypes.find(t => t.id === item.ticketTypeId);
                          
                          if (!concert || !ticketType) return null;

                          return (
                            <Card key={`${item.concertId}-${item.ticketTypeId}`} className="border-gray-200">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-gray-900 truncate">
                                      {concert.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 truncate">
                                      {ticketType.name} Ticket
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-gray-500">
                                        {item.quantity} × ${item.price.toFixed(2)}
                                      </span>
                                      <span className="font-semibold text-sm text-blue-600">
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.concertId, item.ticketTypeId)}
                                    className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900">Total:</span>
                          <span className="font-bold text-lg text-blue-600">
                            ${getTotalAmount().toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          onClick={handleViewCart}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Cart & Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};