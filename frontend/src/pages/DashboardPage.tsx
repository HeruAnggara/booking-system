import React, { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { ConcertCard } from '@/components/concerts/ConcertCard';
import { ConcertFilters } from '@/components/concerts/ConcertFilters';
import { mockConcerts } from '@/data/mockData';
import { Concert } from '@/types';

export const DashboardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  const availableCities = useMemo(() => {
    return Array.from(new Set(mockConcerts.map(concert => concert.city))).sort();
  }, []);

  const filteredConcerts = useMemo(() => {
    return mockConcerts.filter((concert) => {
      const matchesSearch = 
        concert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concert.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concert.venue.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || concert.status === statusFilter;
      const matchesCity = cityFilter === 'all' || concert.city === cityFilter;
      
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [searchTerm, statusFilter, cityFilter]);

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || cityFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCityFilter('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Concerts
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book tickets for the hottest concerts and live music events in your city
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ConcertFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            cityFilter={cityFilter}
            onCityFilterChange={setCityFilter}
            availableCities={availableCities}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {hasActiveFilters ? 'Search Results' : 'All Concerts'}
            </h2>
            <span className="text-gray-600">
              {filteredConcerts.length} concert{filteredConcerts.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Concert Grid */}
        {filteredConcerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConcerts.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎵</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No concerts found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or check back later for new events.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};