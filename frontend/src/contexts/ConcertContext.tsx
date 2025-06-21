import React, { createContext, useContext, useState, useEffect } from 'react';
import { Concert, ConcertDetailResponse, ConcertsResponse } from '@/types';

interface ConcertContextType {
  concerts: Concert[];
  availableCities: string[];
  selectedConcert: Concert | null;
  loading: boolean;
  citiesLoading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  cityFilter: string;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setCityFilter: (city: string) => void;
  clearFilters: () => void;
  fetchConcertById: (id: string) => Promise<void>;
  getConcertById: (id: string) => Concert | undefined;
}

const ConcertContext = createContext<ConcertContextType | undefined>(undefined);

export const ConcertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  // Fetch concerts
  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          status: statusFilter,
          city: cityFilter,
        }).toString();
        const response = await fetch(`http://localhost:8082/api/concerts?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch concerts');
        }
        const data: ConcertsResponse = await response.json();
        setConcerts(data.concerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concerts');
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, [searchTerm, statusFilter, cityFilter]);

  // Fetch available cities
  useEffect(() => {
    const fetchCities = async () => {
      setCitiesLoading(true);
      try {
        const response = await fetch('http://localhost:8082/api/concerts/cities');
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        const data = await response.json();
        // Ensure data is an array, default to empty array if not
        setAvailableCities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch cities:', err);
        setAvailableCities([]); // Default to empty array on error
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, []);

  const fetchConcertById = async (id: string) => {
     if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8082/api/concerts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch concert');
      }
      const data: ConcertDetailResponse = await response.json();
      setSelectedConcert(data.concert);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load concert');
    } finally {
      setLoading(false);
    }
  };

  const getConcertById = (id: string): Concert | undefined => {
    return concerts[Number(id)];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCityFilter('all');
  };

  const value = {
    concerts,
    availableCities,
    selectedConcert,
    loading,
    citiesLoading,
    error,
    searchTerm,
    statusFilter,
    cityFilter,
    setSearchTerm,
    setStatusFilter,
    setCityFilter,
    clearFilters,
    fetchConcertById,
    getConcertById
  };

  return <ConcertContext.Provider value={value}>{children}</ConcertContext.Provider>;
};

export const useConcert = () => {
  const context = useContext(ConcertContext);
  if (context === undefined) {
    throw new Error('useConcert must be used within a ConcertProvider');
  }
  return context;
};