import { NextRequest, NextResponse } from 'next/server';
import { paymentCache } from '@/lib/paymentCache';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Webhook Monetbil reçu');
    
    const body = await request.json();
    console.log('📦 Données webhook:', JSON.stringify(body, null, 2));

    // Vérification de la signature Monetbil (optionnelle en dev)
    const signature = request.headers.get('x-monetbil-signature');
    const serviceSecret = process.env.MONETBIL_SERVICE_SECRET;
    
    if (signature && serviceSecret) {
      const expectedSignature = `sha256=${Buffer.from(JSON.stringify(body) + serviceSecret).toString('base64')}`;
      if (signature !== expectedSignature) {
        console.warn('⚠️ Signature Monetbil invalide - continuation en mode dev');
      }
    }

    // Extraire les données essentielles selon la doc Monetbil
    const {
      status,
      transaction_id,
      item_ref: paymentId,
      amount,
      currency,
      phone,
      channel,
      ...otherData
    } = body;

    // Utiliser item_ref comme paymentId principal, sinon transaction_id
    const finalPaymentId = paymentId || transaction_id;
    
    if (!finalPaymentId) {
      console.error('❌ paymentId/transaction_id manquant dans le webhook');
      return NextResponse.json({ error: 'ID de paiement manquant' }, { status: 400 });
    }

    // Mapper le statut Monetbil vers notre format
    const normalizedStatus = mapMonetbilStatus(status);
    
    // Stocker dans le cache avec toutes les infos
    paymentCache.set(finalPaymentId, {
      status: normalizedStatus,
      message: `Statut reçu via webhook: ${status}`,
      amount: amount ? parseFloat(amount) : undefined,
      channel: channel || 'Monetbil',
      phone,
      timestamp: new Date().toISOString(),
      rawData: body
    });

    console.log(`✅ Statut ${finalPaymentId} → ${normalizedStatus} stocké via webhook`);

    // Actions selon le statut
    switch (normalizedStatus) {
      case 'SUCCESS':
        console.log(`💳 Paiement Monetbil réussi: ${finalPaymentId}`);
        
        // CRÉER AUTOMATIQUEMENT UTILISATEUR + RÉSERVATION EN BDD
        try {
          await createCompleteReservationFromPayment(finalPaymentId, body);
          console.log(`✅ Utilisateur + Réservation créés automatiquement pour ${finalPaymentId}`);
        } catch (error) {
          console.error(`❌ Erreur création complète pour ${finalPaymentId}:`, error);
        }
        break;

      case 'FAILED':
        console.log(`❌ Paiement Monetbil échoué: ${finalPaymentId}`);
        // TODO: Marquer la réservation comme échouée si elle existe
        break;

      case 'PENDING':
        console.log(`⏳ Paiement Monetbil en attente: ${finalPaymentId}`);
        break;

      default:
        console.warn(`❓ Statut Monetbil non reconnu: ${status} → ${normalizedStatus}`);
    }

    // Réponse à Monetbil - Important !
    // Monetbil attend une réponse HTTP 200 avec "OK" pour confirmer la réception
    return NextResponse.json({ 
      status: 'OK',
      message: 'Webhook traité avec succès',
      transaction_id: finalPaymentId,
      normalized_status: normalizedStatus
    });

  } catch (error) {
    console.error('❌ Erreur webhook Monetbil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Monetbil peut aussi envoyer des GET pour vérifier l'endpoint
export async function GET() {
  try {
    const allStatuses = paymentCache.list();
    
    return NextResponse.json({
      status: 'OK',
      message: 'Endpoint webhook Monetbil actif',
      cache_info: {
        total: allStatuses.length,
        payments: allStatuses.map(item => ({
          paymentId: item.paymentId,
          status: item.status.status,
          message: item.status.message,
          timestamp: item.status.timestamp,
          amount: item.status.amount,
          channel: item.status.channel
        }))
      }
    });

  } catch (error) {
    console.error('❌ Erreur listage cache:', error);
    return NextResponse.json({ 
      status: 'OK', 
      message: 'Endpoint webhook Monetbil actif',
      error: 'Erreur accès cache'
    });
  }
}

// Mapper les statuts Monetbil vers notre format
function mapMonetbilStatus(status: string): 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' {
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

// Fonction pour créer automatiquement utilisateur + réservation après paiement réussi  
async function createCompleteReservationFromPayment(paymentId: string, webhookData: any) {
  try {
    console.log(`🏨 Tentative création COMPLÈTE (User + Réservation) pour ${paymentId}`);
    
    // Récupérer les informations de paiement du cache
    const paymentInfo = paymentCache.get(paymentId);
    
    if (!paymentInfo || !paymentInfo.rawData) {
      console.warn(`⚠️ Pas d'infos de paiement en cache pour ${paymentId}`);
      return null;
    }

    // Extraire les données de réservation depuis les metadata du paiement
    const reservationData = extractReservationData(paymentInfo.rawData, webhookData);
    
    if (!reservationData) {
      console.warn(`⚠️ Impossible d'extraire les données de réservation pour ${paymentId}`);
      return null;
    }

    // Appeler la nouvelle API complète qui gère Utilisateur + Réservation + BDD
    const completeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/complete`, {
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
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-status`, {
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

// Fonction pour créer automatiquement une réservation après paiement réussi
async function createReservationFromPayment(paymentId: string, webhookData: any) {
  try {
    console.log(`🏨 Tentative création réservation pour paiement ${paymentId}`);
    
    // Récupérer les informations de paiement du cache
    const paymentInfo = paymentCache.get(paymentId);
    
    if (!paymentInfo || !paymentInfo.rawData) {
      console.warn(`⚠️ Pas d'infos de paiement en cache pour ${paymentId}`);
      return null;
    }

    // Extraire les données de réservation depuis les metadata du paiement
    // (Ces données devraient être passées lors de la création du paiement)
    const reservationData = extractReservationData(paymentInfo.rawData, webhookData);
    
    if (!reservationData) {
      console.warn(`⚠️ Impossible d'extraire les données de réservation pour ${paymentId}`);
      return null;
    }

    // Appeler l'API de création de réservation
    const reservationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...reservationData,
        paymentId,
        status: 'CONFIRMED' // Directement confirmé car paiement réussi
      })
    });

    if (reservationResponse.ok) {
      const reservation = await reservationResponse.json();
      console.log(`✅ Réservation créée: ${reservation.reservation?.id}`);
      return reservation;
    } else {
      throw new Error(`Erreur API réservation: ${reservationResponse.status}`);
    }

  } catch (error) {
    console.error(`❌ Erreur création réservation pour ${paymentId}:`, error);
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
      specialRequests: 'Réservation créée automatiquement via webhook Monetbil',
      guestInfo: {
        name: 'Client Monetbil',
        email: 'client@example.com',
        phone: webhookData.phone || 'N/A'
      }
    };
  } catch (error) {
    console.error('❌ Erreur extraction données réservation:', error);
    return null;
  }
}
