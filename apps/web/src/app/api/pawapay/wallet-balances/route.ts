// app/api/pawapay/wallet-balances/route.ts
import { NextResponse } from 'next/server';

// Configuration constants
const REQUEST_TIMEOUT_MS = 15000;

export async function GET() {
  const apiKey = process.env.PAWAPAY_API_KEY;
  const environment = process.env.PAWAPAY_ENVIRONMENT || 'sandbox';

  if (!apiKey) {
    console.error('❌ PAWAPAY_API_KEY manquante');
    return NextResponse.json(
      {
        error: 'Configuration manquante',
        message: 'Service de paiement temporairement indisponible',
      },
      { status: 503 }
    );
  }

  // PawaPay wallet balances endpoint
  const baseUrl =
    environment === 'production'
      ? 'https://api.pawapay.io'
      : 'https://api.sandbox.pawapay.io';
  
  const apiUrl = `${baseUrl}/wallet-balances`;

  // Timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    console.log('🔍 Récupération des soldes wallet PawaPay...');
    console.log('📡 URL:', apiUrl);
    console.log('🌍 Environment:', environment);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await response.text();
    console.log('📥 Response status:', response.status);
    console.log('📥 Response body:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('❌ Failed to parse response as JSON');
      return NextResponse.json(
        {
          error: 'Erreur de format',
          message: 'Réponse invalide du service de paiement',
          details: responseText,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error('❌ Erreur API PawaPay wallet-balances:', response.status, data);

      // Handle specific error codes from PawaPay
      const errorMessage = 
        data.failureReason?.failureMessage ||
        data.message ||
        data.error ||
        'Erreur lors de la récupération des soldes';

      return NextResponse.json(
        {
          error: `Erreur ${response.status}`,
          message: errorMessage,
          details: data,
        },
        { status: response.status }
      );
    }

    console.log('✅ Soldes wallet récupérés:', JSON.stringify(data, null, 2));

    // PawaPay returns an array of wallet balances
    // Ensure we return a consistent format
    if (Array.isArray(data)) {
      return NextResponse.json(data);
    } else if (data.balances && Array.isArray(data.balances)) {
      return NextResponse.json(data.balances);
    } else {
      return NextResponse.json(data);
    }
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('⏳ Timeout atteint');
      return NextResponse.json(
        {
          error: 'Timeout',
          message: 'La requête a pris trop de temps. Veuillez réessayer.',
        },
        { status: 504 }
      );
    }

    console.error('💥 Erreur de réseau wallet-balances:', error);
    return NextResponse.json(
      {
        error: 'Erreur de réseau',
        message: 'Impossible de se connecter au service de paiement.',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
