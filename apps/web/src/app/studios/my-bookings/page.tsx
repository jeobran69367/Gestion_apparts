'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { API_ENDPOINTS } from '@/config/api';

interface Booking {
  id: number;
  studioId: number;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  createdAt: string;
  nights: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  studio: {
    id: number;
    name: string;
    city: string;
    photos: string[];
    address: string;
    pricePerNight: number;
  };
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isLoggedIn, mounted, logout } = useAuth();

  const fetchMyReservations = useCallback(async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(API_ENDPOINTS.RESERVATIONS.MY_RESERVATIONS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setBookings(data.reservations || data || []);
      } else {
        switch (response.status) {
          case 401:
            setError('Session expirée - veuillez vous reconnecter');
            logout();
            router.push('/auth/login');
            break;
          case 404:
            setError('Endpoint non trouvé - contactez le support');
            break;
          case 500:
            setError('Erreur serveur - veuillez réessayer plus tard');
            break;
          default:
            setError(data.message || 'Erreur lors du chargement des réservations');
        }
      }
    } catch (err) {
      console.error('Erreur fetch:', err);
      setError('Impossible de se connecter au serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, [router, logout]);

  useEffect(() => {
    if (!mounted) return;
    
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    fetchMyReservations();
  }, [mounted, isLoggedIn, router, fetchMyReservations]);

  // ... le reste de votre code reste inchangé ...
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmée';
      case 'PENDING':
        return 'En attente';
      case 'CANCELLED':
        return 'Annulée';
      case 'COMPLETED':
        return 'Terminée';
      case 'NO_SHOW':
        return 'No Show';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2);
  };

  const retryFetch = () => {
    setLoading(true);
    fetchMyReservations();
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Réservations</h1>
            <p className="text-gray-600 mt-2">Gérez vos réservations de studios</p>
          </div>
          
          <Link
            href="/studios"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Découvrir des studios
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={retryFetch}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        )}

        {bookings.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8">
              <div className="w-20 h-20 mx-auto mb-6 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 8.5V20a2 2 0 002 2h4a2 2 0 002-2v-8.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 10h12l-1 10H7l-1-10z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Aucune réservation</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore effectué de réservation.</p>
              <Link
                href="/studios"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-medium"
              >
                <span>🏠</span>
                Réserver un studio
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="md:flex">
                  {/* Image du studio */}
                  <div className="md:w-1/3">
                    {booking.studio.photos && booking.studio.photos.length > 0 ? (
                      <img
                        src={booking.studio.photos[0]}
                        alt={booking.studio.name}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center">
                        <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20" className="text-gray-400">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Détails de la réservation */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {booking.studio.name}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-1">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {booking.studio.city}
                        </p>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">Dates</h4>
                        <p className="text-sm text-gray-600">
                          Du {formatDate(booking.checkIn)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Au {formatDate(booking.checkOut)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.nights} nuit{booking.nights > 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">Invités</h4>
                        <p className="text-sm text-gray-600">
                          {booking.guestCount} personne{booking.guestCount > 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">Total</h4>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatPrice(booking.total)}Fcfa
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Réservé le {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link
                          href={`/studios/${booking.studio.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Voir le studio
                        </Link>
                        
                        {booking.status === 'CONFIRMED' && (
                          <button className="text-red-600 hover:text-red-800 font-medium text-sm">
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques rapides */}
        {bookings.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistiques</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {bookings.length}
                </div>
                <div className="text-sm text-gray-600">Total réservations</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'CONFIRMED').length}
                </div>
                <div className="text-sm text-gray-600">Confirmées</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPrice(bookings.reduce((sum, b) => sum + b.total, 0))}Fcfa
                </div>
                <div className="text-sm text-gray-600">Total dépensé</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}