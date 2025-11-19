import { NextRequest, NextResponse } from 'next/server';

// API pour créer ou confirmer une réservation
export async function POST(request: NextRequest) {
  try {
    const {
      paymentId,
      studioId,
      guestId,
      checkIn,
      checkOut,
      nights,
      guestCount = 1,
      subtotal,
      cleaningFee = 0,
      serviceFee = 0,
      taxes = 0,
      total,
      specialRequests,
      guestInfo
    } = await request.json();

    console.log('🏨 Création de réservation:', {
      paymentId,
      studioId,
      guestId,
      checkIn,
      checkOut,
      total
    });

    if (!paymentId || !studioId || !checkIn || !checkOut || !total) {
      return NextResponse.json({
        success: false,
        error: 'Données manquantes pour la réservation'
      }, { status: 400 });
    }

    // Pour la démo, on simule la création de réservation
    // En production, vous devriez appeler votre API NestJS backend
    const reservationData = {
      id: `RES_${Date.now()}`,
      paymentId,
      studioId: parseInt(studioId),
      guestId: guestId || 1, // User par défaut pour demo
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      nights: nights || calculateNights(checkIn, checkOut),
      guestCount,
      subtotal: subtotal || total,
      cleaningFee,
      serviceFee,
      taxes,
      total: parseInt(total),
      status: 'CONFIRMED', // Directement confirmé puisque le paiement est réussi
      specialRequests: specialRequests || null,
      guestInfo: guestInfo || {},
      createdAt: new Date().toISOString()
    };

    console.log('✅ Réservation créée avec succès:', reservationData.id);

    // SIMULATION: En production, ici vous feriez :
    // 1. Appel à votre API backend NestJS pour créer la réservation
    // 2. Mise à jour du statut du paiement
    // 3. Envoi d'emails de confirmation
    
    // Exemple d'appel backend :
    /*
    const backendResponse = await fetch('http://localhost:4000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reservationData)
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Réservation créée avec succès',
      reservation: reservationData,
      next_steps: [
        'Email de confirmation envoyé',
        'Studio bloqué pour les dates demandées',
        'Propriétaire notifié'
      ]
    });

  } catch (error) {
    console.error('❌ Erreur création réservation:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne lors de la création de réservation'
    }, { status: 500 });
  }
}

// GET pour récupérer une réservation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const reservationId = searchParams.get('reservationId');

    if (!paymentId && !reservationId) {
      return NextResponse.json({
        success: false,
        error: 'paymentId ou reservationId requis'
      }, { status: 400 });
    }

    // SIMULATION: En production, récupérer depuis votre base de données
    const mockReservation = {
      id: reservationId || `RES_${paymentId}`,
      paymentId: paymentId,
      studioId: 1,
      guestId: 1,
      status: 'CONFIRMED',
      checkIn: '2025-09-30',
      checkOut: '2025-10-05',
      total: 25000,
      message: 'Réservation confirmée - Simulation'
    };

    return NextResponse.json({
      success: true,
      reservation: mockReservation
    });

  } catch (error) {
    console.error('❌ Erreur récupération réservation:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne'
    }, { status: 500 });
  }
}

// Fonction utilitaire pour calculer le nombre de nuits
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
