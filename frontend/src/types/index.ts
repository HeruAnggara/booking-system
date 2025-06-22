export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface TicketType {
  id: number;
  name: string;
  concert_id: number;
  type: string;
  price: number;
  total_seats: number;
  available_seats: number;
}

export interface Concert {
  id: number;
  name: string;
  title: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  total_seats: number;
  available_seats: number;
  status: 'on-sale' | 'upcoming' | 'sold-out';
  image: string;
  description: string;
  ticketTypes: TicketType[];
  created_at: string;
}

export interface BookingItem {
  id?: number;
  concertId: number;
  concert_id?: number;
  ticketTypeId: number;
  quantity: number;
  price: number;
  ticket_count?: number;
  total_price?: number;
  userId?: number;
  createdAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  concertId: string;
  items: BookingItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
}

export interface BookingContextType {
  currentBooking: BookingItem[];
  pendingBookings: BookingItem[];
  fetchPendingBookings: () => Promise<void>;
  addToBooking: (item: BookingItem) => void;
  removeFromBooking: (concertId: number, ticketTypeId: number) => void;
  clearBooking: () => void;
  getTotalAmount: () => number;
}

export interface ConcertsResponse {
  concerts: Concert[];
  status: number;
}

export interface ConcertDetailResponse {
  concert: Concert;
  status: number;
}