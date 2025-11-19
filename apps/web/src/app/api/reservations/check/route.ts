import { NextRequest, NextResponse } from 'next/server';

/**
 * API pour vérifier l'état d'une réservation par paymentId
 * Permet de vérifier si un paiement a bien créé une réservation
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({
        error: 'paymentId requis'
      }, { status: 400 });
    }

    console.log(`🔍 Vérification réservation pour paiement: ${paymentId}`);

    // Vérifier dans le backend NestJS
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/reservations/by-payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const reservation = await response.json();
        console.log(`✅ Réservation trouvée:`, reservation);
        
        return NextResponse.json({
          found: true,
          reservation,
          message: 'Réservation trouvée avec succès'
        });
      } else if (response.status === 404) {
        console.log(`❌ Aucune réservation trouvée pour ${paymentId}`);
        return NextResponse.json({
          found: false,
          message: 'Aucune réservation trouvée pour ce paiement'
        });
      } else {
        throw new Error(`Erreur backend: ${response.status}`);
      }
    } catch (backendError) {
      console.error('❌ Erreur contact backend:', backendError);
      
      // Fallback : vérifier dans notre cache local
      const { paymentCache } = await import('@/lib/paymentCache');
      const cachedPayment = paymentCache.get(paymentId);
      
      return NextResponse.json({
        found: false,
        message: 'Backend inaccessible - vérification dans le cache local',
        cachedPayment,
        backendError: String(backendError),
        suggestion: 'Vérifiez que le backend NestJS est démarré sur le port 3001'
      });
    }

  } catch (error) {
    console.error('❌ Erreur vérification réservation:', error);
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({
        error: 'paymentId requis'
      }, { status: 400 });
    }

    console.log(`🔄 Forcer la création de réservation pour: ${paymentId}`);

    // Forcer l'appel à l'API de création complète
    const completeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bookings/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        forceCreate: true,
        // Données par défaut pour le test
        studioId: 1,
        checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        nights: 4,
        guestCount: 2,
        guestInfo: {
          name: 'Client Test Force',
          email: 'forcetest@example.com',
          phone: '+237600000000'
        },
        specialRequests: 'Réservation créée manuellement',
        autoCreateUser: true
      })
    });

    if (completeResponse.ok) {
      const result = await completeResponse.json();
      console.log(`✅ Réservation forcée créée:`, result);
      
      return NextResponse.json({
        success: true,
        message: 'Réservation créée avec succès',
        result
      });
    } else {
      const error = await completeResponse.text();
      console.error(`❌ Erreur création forcée:`, error);
      
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la création forcée',
        details: error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erreur création forcée réservation:', error);
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: String(error)
    }, { status: 500 });
  }
}
