import { NextRequest, NextResponse } from 'next/server';
import { paymentCache } from '@/lib/paymentCache';

/**
 * API pour forcer le marquage d'un paiement comme RÉUSSI
 * Utile pour les paiements déjà effectués sur Monetbil mais non détectés
 */

export async function POST(request: NextRequest) {
  try {
    const { paymentId, amount = 1, phone = '+237654179233' } = await request.json();

    if (!paymentId) {
      return NextResponse.json({
        error: 'paymentId requis'
      }, { status: 400 });
    }

    console.log(`🎯 FORCER le statut SUCCESS pour: ${paymentId}`);

    // Marquer directement comme SUCCESS dans le cache
    paymentCache.set(paymentId, {
      status: 'SUCCESS',
      message: 'Paiement forcé comme réussi - Créé manuellement',
      amount: parseFloat(amount),
      channel: 'MTN_MOMO',
      phone,
      timestamp: new Date().toISOString(),
      rawData: {
        status: 'SUCCESS',
        transaction_id: paymentId,
        item_ref: paymentId,
        amount: amount.toString(),
        currency: 'XAF',
        phone,
        channel: 'MTN_MOMO',
        timestamp: new Date().toISOString(),
        forced: true,
        metadata: {
          reservationData: {
            studioId: 1,
            checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            nights: 4,
            guestCount: 2,
            guestInfo: {
              name: 'Client Forcé',
              email: 'force@example.com',
              phone: phone
            },
            specialRequests: 'Paiement forcé manuellement'
          }
        }
      }
    });

    console.log(`✅ Statut SUCCESS forcé pour ${paymentId}`);

    // Tenter de créer la réservation complète
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const completeResponse = await fetch(`${baseUrl}/api/bookings/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          studioId: 1,
          checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          nights: 4,
          guestCount: 2,
          guestInfo: {
            name: 'Client Forcé',
            email: 'force@example.com',
            phone: phone
          },
          specialRequests: 'Paiement forcé manuellement',
          autoCreateUser: true,
          forceCreate: true
        })
      });

      let reservationResult = null;
      if (completeResponse.ok) {
        reservationResult = await completeResponse.json();
        console.log(`🏨 Réservation créée automatiquement:`, reservationResult);
      } else {
        const error = await completeResponse.text();
        console.warn(`⚠️ Impossible de créer la réservation:`, error);
      }

      // Notifier le changement de statut
      try {
        const notifyResponse = await fetch(`${baseUrl}/api/payment-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            status: 'SUCCESS',
            reservationId: reservationResult?.reservation?.id,
            userId: reservationResult?.user?.id
          })
        });

        if (notifyResponse.ok) {
          console.log(`📢 Notification envoyée pour ${paymentId}`);
        }
      } catch (notifyError) {
        console.warn('⚠️ Erreur notification:', notifyError);
      }

      return NextResponse.json({
        success: true,
        message: `Paiement ${paymentId} forcé comme SUCCESS`,
        paymentId,
        cached: true,
        reservation: reservationResult,
        cache_status: 'SUCCESS',
        timestamp: new Date().toISOString()
      });

    } catch (reservationError) {
      console.warn('⚠️ Erreur création réservation automatique:', reservationError);
      
      return NextResponse.json({
        success: true,
        message: `Paiement ${paymentId} forcé comme SUCCESS (réservation manuelle requise)`,
        paymentId,
        cached: true,
        cache_status: 'SUCCESS',
        reservation_error: String(reservationError),
        timestamp: new Date().toISOString(),
        note: 'Utilisez /api/reservations/check pour créer la réservation manuellement'
      });
    }

  } catch (error) {
    console.error('❌ Erreur forcage statut:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API pour forcer le statut de paiement',
    usage: {
      method: 'POST',
      body: {
        paymentId: 'ID du paiement (obligatoire)',
        amount: 'Montant en FCFA (défaut: 1)',
        phone: 'Numéro de téléphone (défaut: +237654179233)'
      }
    },
    example: {
      paymentId: '25092617045117731526',
      amount: '1',
      phone: '+237654179233'
    },
    note: 'Cette API marque directement le paiement comme SUCCESS dans le cache et tente de créer la réservation'
  });
}
