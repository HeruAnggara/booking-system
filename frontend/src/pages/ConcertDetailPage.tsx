import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { TicketSelector } from '@/components/booking/TicketSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { useConcert } from '@/contexts/ConcertContext';

export const ConcertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { selectedConcert, loading, error, fetchConcertById } = useConcert();

  useEffect(() => {
    if (id && (!selectedConcert || selectedConcert.id !== Number(id))) {
      fetchConcertById(id);
    }
  }, [id, fetchConcertById, selectedConcert]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !selectedConcert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Concert Not Found</h1>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-sale':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'sold-out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-sale':
        return 'On Sale Now';
      case 'upcoming':
        return 'Coming Soon';
      case 'sold-out':
        return 'Sold Out';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Concerts
        </Button>

        {/* Concert Header */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
          <div className="relative">
            <img
              src={selectedConcert.image}
              alt={selectedConcert.name}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="mb-3">
                <Badge className={`${getStatusColor(selectedConcert.status)} text-sm px-3 py-1`}>
                  {getStatusText(selectedConcert.status)}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{selectedConcert.name}</h1>
              <p className="text-xl opacity-90">{selectedConcert.artist}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Concert Information */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Event Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date</p>
                      <p className="font-semibold text-gray-900">{format(new Date(selectedConcert.date), 'EEEE, MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Venue</p>
                      <p className="font-semibold text-gray-900">{selectedConcert.venue}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="font-semibold text-gray-900">{selectedConcert.city}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">About This Event</h2>
                <p className="text-gray-700 leading-relaxed">{selectedConcert.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Selection */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <div className="flex items-center mb-4">
                <Ticket className="h-5 w-5 mr-2 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Select Tickets</h2>
              </div>
              
              <div className="space-y-4">
                {selectedConcert.ticketTypes.map((ticketType) => (
                  <TicketSelector
                    key={ticketType.id}
                    concert={selectedConcert}
                    ticketType={ticketType}
                  />
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-blue-800">Quick Tips</span>
                </div>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Select quantity and add tickets to your cart</li>
                  <li>• Maximum 10 tickets per type</li>
                  <li>• Prices are final and include all fees</li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate('/booking')}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Ticket className="h-4 w-4 mr-2" />
                View Cart & Checkout
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};