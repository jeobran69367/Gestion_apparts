// app/api/pawapay/check-deposit/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Validate environment variables at runtime
if (!process.env.PAWAPAY_API_KEY) {
  throw new Error('❌ PAWAPAY_API_KEY is missing. Please set it in the environment variables.');
}

export async function GET(request: NextRequest) {
  const depositId = request.nextUrl.searchParams.get("depositId");

  if (!depositId) {
    return NextResponse.json(
      { error: 'depositId requis' },
      { status: 400 }
    );
  }

  // Validation du format UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(depositId)) {
    return NextResponse.json(
      { error: 'Format depositId invalide. Doit être un UUID.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.PAWAPAY_API_KEY;
  const environment = process.env.PAWAPAY_ENVIRONMENT || 'sandbox';

  const apiUrl = environment === 'production' 
    ? `https://api.pawapay.io/v2/deposits/${depositId}`
    : `https://api.sandbox.pawapay.io/v2/deposits/${depositId}`;

  try {
    console.log('🔍 Vérification statut PawaPay pour:', depositId);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'StudioBooking/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('📭 Dépôt non trouvé:', depositId);
        return NextResponse.json({
          status: 'NOT_FOUND',
          message: 'Dépôt non trouvé'
        }, { status: 404 });
      }

      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erreur API PawaPay:', response.status, errorData);

      return NextResponse.json(
        { 
          error: `Erreur ${response.status}`,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('✅ Réponse vérification PawaPay:', {
      depositId: data.depositId,
      status: data.status,
      amount: data.amount,
      currency: data.currency
    });

    // ⚠️ CORRECTION : Format de réponse standardisé selon la documentation
    const formattedResponse = {
      depositId: data.depositId,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      payer: data.payer,
      clientReferenceId: data.clientReferenceId,
      mnoTransactionId: data.mnoTransactionId,
      completedAt: data.completedAt,
      failureReason: data.failureReason,
      metadata: data.metadata,
      checkedAt: new Date().toISOString()
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('💥 Erreur de réseau vérification PawaPay:', error);
    return NextResponse.json(
      { 
        error: 'Erreur de réseau',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}