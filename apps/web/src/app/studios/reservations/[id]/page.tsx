"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ReservationDetails {
  id: string;
  studioName: string;
  studioImages: string[];
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  checkIn: string;
  checkOut: string;
  numberOfDays: number;
}

export default function ReservationDetailsPage() {
  const params = useParams();
  const id = params.id; // Récupérer l'ID depuis la route dynamique
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);

  useEffect(() => {
    console.log('ID récupéré:', id); // Log pour vérifier l'ID
    if (id) {
      fetch(`http://localhost:4000/api/reservations/${id}`)
        .then((response) => response.json())
        .then((data) => setReservation(data))
        .catch((error) => console.error('Erreur lors du chargement des détails de la réservation:', error));
    }
  }, [id]);

  if (!reservation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold text-gray-700">Chargement des détails de la réservation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Détails de la réservation</h1>

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">{reservation.studioName}</h2>
          <div className="flex justify-center space-x-4 mt-4">
            {reservation.studioImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Image ${index + 1} de ${reservation.studioName}`}
                className="w-32 h-32 object-cover rounded-md"
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <p><strong>Nom du client :</strong> {reservation.guest.firstName} {reservation.guest.lastName}</p>
          <p><strong>Email :</strong> {reservation.guest.email}</p>
          <p><strong>Téléphone :</strong> {reservation.guest.phone}</p>
          <p><strong>Dates :</strong> {reservation.checkIn} - {reservation.checkOut}</p>
          <p><strong>Nombre de jours :</strong> {reservation.numberOfDays} jours</p>
        </div>
      </div>
    </div>
  );
}
