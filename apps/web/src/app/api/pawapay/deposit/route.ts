// app/api/pawapay/deposit/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  const apiKey = process.env.PAWAPAY_API_KEY; 
  const environment = process.env.PAWAPAY_ENVIRONMENT || 'sandbox';

  if (!apiKey) {
    console.error('❌ PAWAPAY_API_KEY manquante');
    return NextResponse.json(
      { 
        error: 'Configuration manquante',
        message: 'Service de paiement temporairement indisponible'
      },
      { status: 503 }
    );
  }
   
  let body;
  try {
    body = await request.json();
    console.log('📥 Requête reçue:', JSON.stringify(body, null, 2));
  } catch (error) {
    console.error('❌ Erreur de parsing JSON:', error);
    return NextResponse.json(
      { error: 'Format de requête invalide', message: 'Le corps de la requête doit être un JSON valide.' },
      { status: 400 }
    );
  }

  // ⚠️ CORRECTION : Extraction selon la structure attendue du frontend
  const { 
    depositId,
    amount, // ⚠️ Doit être une string directement
    currency,
    payer,
    clientReferenceId,
    customerMessage,
    metadata
  } = body;

  // Validation des champs requis selon la documentation PawaPay
  if (!depositId) {
    console.error('❌ depositId manquant');
    return NextResponse.json(
      { 
        error: 'depositId manquant',
        message: 'Le depositId est obligatoire.'
      },
      { status: 400 }
    );
  }

  if (!amount) {
    console.error('❌ amount manquant');
    return NextResponse.json(
      { 
        error: 'amount manquant',
        message: 'Le montant est obligatoire.'
      },
      { status: 400 }
    );
  }

  if (!currency) {
    console.error('❌ currency manquant');
    return NextResponse.json(
      { 
        error: 'currency manquant',
        message: 'La devise est obligatoire.'
      },
      { status: 400 }
    );
  }

  if (!payer) {
    console.error('❌ payer manquant');
    return NextResponse.json(
      { 
        error: 'payer manquant',
        message: 'Les informations du payeur sont obligatoires.'
      },
      { status: 400 }
    );
  }

  // Validation du type de payer
  if (payer.type !== 'MMO') {
    console.error('❌ Type de payer invalide:', payer.type);
    return NextResponse.json(
      { 
        error: 'Type de payer invalide',
        message: 'Le type de payer doit être "MMO"'
      },
      { status: 400 }
    );
  }

  // Validation des détails du compte
  if (!payer.accountDetails?.phoneNumber) {
    console.error('❌ phoneNumber manquant');
    return NextResponse.json(
      { 
        error: 'Numéro de téléphone manquant',
        message: 'Le numéro de téléphone est obligatoire.'
      },
      { status: 400 }
    );
  }

  if (!payer.accountDetails?.provider) {
    console.error('❌ provider manquant');
    return NextResponse.json(
      { 
        error: 'Opérateur manquant',
        message: 'L\'opérateur mobile est obligatoire.'
      },
      { status: 400 }
    );
  }

  // Validation du montant (doit être une string)
  if (typeof amount !== 'string') {
    console.error('❌ Format de montant invalide:', { amount, type: typeof amount });
    return NextResponse.json(
      { 
        error: 'Format de montant invalide',
        message: 'Le montant doit être une chaîne de caractères'
      },
      { status: 400 }
    );
  }

  // Validation numérique du montant
  const amountNumber = parseInt(amount, 10);
  if (isNaN(amountNumber) || !Number.isInteger(amountNumber) || amountNumber <= 0) {
    console.error('❌ Montant numérique invalide:', { 
      amountString: amount, 
      parsed: amountNumber
    });
    return NextResponse.json(
      { 
        error: 'Montant invalide',
        message: 'Le montant doit être un nombre entier positif'
      },
      { status: 400 }
    );
  }

  // Validation de la devise
  const validCurrencies = ['XAF', 'ZMW', 'GHS', 'NGN', 'UGX', 'RWF', 'MWK', 'USD', 'EUR'];
  if (!validCurrencies.includes(currency)) {
    console.error('❌ Devise non supportée:', currency);
    return NextResponse.json(
      { 
        error: 'Devise non supportée',
        message: `Devise ${currency} non supportée. Devises valides: ${validCurrencies.join(', ')}`
      },
      { status: 400 }
    );
  }

  // Nettoyage du numéro de téléphone
  const cleanPhoneNumberForPawaPay = (phone: string): string => {
    // Supprimer tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '');
    // Supprimer le préfixe international si présent (ex: +237, 237)
    if (cleaned.startsWith('237') && cleaned.length > 9) {
      return cleaned.substring(3);
    }
    return cleaned;
  };

  const cleanedPhoneNumber = cleanPhoneNumberForPawaPay(payer.accountDetails.phoneNumber);

  // Validation du numéro nettoyé
  if (cleanedPhoneNumber.length < 9) {
    console.error('❌ Numéro de téléphone invalide après nettoyage:', {
      original: payer.accountDetails.phoneNumber,
      cleaned: cleanedPhoneNumber
    });
    return NextResponse.json(
      { 
        error: 'Numéro de téléphone invalide',
        message: 'Le numéro de téléphone doit contenir au moins 9 chiffres après nettoyage'
      },
      { status: 400 }
    );
  }

  // ⚠️ CORRECTION CRUCIALE : Construction du payload EXACT selon la documentation PawaPay
  const pawapayPayload: any = {
    depositId,
    amount: amount, // ⚠️ String directement à la racine
    currency: currency, // ⚠️ Devise directement à la racine
    payer: {
      type: 'MMO',
      accountDetails: {
        phoneNumber: cleanedPhoneNumber,
        provider: payer.accountDetails.provider
      }
    }
  };

  // Ajout des champs optionnels seulement s'ils sont présents
  if (clientReferenceId) {
    pawapayPayload.clientReferenceId = clientReferenceId;
  } else {
    pawapayPayload.clientReferenceId = `STUDIO-${Date.now()}`;
  }

  if (customerMessage) {
    pawapayPayload.customerMessage = customerMessage.substring(0, 22);
  } else {
    pawapayPayload.customerMessage = 'Réservation studio';
  }

  // ⚠️ CORRECTION : metadata doit être un tableau d'objets
  if (metadata && Array.isArray(metadata)) {
    pawapayPayload.metadata = metadata;
  } else {
    pawapayPayload.metadata = [
      {
        orderId: `booking-${Date.now()}`,
        service: 'studio-booking',
        timestamp: new Date().toISOString()
      }
    ];
  }

  console.log('👀 Payload FINAL pour PawaPay:', JSON.stringify(pawapayPayload, null, 2));

  const apiUrl = environment === 'production' 
    ? 'https://api.pawapay.io/v2/deposits' 
    : 'https://api.sandbox.pawapay.io/v2/deposits';

  console.log('🌐 URL API:', apiUrl);

  // Ajout d'un timeout pour les requêtes
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // Timeout de 15 secondes

  try {
    console.log('🚀 Envoi requête à PawaPay...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'StudioBooking/1.0'
      },
      body: JSON.stringify(pawapayPayload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - startTime;
    
    let responseData;
    const responseText = await response.text();
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Réponse non-JSON de PawaPay:', responseText);
      responseData = { rawResponse: responseText };
    }

    console.log(`⏱️ Temps de réponse PawaPay: ${responseTime}ms`, {
      status: response.status,
      statusText: response.statusText,
      response: responseData
    });

    if (!response.ok) {
      console.error('❌ Erreur PawaPay détaillée:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        response: responseData,
        payload: pawapayPayload
      });

      // Extraction du message d'erreur
      let errorMessage = 'Erreur lors du traitement du paiement';
      
      if (responseData.details?.failureReason?.failureMessage) {
        errorMessage = responseData.details.failureReason.failureMessage;
      } else if (responseData.failureReason?.failureMessage) {
        errorMessage = responseData.failureReason.failureMessage;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      }

      return NextResponse.json(
        { 
          error: `Erreur ${response.status}`,
          message: errorMessage,
          details: responseData
        },
        { status: response.status }
      );
    }

    console.log('✅ Réponse PawaPay réussie:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;

    console.error('💥 Erreur complète:', {
      error,
      responseTime,
      apiUrl,
      payload: pawapayPayload
    });

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('⏳ Timeout atteint pour la requête à PawaPay');
        return NextResponse.json(
          {
            error: 'Timeout',
            message: 'La requête a pris trop de temps. Veuillez réessayer.'
          },
          { status: 504 }
        );
      }

      console.error('💥 Erreur réseau ou interne:', error.message);
      return NextResponse.json(
        {
          error: 'Erreur de connexion',
          message: 'Impossible de se connecter au service de paiement. Veuillez vérifier votre connexion et réessayer.',
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    console.error('💥 Erreur inconnue:', error);
    return NextResponse.json(
      {
        error: 'Erreur interne du serveur',
        message: 'Une erreur inattendue est survenue. Veuillez réessayer.'
      },
      { status: 500 }
    );
  }
}