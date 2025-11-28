// app/api/pawapay/wallet-balances/route.ts
import { NextResponse } from 'next/server';

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

  const apiUrl =
    environment === 'production'
      ? 'https://api.pawapay.io/v2/finances/wallet-balances'
      : 'https://api.sandbox.pawapay.io/v2/finances/wallet-balances';

  try {
    console.log('🔍 Récupération des soldes wallet PawaPay...');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erreur API PawaPay wallet-balances:', response.status, errorData);

      return NextResponse.json(
        {
          error: `Erreur ${response.status}`,
          message: errorData.message || 'Erreur lors de la récupération des soldes',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Soldes wallet récupérés:', JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
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
