import { NextRequest, NextResponse } from 'next/server';
import { paymentCache } from '@/lib/paymentCache';

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      phoneNumber, 
      email = 'test@example.com',
      description = 'Réservation Studio',
      // NOUVELLES DONNÉES DE RÉSERVATION
      studioId,
      checkIn,
      checkOut,
      nights,
      guestCount = 1,
      guestInfo = {},
      specialRequests
    } = await request.json();

    // Validation des données OBLIGATOIRES selon la doc Monetbil
    if (!amount || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Configuration de paiement manquante - amount et phoneNumber requis'
      }, { status: 400 });
    }

    // Configuration Monetbil depuis les variables d'environnement
    const serviceKey = process.env.MONETBIL_SERVICE_KEY;
    const serviceSecret = process.env.MONETBIL_SERVICE_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!serviceKey || !serviceSecret) {
      console.error('Configuration Monetbil manquante:', { 
        serviceKey: !!serviceKey, 
        serviceSecret: !!serviceSecret 
      });
      return NextResponse.json({
        success: false,
        error: 'Configuration de paiement manquante - clés API Monetbil non configurées'
      }, { status: 500 });
    }

    // Préparation des données EXACTEMENT selon la documentation Monetbil
    // Le montant doit être en FCFA (pas de conversion)
    const monetbilPayload = {
      service: serviceKey,                              // YOUR_SERVICE_KEY (obligatoire)
      phonenumber: phoneNumber.replace(/\s+/g, ''),    // BUYER_PHONENUMBER (obligatoire)
      amount: amount.toString(),                       // AMOUNT_TO_BE_PAY en FCFA (obligatoire) 
      notify_url: `${baseUrl}/api/monetbil/webhook`    // URL de notification (obligatoire)
    };

    console.log('🚀 Envoi à Monetbil API (FCFA):', {
      service: '[HIDDEN]',
      phonenumber: monetbilPayload.phonenumber,
      amount: monetbilPayload.amount,
      notify_url: monetbilPayload.notify_url
    });

    // Appel à l'API Monetbil EXACTEMENT selon la documentation
    const monetbilResponse = await fetch('https://api.monetbil.com/payment/v1/placePayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(monetbilPayload)
    });

    if (!monetbilResponse.ok) {
      const errorText = await monetbilResponse.text();
      console.error('❌ Erreur HTTP Monetbil:', monetbilResponse.status, errorText);
      return NextResponse.json({
        success: false,
        error: `Erreur API Monetbil: ${monetbilResponse.status} - ${errorText}`
      }, { status: 502 });
    }

    const result = await monetbilResponse.json();
    console.log('📨 Réponse Monetbil brute:', result);

    // Gestion de la réponse selon la documentation Monetbil
    if (result.status === 'REQUEST_ACCEPTED') {
      console.log('✅ Paiement Monetbil accepté:', {
        paymentId: result.paymentId,
        channel: result.channel_name,
        ussd: result.channel_ussd,
        message: result.message
      });

      // NOUVEAU: Vérifier immédiatement le statut si Monetbil retourne déjà un statut final
      let finalStatus = 'PENDING';
      let shouldCheckStatus = false;

      // Certains paiements Monetbil peuvent être instantanés
      if (result.payment_status) {
        const status = result.payment_status.toLowerCase();
        if (status.includes('success') || status.includes('completed')) {
          finalStatus = 'SUCCESS';
          console.log('🎉 Paiement Monetbil INSTANTANÉ réussi!');
        } else if (status.includes('failed')) {
          finalStatus = 'FAILED';
        } else {
          shouldCheckStatus = true; // Vérifier plus tard
        }
      } else {
        shouldCheckStatus = true; // Pas de statut immédiat, vérifier plus tard
      }

      // Initialiser le statut dans le cache avec les vraies données Monetbil
      paymentCache.set(result.paymentId, {
        status: finalStatus as 'PENDING' | 'SUCCESS' | 'FAILED',
        message: finalStatus === 'SUCCESS' ? 'Paiement confirmé instantanément' : 
                 finalStatus === 'FAILED' ? 'Paiement échoué' : 
                 'Paiement créé - vérification en cours',
        amount: parseFloat(amount),
        channel: result.channel_name || 'Mobile Money',
        phone: phoneNumber,
        timestamp: new Date().toISOString(),
        rawData: {
          ...result,
          // STOCKER LES DONNÉES DE RÉSERVATION pour le webhook ET la vérification
          reservationData: {
            studioId: studioId ? parseInt(studioId) : null,
            checkIn,
            checkOut,
            nights: nights || calculateNights(checkIn, checkOut),
            guestCount,
            guestInfo,
            specialRequests,
            createdAt: new Date().toISOString()
          }
        }
      });

      // Si le paiement est déjà réussi, créer la réservation immédiatement
      if (finalStatus === 'SUCCESS') {
        try {
          console.log('🏨 Création immédiate de la réservation...');
          await createCompleteReservationFromPayment(result.paymentId, result);
        } catch (reservationError) {
          console.error('❌ Erreur création réservation immédiate:', reservationError);
        }
      }

      // Programmer une vérification du statut dans quelques secondes si nécessaire
      if (shouldCheckStatus) {
        console.log('⏰ Programmation vérification statut dans 10 secondes...');
        setTimeout(async () => {
          try {
            await checkPaymentStatusDelayed(result.paymentId, baseUrl);
          } catch (error) {
            console.error('❌ Erreur vérification différée:', error);
          }
        }, 10000); // 10 secondes
      }

      return NextResponse.json({
        success: true,
        status: result.status,
        message: result.message || 'payment pending',
        paymentId: result.paymentId,
        channel: result.channel_name || 'Mobile Money',
        channelUssd: result.channel_ussd,
        channelCode: result.channel,
        // Compatibilité avec le frontend existant
        transactionId: result.paymentId,
        paymentUrl: result.channel_ussd ? `tel:${result.channel_ussd}` : null
      });
    } else {
      console.error('❌ Monetbil a rejeté la demande:', result);
      return NextResponse.json({
        success: false,
        error: result.message || result.error || 'Paiement rejeté par Monetbil',
        status: result.status,
        details: result
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Erreur lors de l\'initialisation du paiement Monetbil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Endpoint pour vérifier la configuration ou le statut d'un paiement
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id') || searchParams.get('payment_id');

    // Si pas de transaction_id, retourner juste l'état de la configuration
    if (!transactionId) {
      const serviceKey = process.env.MONETBIL_SERVICE_KEY;
      const serviceSecret = process.env.MONETBIL_SERVICE_SECRET;
      
      return NextResponse.json({
        configured: !!(serviceKey && serviceSecret),
        endpoint: '/api/monetbil/payment',
        methods: ['GET', 'POST'],
        status: 'active',
        message: 'Configuration Monetbil OK'
      });
    }

    console.log(`🔍 Vérification statut paiement: ${transactionId}`);

    // D'abord vérifier dans le cache (statuts reçus via webhook ou vérification directe)
    const cachedStatus = paymentCache.get(transactionId);
    
    if (cachedStatus) {
      console.log(`📖 Statut trouvé dans le cache: ${cachedStatus.status}`);
      return NextResponse.json({
        paymentId: transactionId,
        status: cachedStatus.status,
        message: cachedStatus.message,
        amount: cachedStatus.amount,
        channel: cachedStatus.channel,
        phone: cachedStatus.phone,
        timestamp: cachedStatus.timestamp,
        source: 'cache'
      });
    }

    // Si pas dans le cache, utiliser notre nouvelle API de vérification directe
    console.log(`🔍 Pas de statut en cache, vérification directe Monetbil`);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const checkResponse = await fetch(`${baseUrl}/api/monetbil/check-status?paymentId=${transactionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (checkResponse.ok) {
        const checkResult = await checkResponse.json();
        console.log(`📊 Résultat vérification directe:`, checkResult);
        
        return NextResponse.json({
          paymentId: transactionId,
          status: checkResult.status,
          message: checkResult.message,
          amount: checkResult.amount,
          channel: checkResult.channel,
          phone: checkResult.phone,
          timestamp: checkResult.timestamp,
          source: checkResult.source || 'direct_check',
          monetbil_response: checkResult.rawResponse
        });
      } else {
        console.warn('⚠️ Échec vérification directe, utilisation simulation');
      }
    } catch (directCheckError) {
      console.warn('⚠️ Erreur vérification directe:', directCheckError);
    }

    // Si pas dans le cache, utiliser simulation intelligente basée sur l'âge
    console.log(`⚡ Pas de statut webhook, utilisation simulation intelligente`);
    
    // IMPORTANT: Monetbil semble ne pas avoir d'API de vérification de statut publique
    // La méthode recommandée est d'utiliser le WEBHOOK pour recevoir les notifications
    
    // Comme solution de contournement, nous simulons les statuts basés sur l'âge du paiement
    // Extraire timestamp du paymentId si possible
    const timestampMatch = transactionId.match(/PAY_(\d+)_/) || transactionId.match(/^(\d+)/);
    let paymentAge = 0;
    
    if (timestampMatch) {
      const creationTime = parseInt(timestampMatch[1]);
      paymentAge = Date.now() - creationTime;
    } else {
      // Essayer d'extraire timestamp des premiers chiffres du paymentId Monetbil
      const firstDigits = transactionId.slice(0, 10);
      if (/^\d{10}$/.test(firstDigits)) {
        const paymentTimestamp = parseInt(firstDigits) * 1000;
        paymentAge = Date.now() - paymentTimestamp;
      }
    }

    const ageInMinutes = paymentAge / (1000 * 60);
    console.log(`⏰ Âge du paiement: ${ageInMinutes.toFixed(1)} minutes`);

    // Simulation intelligente basée sur l'âge du paiement
    let simulatedStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
    let simulatedMessage: string;

    if (paymentAge === 0 || ageInMinutes < 0 || ageInMinutes > 1440) {
      simulatedStatus = 'PENDING';
      simulatedMessage = 'Paiement en cours - âge non déterminable';
    } else if (ageInMinutes < 1) { // < 1 minute
      simulatedStatus = 'PENDING';
      simulatedMessage = 'Paiement en cours - récent';
    } else if (ageInMinutes < 5) { // < 5 minutes
      // 70% chance de succès après 1-5 minutes
      simulatedStatus = Math.random() < 0.7 ? 'SUCCESS' : 'PENDING';
      simulatedMessage = simulatedStatus === 'SUCCESS' 
        ? 'Paiement confirmé (simulation)' 
        : 'Paiement en cours de validation';
    } else if (ageInMinutes < 15) { // < 15 minutes
      // 90% chance de succès après 5-15 minutes
      simulatedStatus = Math.random() < 0.9 ? 'SUCCESS' : 'FAILED';
      simulatedMessage = simulatedStatus === 'SUCCESS' 
        ? 'Paiement confirmé (simulation)' 
        : 'Paiement échoué - délai dépassé';
    } else {
      // Après 15 minutes, considérer comme timeout
      simulatedStatus = 'TIMEOUT';
      simulatedMessage = 'Paiement expiré - délai dépassé';
    }
    
    // POUR LA PRODUCTION: Vous devriez stocker les statuts reçus via webhook
    // et les consulter ici au lieu de cette simulation
    
    console.log(`🎭 Statut simulé: ${simulatedStatus} (${simulatedMessage})`);

    return NextResponse.json({
      paymentId: transactionId,
      status: simulatedStatus,
      message: simulatedMessage,
      amount: null, // Inconnu sans API
      channel: 'MTN Mobile Money', // Supposé
      currency: 'XAF',
      phoneNumber: null, // Inconnu sans API
      reference: transactionId,
      lastUpdated: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      source: 'intelligent_simulation',
      note: 'Statut simulé - Monetbil utilise principalement des webhooks',
      recommendedApproach: 'Implémenter le webhook Monetbil pour un statut en temps réel',
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/monetbil/webhook`,
      age_ms: paymentAge,
      ageInMinutes: ageInMinutes > 0 && ageInMinutes < 1440 ? Math.round(ageInMinutes * 10) / 10 : null
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour calculer le nombre de nuits
function calculateNights(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 1;
  
  try {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  } catch {
    return 1;
  }
}

// Fonction pour vérifier le statut avec délai
async function checkPaymentStatusDelayed(paymentId: string, baseUrl: string) {
  console.log(`🔍 Vérification différée du statut pour: ${paymentId}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/monetbil/check-status?paymentId=${paymentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`📊 Résultat vérification différée:`, result);

      // Si le statut est SUCCESS, déclencher la création de réservation
      if (result.status === 'SUCCESS') {
        console.log(`🎉 Paiement confirmé en différé: ${paymentId}`);
        
        // Notifier les clients qui attendent
        try {
          await fetch(`${baseUrl}/api/payment-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId,
              status: 'SUCCESS',
              message: 'Paiement confirmé via vérification différée'
            })
          });
        } catch (notifyError) {
          console.error('❌ Erreur notification différée:', notifyError);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erreur vérification différée pour ${paymentId}:`, error);
  }
}

// Fonction pour créer automatiquement une réservation complète
async function createCompleteReservationFromPayment(paymentId: string, monetbilData: any) {
  try {
    console.log(`🏨 Tentative création COMPLÈTE (User + Réservation) pour ${paymentId}`);
    
    // Récupérer les informations de paiement du cache
    const paymentInfo = paymentCache.get(paymentId);
    
    if (!paymentInfo || !paymentInfo.rawData) {
      console.warn(`⚠️ Pas d'infos de paiement en cache pour ${paymentId}`);
      return null;
    }

    // Extraire les données de réservation depuis les metadata du paiement
    const reservationData = extractReservationData(paymentInfo.rawData, monetbilData);
    
    if (!reservationData) {
      console.warn(`⚠️ Impossible d'extraire les données de réservation pour ${paymentId}`);
      return null;
    }

    // Appeler la nouvelle API complète qui gère Utilisateur + Réservation + BDD
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const completeResponse = await fetch(`${baseUrl}/api/bookings/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...reservationData,
        paymentId,
        autoCreateUser: true // Créer automatiquement l'utilisateur avec mot de passe 1234
      })
    });

    if (completeResponse.ok) {
      const result = await completeResponse.json();
      console.log(`✅ Création complète réussie:`, {
        reservationId: result.reservation?.id,
        userId: result.user?.id,
        userCreated: result.user?.created
      });
      
      // NOTIFIER le changement de statut pour mettre à jour la page d'attente
      try {
        await fetch(`${baseUrl}/api/payment-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            status: 'SUCCESS',
            reservationId: result.reservation?.id,
            userId: result.user?.id
          })
        });
        console.log(`📢 Notification envoyée pour ${paymentId}`);
      } catch (notifyError) {
        console.error('❌ Erreur notification:', notifyError);
      }
      
      return result;
    } else {
      const error = await completeResponse.text();
      throw new Error(`Erreur API complète: ${completeResponse.status} - ${error}`);
    }

  } catch (error) {
    console.error(`❌ Erreur création complète pour ${paymentId}:`, error);
    throw error;
  }
}

// Fonction pour extraire les données de réservation depuis le paiement
function extractReservationData(paymentData: any, webhookData: any) {
  try {
    // Vérifier si les données de réservation sont stockées dans le paiement initial
    if (paymentData && paymentData.reservationData) {
      console.log('📋 Utilisation des données de réservation stockées');
      return {
        ...paymentData.reservationData,
        total: webhookData.amount ? Math.round(parseFloat(webhookData.amount) * 100) : paymentData.reservationData.total
      };
    }
    
    // Fallback: données par défaut pour la démo
    console.log('⚠️ Utilisation des données de réservation par défaut (démo)');
    return {
      studioId: 1, // Studio par défaut
      guestId: 1,  // Utilisateur par défaut
      checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
      checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Dans 5 jours
      nights: 4,
      guestCount: 2,
      total: webhookData.amount ? Math.round(parseFloat(webhookData.amount) * 100) : 25000, // Convertir en centimes
      subtotal: webhookData.amount ? Math.round(parseFloat(webhookData.amount) * 100) : 25000,
      serviceFee: 0,
      cleaningFee: 0,
      taxes: 0,
      specialRequests: 'Réservation créée automatiquement via API Monetbil',
      guestInfo: {
        name: 'Client Monetbil',
        email: 'client@monetbil.com',
        phone: webhookData.phone || webhookData.phonenumber || 'N/A'
      }
    };
  } catch (error) {
    console.error('❌ Erreur extraction données réservation:', error);
    return null;
  }
}
