'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CardMaisonLocation, { MaisonLocation } from '../../components/CardMaisonLocation';

export default function StudiosPage() {
  const [studios, setStudios] = useState<MaisonLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudios, setFilteredStudios] = useState<MaisonLocation[]>([]);

  useEffect(() => {
    fetchStudios();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = studios.filter(studio =>
        studio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studio.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studio.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudios(filtered);
    } else {
      setFilteredStudios(studios);
    }
  }, [searchTerm, studios]);

  const fetchStudios = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/studios');
      if (response.ok) {
        const data = await response.json();
        const adaptedStudios = data.studios.map((studio: any) => ({
          id: studio.id,
          name: studio.name,
          description: studio.description,
          address: studio.address,
          city: studio.city,
          postalCode: studio.postalCode,
          country: studio.country,
          surface: studio.surface,
          capacity: studio.capacity,
          bedrooms: studio.bedrooms,
          bathrooms: studio.bathrooms,
          pricePerNight: studio.pricePerNight,
          isAvailable: studio.isAvailable,
          minStay: studio.minStay,
          maxStay: studio.maxStay,
          photos: studio.photos,
          amenities: studio.amenities,
          rules: studio.rules,
          owner: studio.owner,
          createdAt: studio.createdAt,
          updatedAt: studio.updatedAt,
          rating: 4.0 + Math.random() * 1.0,
          reviews: Math.floor(Math.random() * 80) + 20,
        }));
        setStudios(adaptedStudios);
      } else {
        setError('Erreur lors du chargement des studios');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des studios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Découvrez nos Studios
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trouvez le studio parfait pour votre prochain séjour
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par ville, nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Studios Grid */}
        {filteredStudios.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
              <div className="w-20 h-20 mx-auto mb-6 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                {searchTerm ? 'Aucun studio trouvé' : 'Aucun studio disponible'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `Aucun studio ne correspond à "${searchTerm}"`
                  : 'Il n\'y a actuellement aucun studio disponible.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:underline"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="text-center mb-8">
              <p className="text-gray-600">
                {filteredStudios.length} studio{filteredStudios.length > 1 ? 's' : ''} 
                {searchTerm ? ` trouvé${filteredStudios.length > 1 ? 's' : ''} pour "${searchTerm}"` : ' disponible' + (filteredStudios.length > 1 ? 's' : '')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStudios.map((studio) => (
                <CardMaisonLocation
                  key={studio.id}
                  maison={studio}
                  variant="default"
                  onFavorite={(id) => console.log('Favorite:', id)}
                  onShare={(id) => console.log('Share:', id)}
                  onContact={(id) => console.log('Contact:', id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="inline-flex space-x-4">
            {(typeof window !== 'undefined' && (localStorage.getItem('token') || localStorage.getItem('user'))) && (
              <>
                <Link
                  href="/studios/my-studios"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Mes Studios
                </Link>
                <Link
                  href="/studios/my-bookings"
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Mes Réservations
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
