import React from 'react';
import { Header } from '@/components/layout/Header';
import { ConcertCard } from '@/components/concerts/ConcertCard';
import { ConcertFilters } from '@/components/concerts/ConcertFilters';
import { ConcertProvider, useConcert } from '@/contexts/ConcertContext';

const DashboardContent: React.FC = () => {
  const {
    concerts,
    availableCities,
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
  } = useConcert();

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || cityFilter !== 'all';

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
          {citiesLoading && (
            <p className="text-gray-600 text-sm mt-2">Loading cities...</p>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {hasActiveFilters ? 'Search Results' : 'All Concerts'}
            </h2>
            <span className="text-gray-600">
              {concerts.length} concert{concerts.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        {/* Concert Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading concerts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : concerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concerts.map((concert) => (
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

export const DashboardPage: React.FC = () => {
  return (
    <ConcertProvider>
      <DashboardContent />
    </ConcertProvider>
  );
};