// app/api/pawapay/deposit/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const apiKey = process.env.PAWAPAY_API_KEY;
  const environment = process.env.PAWAPAY_ENVIRONMENT || "sandbox";

  if (!apiKey) {
    console.error("❌ PAWAPAY_API_KEY manquante");
    return NextResponse.json(
      {
        error: "Configuration manquante",
        message: "Service de paiement temporairement indisponible",
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error("❌ Erreur de parsing JSON:", error);
    return NextResponse.json(
      {
        error: "Format de requête invalide",
        message: "Le corps de la requête doit être un JSON valide.",
      },
      { status: 400 }
    );
  }

  // Extraction des données
  const {
    depositId,
    amount,
    currency,
    payer,
    clientReferenceId,
    customerMessage,
    metadata,
  } = body;

  // Validation des champs requis
  if (!depositId) {
    return NextResponse.json(
      { error: "depositId manquant", message: "Le depositId est obligatoire." },
      { status: 400 }
    );
  }

  if (!amount) {
    return NextResponse.json(
      { error: "amount manquant", message: "Le montant est obligatoire." },
      { status: 400 }
    );
  }

  if (!currency) {
    return NextResponse.json(
      { error: "currency manquant", message: "La devise est obligatoire." },
      { status: 400 }
    );
  }

  if (!payer?.accountDetails?.phoneNumber) {
    return NextResponse.json(
      {
        error: "Numéro de téléphone manquant",
        message: "Le numéro de téléphone est obligatoire.",
      },
      { status: 400 }
    );
  }

  if (!payer?.accountDetails?.provider) {
    return NextResponse.json(
      {
        error: "Opérateur manquant",
        message: "L'opérateur mobile est obligatoire.",
      },
      { status: 400 }
    );
  }

  // Validation du format du montant
  if (typeof amount !== "string") {
    return NextResponse.json(
      {
        error: "Format de montant invalide",
        message: "Le montant doit être une chaîne de caractères",
      },
      { status: 400 }
    );
  }

  // Validation numérique du montant
  const amountNumber = parseInt(amount, 10);
  if (
    isNaN(amountNumber) ||
    !Number.isInteger(amountNumber) ||
    amountNumber <= 0
  ) {
    return NextResponse.json(
      {
        error: "Montant invalide",
        message: "Le montant doit être un nombre entier positif",
      },
      { status: 400 }
    );
  }

  // Validation de la devise
  const validCurrencies = [
    "XAF",
    "ZMW",
    "GHS",
    "NGN",
    "UGX",
    "RWF",
    "MWK",
    "USD",
    "EUR",
  ];
  if (!validCurrencies.includes(currency)) {
    return NextResponse.json(
      {
        error: "Devise non supportée",
        message: `Devise ${currency} non supportée. Devises valides: ${validCurrencies.join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  // ⚠️ IMPORTANT : On utilise le numéro TEL QUEL du frontend (déjà formaté international)
  const phoneNumber = payer.accountDetails.phoneNumber;

  // Validation que c'est bien uniquement des chiffres
  const digitsOnlyRegex = /^\d+$/;
  if (!digitsOnlyRegex.test(phoneNumber)) {
    console.error(
      "❌ Format téléphone contient des caractères non-numériques:",
      phoneNumber
    );
    return NextResponse.json(
      {
        error: "Format de téléphone invalide",
        message:
          "Le numéro doit contenir uniquement des chiffres (ex: 237699123456)",
      },
      { status: 400 }
    );
  }

  // Validation de la longueur
  if (phoneNumber.length < 9 || phoneNumber.length > 15) {
    console.error("❌ Longueur téléphone invalide:", phoneNumber.length);
    return NextResponse.json(
      {
        error: "Numéro de téléphone invalide",
        message: "Le numéro doit contenir entre 9 et 15 chiffres",
      },
      { status: 400 }
    );
  }

  // Construction du payload PawaPay
  const pawapayPayload = {
    depositId,
    amount: amount,
    currency: currency,
    payer: {
      type: "MMO",
      accountDetails: {
        phoneNumber: phoneNumber, // ⚠️ Utilisation directe du numéro formaté
        provider: payer.accountDetails.provider,
      },
    },
    clientReferenceId: clientReferenceId || `STUDIO-${Date.now()}`,
    customerMessage: customerMessage
      ? customerMessage.substring(0, 22)
      : "Réservation studio",
    metadata:
      metadata && Array.isArray(metadata)
        ? metadata
        : [
            {
              orderId: `booking-${Date.now()}`,
              service: "studio-booking",
            },
          ],
  };

  const apiUrl =
    environment === "production"
      ? "https://api.pawapay.io/v2/deposits"
      : "https://api.sandbox.pawapay.io/v2/deposits";

  // Timeout de 15 secondes
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pawapayPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - startTime;
    const responseData = await response.json();

    if (!response.ok) {
      console.error("❌ Erreur PawaPay:", {
        status: response.status,
        response: responseData,
      });

      const errorMessage =
        responseData.failureReason?.failureMessage ||
        responseData.message ||
        responseData.error ||
        `Erreur ${response.status}`;

      return NextResponse.json(
        {
          error: `Erreur ${response.status}`,
          message: errorMessage,
          details: responseData,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error && error.name === "AbortError") {
      console.error("⏳ Timeout atteint");
      return NextResponse.json(
        {
          error: "Timeout",
          message: "La requête a pris trop de temps. Veuillez réessayer.",
        },
        { status: 504 }
      );
    }

    console.error("💥 Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur de connexion",
        message: "Impossible de se connecter au service de paiement.",
      },
      { status: 500 }
    );
  }
}
