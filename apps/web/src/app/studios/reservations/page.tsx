'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import API_BASE_URL from '../../../config/api';

interface Reservation {
  id: string;
  studioId: string;
  guest: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  checkIn: string;
  checkOut: string;
  studioName: string;
  studioImages: string[];
  numberOfDays: number;
}

interface Studio {
  id: number;
  name: string;
}

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [formData, setFormData] = useState({
    studioId: '',
    guestId: '',
    startDate: '',
    endDate: '',
    guestName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isLoggedIn, isAdmin, mounted } = useAuth();

  useEffect(() => {
    if (!mounted) return;

    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    if (!isAdmin) {
      router.push('/studios');
      return;
    }

    fetchReservations();
    fetchStudios(); 
    fetchGuests();
  }, [mounted, isLoggedIn, isAdmin, router]);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservations`);
      if (response.ok) {
        const data: Reservation[] = await response.json();
        setReservations(data);
      } else {
        setError('Erreur lors du chargement des réservations.');
      }
    } catch (err) {
      setError('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/studios`);
      if (response.ok) {
        const data = await response.json();
        
        // S'adapter à la structure de votre API
        if (Array.isArray(data.studios)) {
          setStudios(data.studios);
        } else if (Array.isArray(data)) {
          setStudios(data);
        } else {
          setStudios([]);
        }
      } else {
        setError('Erreur lors du chargement des studios.');
      }
    } catch (err) {
      setError('Erreur de connexion.');
    }
  };

  const fetchGuests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      } else {
        setError('Erreur lors du chargement des invités.');
      }
    } catch (err) {
      setError('Erreur de connexion.');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation stricte des données
    if (!formData.studioId || !formData.startDate || !formData.endDate || !formData.guestId) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    const reservationData = {
      studioId: parseInt(formData.studioId, 10),
      checkIn: new Date(formData.startDate).toISOString(),
      checkOut: new Date(formData.endDate).toISOString(),
      guestId: parseInt(formData.guestId, 10),
    };


    try {
      const response = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      if (response.ok) {
        setSuccess('Réservation créée avec succès.');
        setFormData({ studioId: '', guestId: '', startDate: '', endDate: '', guestName: '' });
        fetchReservations();
      } else {
        const errorData = await response.json();
        console.error('Erreur API:', errorData); // Log pour les erreurs de l'API
        setError(`Erreur API: ${errorData.message || 'Erreur inconnue'}`);
      }
    } catch (err) {
      console.error('Erreur de connexion:', err); // Log pour les erreurs de connexion
      setError('Erreur de connexion.');
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Réservations</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Liste des réservations</h2>
      
      {reservations.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Aucune réservation trouvée.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations.map((reservation) => (
            <li
              key={reservation.id}
              className="p-4 bg-white border border-gray-300 rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow w-64"
            >
              <Link href={`/studios/reservations/${reservation.id}`}>
                <div className="w-full">
                  {reservation.studioImages && reservation.studioImages.length > 0 ? (
                    <img
                      src={reservation.studioImages[0]}
                      alt={`Image de ${reservation.studioName}`}
                      className="w-full h-32 object-cover rounded-t-md"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-t-md">
                      <span className="text-gray-500">Aucune image</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow text-center mt-4">
                  <p className="text-md font-bold text-gray-800">{reservation.studioName}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Dates :</strong> {reservation.checkIn} - {reservation.checkOut}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Nombre de jours :</strong> {reservation.numberOfDays} jours
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-6">Créer une réservation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SELECT CORRIGÉ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Studio
          </label>
          <select
            name="studioId"
            value={formData.studioId}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
            required
          >
            <option value="">Sélectionnez un studio</option>
            {studios.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name} (ID: {studio.id})
              </option>
            ))}
          </select>
        </div>

        {/* Sélection de l'invité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invité
          </label>
          <select
            name="guestId"
            value={formData.guestId}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
            required
          >
            <option value="">Sélectionnez un invité</option>
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.firstName} {guest.lastName} (ID: {guest.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
            required
            min={new Date().toISOString().split('T')[0]} // Bloque les dates passées
            onKeyDown={(e) => e.preventDefault()} // Empêche la saisie manuelle
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
            required
            min={formData.startDate || new Date().toISOString().split('T')[0]} // Bloque les dates avant la date de début
            onKeyDown={(e) => e.preventDefault()} // Empêche la saisie manuelle
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={!formData.studioId || !formData.startDate || !formData.endDate || !formData.guestId}
        >
          Créer la réservation
        </button>
      </form>
    </div>
  );
}