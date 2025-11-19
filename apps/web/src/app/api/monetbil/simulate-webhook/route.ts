import { NextRequest, NextResponse } from 'next/server';
import { paymentCache } from '@/lib/paymentCache';

// Endpoint pour SIMULER un webhook Monetbil en mode développement
// Utilisez cet endpoint pour tester le cache de statuts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, status, amount, channel, phone } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'paymentId et status requis' },
        { status: 400 }
      );
    }

    console.log(`🧪 Simulation webhook: ${paymentId} → ${status}`);

    // Mapper le statut vers notre format
    const normalizedStatus = mapStatus(status);
    
    // Stocker dans le cache comme si c'était un vrai webhook
    paymentCache.set(paymentId, {
      status: normalizedStatus,
      message: `Statut simulé: ${status} → ${normalizedStatus}`,
      amount: amount ? parseFloat(amount) : undefined,
      channel: channel || 'Simulation',
      phone,
      timestamp: new Date().toISOString(),
      rawData: body
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook simulé avec succès',
      paymentId,
      originalStatus: status,
      normalizedStatus,
      cached: true
    });

  } catch (error) {
    console.error('❌ Erreur simulation webhook:', error);
    return NextResponse.json(
      { error: 'Erreur simulation webhook' },
      { status: 500 }
    );
  }
}

// GET pour lister les instructions d'utilisation
export async function GET() {
  return NextResponse.json({
    title: 'Simulateur de Webhooks Monetbil',
    description: 'Endpoint pour simuler des webhooks Monetbil en développement',
    usage: {
      method: 'POST',
      endpoint: '/api/monetbil/simulate-webhook',
      body: {
        paymentId: 'string (requis) - ID du paiement à mettre à jour',
        status: 'string (requis) - success, failed, pending, cancelled, timeout',
        amount: 'number (optionnel) - montant du paiement',
        channel: 'string (optionnel) - canal de paiement',
        phone: 'string (optionnel) - numéro de téléphone'
      }
    },
    examples: [
      {
        description: 'Marquer un paiement comme réussi',
        curl: `curl -X POST http://localhost:3000/api/monetbil/simulate-webhook \\
-H "Content-Type: application/json" \\
-d '{
  "paymentId": "25092616151118183314",
  "status": "success",
  "amount": 50000,
  "channel": "MTN Mobile Money",
  "phone": "+237690000000"
}'`
      },
      {
        description: 'Marquer un paiement comme échoué',
        curl: `curl -X POST http://localhost:3000/api/monetbil/simulate-webhook \\
-H "Content-Type: application/json" \\
-d '{
  "paymentId": "25092616151118183314",
  "status": "failed"
}'`
      }
    ],
    testFlow: [
      '1. Créer un paiement via POST /api/monetbil/payment',
      '2. Noter le paymentId retourné',
      '3. Simuler le webhook avec ce paymentId via POST /api/monetbil/simulate-webhook',
      '4. Vérifier le statut via GET /api/monetbil/payment?transaction_id=PAYMENT_ID',
      '5. Le statut devrait maintenant venir du cache (source: "webhook_cache")'
    ]
  });
}

// Mapper les statuts vers notre format
function mapStatus(status: string): 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower.includes('success') || statusLower.includes('completed') || statusLower.includes('paid')) {
    return 'SUCCESS';
  }
  if (statusLower.includes('failed') || statusLower.includes('error') || statusLower.includes('declined')) {
    return 'FAILED';
  }
  if (statusLower.includes('cancelled') || statusLower.includes('canceled')) {
    return 'CANCELLED';
  }
  if (statusLower.includes('timeout') || statusLower.includes('expired')) {
    return 'TIMEOUT';
  }
  
  return 'PENDING'; // Par défaut
}
