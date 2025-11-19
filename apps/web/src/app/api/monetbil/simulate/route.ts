import { NextRequest, NextResponse } from 'next/server';

/**
 * API pour SIMULER des webhooks Monetbil en développement
 * Cette route permet de tester manuellement les paiements sans attendre les vrais webhooks
 */

export async function POST(request: NextRequest) {
  try {
    const { paymentId, status = 'SUCCESS', amount, phone } = await request.json();

    if (!paymentId) {
      return NextResponse.json({
        error: 'paymentId requis'
      }, { status: 400 });
    }

    console.log(`🎭 SIMULATION webhook Monetbil pour: ${paymentId} → ${status}`);

    // Créer un faux webhook exactement comme Monetbil l'enverrait
    const fakeWebhookData = {
      status: status.toUpperCase(),
      transaction_id: paymentId,
      item_ref: paymentId,
      amount: amount || '25000',
      currency: 'XAF',
      phone: phone || '+237600000000',
      channel: 'MTN_MOMO',
      timestamp: new Date().toISOString(),
      // Données supplémentaires que Monetbil pourrait envoyer
      operator: 'MTN',
      country: 'CM',
      payment_method: 'momo',
      service_name: 'Mon Appart',
      // Simuler les données de réservation
      metadata: {
        reservationData: {
          studioId: 1,
          checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          nights: 4,
          guestCount: 2,
          guestInfo: {
            name: 'Client Test',
            email: 'test@example.com',
            phone: phone || '+237600000000'
          },
          specialRequests: 'Paiement simulé pour test'
        }
      }
    };

    console.log('📦 Données webhook simulées:', JSON.stringify(fakeWebhookData, null, 2));

    // Appeler notre propre webhook avec les données simulées
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/monetbil/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Simulation': 'true', // Marquer comme simulation
      },
      body: JSON.stringify(fakeWebhookData)
    });

    const webhookResult = await webhookResponse.json();

    if (webhookResponse.ok) {
      console.log(`✅ Webhook simulé avec succès pour ${paymentId}`);
      
      return NextResponse.json({
        success: true,
        message: `Webhook ${status} simulé avec succès pour ${paymentId}`,
        paymentId,
        status,
        simulatedData: fakeWebhookData,
        webhookResponse: webhookResult
      });
    } else {
      console.error(`❌ Erreur webhook simulé:`, webhookResult);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de l\'appel au webhook simulé',
        webhookError: webhookResult
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erreur simulation webhook Monetbil:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de simulation webhook Monetbil',
    usage: {
      method: 'POST',
      body: {
        paymentId: 'ID du paiement à simuler (obligatoire)',
        status: 'SUCCESS|FAILED|CANCELLED (défaut: SUCCESS)',
        amount: 'Montant en FCFA (défaut: 25000)',
        phone: 'Numéro de téléphone (défaut: +237600000000)'
      }
    },
    example: {
      paymentId: '25092617045117731526',
      status: 'SUCCESS',
      amount: '30000',
      phone: '+237677123456'
    }
  });
}
