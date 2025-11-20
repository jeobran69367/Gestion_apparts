'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CardMaisonLocation, { MaisonLocation } from '../../../components/CardMaisonLocation';

export default function MyStudiosPage() {
  const [studios, setStudios] = useState<MaisonLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [operationLoading, setOperationLoading] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage. Redirecting to login.');
      router.push('/auth/login');
      return;
    }

    fetchMyStudios(token);
  }, [router]);

  const fetchMyStudios = async (token: string) => {
    try {
      const response = await fetch('http://localhost:4000/api/studios/my-studios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });


      if (response.ok) {
        const data = await response.json();

        // Adapter les données pour le composant CardMaisonLocation
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
          photos: studio.photos,
          amenities: studio.amenities,
          createdAt: studio.createdAt,
          owner: studio.owner,
          reservations: studio.reservations
        }));

        setStudios(adaptedStudios);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText); // Debug

        if (response.status === 401) {
          console.error('Unauthorized: Token might be invalid or expired. Redirecting to login.');
          router.push('/auth/login');
        } else {
          setError('Erreur lors du chargement de vos studios');
        }
      }
    } catch (err) {
      console.error('Fetch error:', err); // Debug
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (studioId: number) => {
    router.push(`/studios/edit/${studioId}`);
  };

  const handleDelete = async (studioId: number) => {
    setOperationLoading(studioId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/studios/${studioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setStudios(studios.filter(studio => studio.id !== studioId));
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleToggleAvailability = async (studioId: number, currentStatus: boolean) => {
    setOperationLoading(studioId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/studios/${studioId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: !currentStatus
        }),
      });

      if (response.ok) {
        setStudios(studios.map(studio => 
          studio.id === studioId 
            ? { ...studio, isAvailable: !currentStatus }
            : studio
        ));
      } else {
        setError('Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleManageCalendar = async (id: number) => {
    // TODO: Implémenter la gestion du calendrier
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Mes Propriétés</h1>
          <Link
            href="/studios/create"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg text-sm"
          >
            🏠 Ajouter
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 shadow-sm text-sm">
            {error}
          </div>
        )}

        {studios.length === 0 ? (
          <div className="text-center py-6">
            <div className="max-w-sm mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <div className="w-16 h-16 mx-auto mb-3 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune propriété</h3>
              <p className="text-gray-600 mb-4 text-sm">Ajoutez votre première propriété.</p>
              <Link
                href="/studios/create"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all inline-flex items-center gap-2 transform hover:scale-105 text-sm"
              >
                <span>🏠</span>
                Créer une propriété
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="text-lg font-bold text-blue-600">{studios.length}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="text-lg font-bold text-green-600">
                  {studios.filter(s => s.isAvailable).length}
                </div>
                <div className="text-xs text-gray-600">Disponibles</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="text-lg font-bold text-yellow-600">
                  {studios.filter(s => !s.isAvailable).length}
                </div>
                <div className="text-xs text-gray-600">Occupées</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="text-lg font-bold text-purple-600">
                  {studios.reduce((sum, s) => sum + ((s as any).reservations?.length || 0), 0)}
                </div>
                <div className="text-xs text-gray-600">Réservations</div>
              </div>
            </div>

            {/* Grille des propriétés */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {Array.isArray(studios) && studios.map((studio) => (
                <div key={studio.id} className="relative group">
                  <CardMaisonLocation
                    maison={studio}
                    variant="compact"
                    onFavorite={(id) => console.log('Favorite:', id)}
                    onShare={(id) => console.log('Share:', id)}
                    onContact={() => handleManageCalendar(studio.id)}
                  />
                  
                  {/* Actions de propriétaire */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEdit(studio.id)}
                      className="p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all transform hover:scale-110"
                      title="Modifier"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleToggleAvailability(studio.id, studio.isAvailable)}
                      disabled={operationLoading === studio.id}
                      className={`p-2 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transform hover:scale-110 transition-all ${
                        studio.isAvailable 
                          ? 'bg-green-100/95 text-green-700 hover:bg-green-200/95' 
                          : 'bg-gray-100/95 text-gray-700 hover:bg-gray-200/95'
                      }`}
                      title={studio.isAvailable ? "Marquer comme indisponible" : "Marquer comme disponible"}
                    >
                      {operationLoading === studio.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : studio.isAvailable ? (
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(studio.id)}
                      disabled={operationLoading === studio.id}
                      className="p-2 bg-red-100/95 backdrop-blur-sm rounded-full shadow-md hover:bg-red-200/95 hover:shadow-lg text-red-700 transition-all transform hover:scale-110"
                      title="Supprimer"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
