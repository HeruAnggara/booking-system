export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Concert {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image: string;
  description: string;
  ticketTypes: TicketType[];
  status: 'upcoming' | 'on-sale' | 'sold-out';
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
  description: string;
}

export interface BookingItem {
  concertId: string;
  ticketTypeId: string;
  quantity: number;
  price: number;
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
}

export interface BookingContextType {
  currentBooking: BookingItem[];
  addToBooking: (item: BookingItem) => void;
  removeFromBooking: (concertId: string, ticketTypeId: string) => void;
  clearBooking: () => void;
  getTotalAmount: () => number;
}