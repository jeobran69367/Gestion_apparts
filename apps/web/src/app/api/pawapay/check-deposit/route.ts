// app/api/pawapay/check-deposit/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

  const depositId = request.nextUrl.searchParams.get("depositId");

  if (!depositId) {
    return NextResponse.json(
      { error: 'depositId requis' },
      { status: 400 }
    );
  }

  const apiUrl = environment === 'production' 
    ? `https://api.pawapay.io/v2/deposits/${depositId}`
    : `https://api.sandbox.pawapay.io/v2/deposits/${depositId}`;

  try {
    console.log('🔍 Vérification statut PawaPay pour:', depositId);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
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

    console.log('✅ Réponse COMPLÈTE PawaPay:', JSON.stringify(data, null, 2));

    // ⚠️ CORRECTION CRUCIALE : La réponse a une structure différente
    // PawaPay retourne { status: "FOUND", data: { ... } }
    if (data.status === "FOUND" && data.data) {
      // On retourne les données du dépôt directement
      const depositData = data.data;
      
      console.log('📊 Données du dépôt:', {
        depositId: depositData.depositId,
        status: depositData.status,
        amount: depositData.amount,
        currency: depositData.currency
      });

      const formattedResponse = {
        depositId: depositData.depositId,
        status: depositData.status, // ⚠️ C'est le statut réel du dépôt (COMPLETED, PENDING, etc.)
        amount: depositData.amount,
        currency: depositData.currency,
        payer: depositData.payer,
        clientReferenceId: depositData.clientReferenceId,
        mnoTransactionId: depositData.providerTransactionId, // ⚠️ Correction du nom
        completedAt: depositData.created, // ⚠️ Utiliser 'created' comme completedAt
        failureReason: depositData.failureReason,
        metadata: depositData.metadata,
        checkedAt: new Date().toISOString(),
        // Ajout des champs supplémentaires pour le debug
        rawStatus: data.status, // "FOUND"
        hasData: !!data.data
      };

      return NextResponse.json(formattedResponse);
    } else {
      // Cas où le dépôt n'est pas trouvé ou autre statut
      console.log('📭 Dépôt non trouvé ou statut inattendu:', data);
      return NextResponse.json({
        status: data.status || 'UNKNOWN',
        message: 'Dépôt non trouvé ou statut inattendu',
        rawResponse: data
      }, { status: 404 });
    }

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