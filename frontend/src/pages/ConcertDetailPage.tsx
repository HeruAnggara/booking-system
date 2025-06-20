import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { TicketSelector } from '@/components/booking/TicketSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { mockConcerts } from '@/data/mockData';

export const ConcertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const concert = mockConcerts.find(c => c.id === id);

  if (!concert) {
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

  const getStatusColor = (status: typeof concert.status) => {
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

  const getStatusText = (status: typeof concert.status) => {
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
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Concerts
        </Button>

        {/* Concert Header */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
          <div className="relative">
            <img
              src={concert.image}
              alt={concert.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <div className="mb-3">
                <Badge className={getStatusColor(concert.status)}>
                  {getStatusText(concert.status)}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{concert.title}</h1>
              <p className="text-xl opacity-90">{concert.artist}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Concert Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-semibold">{format(new Date(concert.date), 'EEEE, MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-semibold">{concert.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-semibold">{concert.venue}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{concert.city}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">About This Event</h2>
                <p className="text-gray-700 leading-relaxed">{concert.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Selection */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Select Your Tickets</h2>
            {concert.ticketTypes.map((ticketType) => (
              <TicketSelector
                key={ticketType.id}
                concert={concert}
                ticketType={ticketType}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};