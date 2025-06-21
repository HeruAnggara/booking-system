import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Concert } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ConcertCardProps {
  concert: Concert;
}

export const ConcertCard: React.FC<ConcertCardProps> = ({ concert }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: Concert['status']) => {
    switch (status) {
      case 'on-sale':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'sold-out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Concert['status']) => {
    switch (status) {
      case 'on-sale':
        return 'On Sale';
      case 'upcoming':
        return 'Coming Soon';
      case 'sold-out':
        return 'Sold Out';
      default:
        return status;
    }
  };

  const minPrice = Math.min(...concert.ticketTypes.map(t => t.price));

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={concert.image}
          alt={concert.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(concert.status)}>
            {getStatusText(concert.status)}
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="font-bold text-lg mb-1">{concert.title}</h3>
          <p className="text-sm opacity-90">{concert.artist}</p>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(new Date(concert.date), 'MMM dd, yyyy')}</span>
            <Clock className="h-4 w-4 ml-4 mr-2" />
            <span>{concert.time}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{concert.venue}, {concert.city}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{concert.ticketTypes.length} ticket types available</span>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2">
            {concert.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-lg font-bold text-gray-900">
              From ${minPrice}
            </div>
            <Button
              onClick={() => navigate(`/concert/${concert.id}`)}
              disabled={concert.available_seats === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {concert.available_seats == 0 ? 'Sold Out' : 'Book Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};