import { Concert } from '@/types';

export const mockConcerts: Concert[] = [
  {
    id: '1',
    title: 'Summer Music Festival 2024',
    artist: 'Various Artists',
    date: '2024-07-15',
    time: '18:00',
    venue: 'Central Park',
    city: 'New York',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
    description: 'Join us for an unforgettable evening of music featuring top artists from around the world.',
    status: 'on-sale',
    ticketTypes: [
      {
        id: '1-1',
        name: 'General Admission',
        price: 75,
        available: 500,
        description: 'Standing room with great view of the stage'
      },
      {
        id: '1-2',
        name: 'VIP Experience',
        price: 150,
        available: 100,
        description: 'Premium seating with backstage meet & greet'
      },
      {
        id: '1-3',
        name: 'Premium Seating',
        price: 120,
        available: 250,
        description: 'Reserved seating with premium amenities'
      }
    ]
  },
  {
    id: '2',
    title: 'Rock Legends Live',
    artist: 'Thunder Strike',
    date: '2024-08-20',
    time: '20:00',
    venue: 'Madison Square Garden',
    city: 'New York',
    image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg',
    description: 'Experience the raw energy of rock music with Thunder Strike\'s world tour.',
    status: 'on-sale',
    ticketTypes: [
      {
        id: '2-1',
        name: 'Floor Standing',
        price: 95,
        available: 800,
        description: 'Close to the stage, standing room only'
      },
      {
        id: '2-2',
        name: 'Lower Bowl',
        price: 125,
        available: 400,
        description: 'Reserved seating in lower bowl'
      },
      {
        id: '2-3',
        name: 'VIP Package',
        price: 225,
        available: 50,
        description: 'Meet & greet, premium seating, merchandise'
      }
    ]
  },
  {
    id: '3',
    title: 'Jazz Night Under Stars',
    artist: 'Smooth Collective',
    date: '2024-09-05',
    time: '19:30',
    venue: 'Blue Note',
    city: 'Los Angeles',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
    description: 'An intimate evening of smooth jazz in the heart of LA.',
    status: 'on-sale',
    ticketTypes: [
      {
        id: '3-1',
        name: 'Standard Table',
        price: 65,
        available: 60,
        description: 'Shared table seating with drink service'
      },
      {
        id: '3-2',
        name: 'Premium Table',
        price: 95,
        available: 20,
        description: 'Private table with premium drink service'
      }
    ]
  },
  {
    id: '4',
    title: 'Electronic Dreams Festival',
    artist: 'DJ Matrix & Friends',
    date: '2024-10-12',
    time: '21:00',
    venue: 'Convention Center',
    city: 'Miami',
    image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg',
    description: 'Dance the night away with the hottest electronic artists.',
    status: 'upcoming',
    ticketTypes: [
      {
        id: '4-1',
        name: 'Dance Floor',
        price: 85,
        available: 1000,
        description: 'Full access to main dance floor'
      },
      {
        id: '4-2',
        name: 'VIP Lounge',
        price: 175,
        available: 150,
        description: 'Exclusive lounge access with premium bar'
      }
    ]
  },
  {
    id: '5',
    title: 'Acoustic Sessions',
    artist: 'Sarah Chen',
    date: '2024-11-08',
    time: '20:00',
    venue: 'Intimate Theater',
    city: 'San Francisco',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
    description: 'An intimate acoustic performance by rising star Sarah Chen.',
    status: 'sold-out',
    ticketTypes: [
      {
        id: '5-1',
        name: 'General Seating',
        price: 45,
        available: 0,
        description: 'Comfortable seating in intimate venue'
      }
    ]
  },
  {
    id: '6',
    title: 'Hip Hop Legends Tour',
    artist: 'MC Flows & Crew',
    date: '2024-12-01',
    time: '19:00',
    venue: 'Arena Downtown',
    city: 'Chicago',
    image: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg',
    description: 'The biggest names in hip hop unite for one unforgettable show.',
    status: 'on-sale',
    ticketTypes: [
      {
        id: '6-1',
        name: 'Nosebleed',
        price: 55,
        available: 300,
        description: 'Upper level seating'
      },
      {
        id: '6-2',
        name: 'Mid Level',
        price: 85,
        available: 500,
        description: 'Mid-level reserved seating'
      },
      {
        id: '6-3',
        name: 'Floor Seats',
        price: 135,
        available: 200,
        description: 'Premium floor seating'
      },
      {
        id: '6-4',
        name: 'VIP Experience',
        price: 250,
        available: 75,
        description: 'Meet & greet, premium seating, exclusive merchandise'
      }
    ]
  }
];