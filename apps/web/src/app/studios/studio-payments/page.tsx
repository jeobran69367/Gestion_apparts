'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API_BASE_URL from '../../../config/api';

interface Payment {
  id: number;
  amount: number;
  currency: string;
  method: string;
  status: string;
  createdAt: string;
  processedAt: string | null;
}

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

interface Reservation {
  id: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  status: string;
  guest: Guest;
  payments: Payment[];
}

interface StudioStats {
  totalReservations: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface Studio {
  id: number;
  name: string;
  address: string;
  city: string;
  pricePerNight: number;
  isAvailable: boolean;
  photos: string[];
  stats: StudioStats;
  reservations: Reservation[];
}

interface GlobalStats {
  totalStudios: number;
  totalReservations: number;
  totalRevenue: number;
  totalPendingPayments: number;
}

interface StudioPaymentsData {
  globalStats: GlobalStats;
  studios: Studio[];
}

export default function StudioPaymentsPage() {
  const [data, setData] = useState<StudioPaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedStudio, setExpandedStudio] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserRole(parsedUser.role || '');
      } catch {
        // Ignore parsing errors
      }
    }

    fetchStudioPayments(token);
  }, [router]);

  const fetchStudioPayments = async (token: string, start?: string, end?: string) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/payments/studio-payments`;
      const params = new URLSearchParams();
      
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        if (response.status === 401) {
          router.push('/auth/login');
        } else {
          setError('Erreur lors du chargement des données');
        }
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchStudioPayments(token, startDate, endDate);
    }
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    const token = localStorage.getItem('token');
    if (token) {
      fetchStudioPayments(token);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Complété';
      case 'CONFIRMED':
        return 'Confirmé';
      case 'PENDING':
        return 'En attente';
      case 'CANCELLED':
        return 'Annulé';
      case 'FAILED':
        return 'Échoué';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Paiements</h1>
            <p className="text-gray-600 mt-1">
              {userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' 
                ? 'Vue administrateur - Tous vos studios et leurs réservations'
                : 'Vos studios et leurs réservations'}
            </p>
          </div>
          <Link
            href="/studios/my-studios"
            className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            ← Retour aux studios
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filtres de date */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrer par date</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFilter}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Filtrer
              </button>
              <button
                onClick={handleResetFilter}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques globales */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Studios</p>
                  <p className="text-2xl font-bold text-blue-600">{data.globalStats.totalStudios}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Réservations</p>
                  <p className="text-2xl font-bold text-green-600">{data.globalStats.totalReservations}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(data.globalStats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paiements en attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{data.globalStats.totalPendingPayments}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des studios */}
        {data && data.studios.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏠</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun studio trouvé</h3>
            <p className="text-gray-600 mb-4">Vous n{"'"}avez pas encore de studio enregistré.</p>
            <Link
              href="/studios/create"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un studio
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {data?.studios.map((studio) => (
              <div key={studio.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* En-tête du studio */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedStudio(expandedStudio === studio.id ? null : studio.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      {studio.photos && studio.photos.length > 0 ? (
                        <img
                          src={studio.photos[0]}
                          alt={studio.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-2xl">🏠</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{studio.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          studio.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {studio.isAvailable ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{studio.address}, {studio.city}</p>
                      <p className="text-sm font-medium text-blue-600">{formatCurrency(studio.pricePerNight)} / nuit</p>
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{studio.stats.totalReservations}</p>
                        <p className="text-xs text-gray-600">Réservations</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(studio.stats.totalRevenue)}</p>
                        <p className="text-xs text-gray-600">Revenus</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{studio.stats.pendingPayments}</p>
                        <p className="text-xs text-gray-600">En attente</p>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform ${
                          expandedStudio === studio.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Détails des réservations */}
                {expandedStudio === studio.id && (
                  <div className="border-t border-gray-200">
                    {studio.reservations.length === 0 ? (
                      <div className="p-6 text-center text-gray-600">
                        Aucune réservation pour ce studio
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dates
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nuits
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Paiements
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studio.reservations.map((reservation) => (
                              <tr key={reservation.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {reservation.guest.firstName} {reservation.guest.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600">{reservation.guest.email}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <p className="text-sm text-gray-900">
                                    {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                                  </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <p className="text-sm text-gray-900">{reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <p className="font-medium text-gray-900">{formatCurrency(reservation.total)}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                    {getStatusLabel(reservation.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  {reservation.payments.length === 0 ? (
                                    <span className="text-sm text-gray-500">Aucun paiement</span>
                                  ) : (
                                    <div className="space-y-1">
                                      {reservation.payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center gap-2">
                                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                                            {getStatusLabel(payment.status)}
                                          </span>
                                          <span className="text-sm text-gray-900">{formatCurrency(payment.amount)}</span>
                                          <span className="text-xs text-gray-500">({payment.method})</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
