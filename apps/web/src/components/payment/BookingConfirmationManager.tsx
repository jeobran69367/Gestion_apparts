'use client';

import { useState } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';
import PawaPayPayment from './PawaPayPayment';
import EmailSender from '../EmailSender';
import { API_ENDPOINTS } from '@/config/api';

interface BookingConfirmationManagerProps {
  bookingData: {
    studioId: number;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    totalNights: number;
    subtotal: number;
    serviceFee: number;
    taxes: number;
    total: number;
    specialRequests: string;
    guestInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  paymentInfo: any;
  onInputChange: (section: string, field: string, value: string) => void;
  onBookingComplete: (bookingId: string) => void;
  onCancel: () => void;
}

export default function BookingConfirmationManager({
  bookingData,
  paymentInfo,
  onInputChange,
  onBookingComplete,
  onCancel
}: BookingConfirmationManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentStep, setIsPaymentStep] = useState(false); 
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'>('IDLE');
  const [error, setError] = useState('');
  const [currentReservationId, setCurrentReservationId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const handlePaymentInitiation = async () => {
    setError('');
    
    try {
      // ÉTAPE 1 : Vérifier/créer l'utilisateur
      const userId = await getOrCreateUser();
      setCurrentUserId(userId);

      // ÉTAPE 2 : Créer la réservation avec statut PENDING
      if (!currentReservationId) {
        const reservation = await createPendingReservation(userId);
        setCurrentReservationId(reservation.id);
      }

      // ÉTAPE 3 : Lancer le processus de paiement
      if (paymentInfo.method === 'PAWAPAY') {
        setIsPaymentStep(true); 
        setPaymentStatus('IDLE');
      } else {
        await handleDirectPaymentSubmit();
      }
      
    } catch (error) {
      const errorMessage = handleError(error, 'Erreur lors de l\'initialisation');
      setError(errorMessage);
      setPaymentStatus('FAILED');
      setIsProcessing(false);
    }
  };

  const handleError = (error: unknown, defaultMessage: string) => {
    console.error('Erreur:', error);
    return error instanceof Error ? error.message : defaultMessage;
  };

  const apiCall = async (url: string, method: string, body: any, token?: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Erreur lors de l\'appel API');
    }
    return result;
  };

  // ÉTAPE 1 : Vérifier si l'utilisateur existe, sinon le créer
  const getOrCreateUser = async (): Promise<number> => {
    const token = localStorage.getItem('token');
    
    // Si l'utilisateur est déjà connecté, utiliser son ID
    if (token) {
      const userId = getUserIdFromToken(token);
      if (userId) {
        console.log('👤 Utilisateur déjà connecté:', userId);
        return userId;
      }
    }

    // Sinon, créer un nouvel utilisateur avec les guestInfo
    console.log('👤 Création nouvel utilisateur avec:', bookingData.guestInfo);
    
    const userData = {
      email: bookingData.guestInfo.email,
      password: generateTemporaryPassword(), // Générer un mot de passe temporaire
      firstName: bookingData.guestInfo.firstName,
      lastName: bookingData.guestInfo.lastName,
      phone: bookingData.guestInfo.phone,
      role: 'GUEST' as const
    };

    // Validate the password field before making the API call
    if (!userData.password || typeof userData.password !== 'string' || userData.password.length < 6) {
      throw new Error('Password must be a string and at least 6 characters long.');
    }

    try {
      // Essayer de créer l'utilisateur via l'API d'inscription
      const result = await apiCall(API_ENDPOINTS.AUTH.REGISTER, 'POST', userData);
      console.log('✅ Utilisateur créé:', result);
      
      // Stocker le token si retourné
      if (result.access_token) {
        localStorage.setItem('token', result.access_token);
      }
      
      return result.user?.id || result.id;

    } catch (error: any) {
      // Si l'utilisateur existe déjà (email unique), essayer de se connecter
      if (error.message.includes('existe déjà') || error.message.includes('already exists')) {
        console.log('🔄 Utilisateur existe déjà, tentative de connexion...');
        
        try {
          const loginResult = await apiCall(API_ENDPOINTS.AUTH.LOGIN, 'POST', {
            email: bookingData.guestInfo.email,
            password: 'temporary123' // Mot de passe par défaut pour la récupération
          });
          
          if (loginResult.access_token) {
            localStorage.setItem('token', loginResult.access_token);
            return loginResult.user?.id || getUserIdFromToken(loginResult.access_token);
          }
        } catch (loginError) {
          console.error('Erreur de connexion:', loginError);
          throw new Error('Impossible de créer ou de connecter l\'utilisateur');
        }
      }
      
      throw error;
    }
  };

  // Update the password generation logic to ensure it meets the requirements
const generateTemporaryPassword = (): string => {
  return `Temp${Math.random().toString(36).slice(-6)}!`;
};

  // ÉTAPE 2 : Créer une réservation en attente de paiement
  const createPendingReservation = async (userId: number) => {
    const token = localStorage.getItem('token');

    const reservationData = {
      studioId: bookingData.studioId,
      checkIn: new Date(bookingData.checkIn).toISOString(),
      checkOut: new Date(bookingData.checkOut).toISOString(),
      nights: bookingData.totalNights,
      guestCount: bookingData.guestCount,
      subtotal: bookingData.subtotal,
      serviceFee: bookingData.serviceFee,
      taxes: bookingData.taxes,
      total: bookingData.total,
      specialRequests: bookingData.specialRequests || null,
      guestId: userId, // ID de l'utilisateur (créé ou existant)
      status: 'PENDING' // Réservation en attente de paiement
    };

    console.log('📝 Création réservation PENDING:', reservationData);

    const result = await apiCall(API_ENDPOINTS.RESERVATIONS.BASE, 'POST', reservationData, token);
    console.log('✅ Réservation PENDING créée:', result);
    
    return result;
  };

  // ÉTAPE 3 : Créer le paiement et confirmer la réservation
  const confirmReservationAndCreatePayment = async (paymentId: string, paymentData: any = {}) => {
  const token = localStorage.getItem('token');
  
  if (!currentReservationId || !currentUserId) {
    throw new Error('Données de réservation ou utilisateur manquantes');
  }

  try {
    // ÉTAPE 3A : Créer l'enregistrement de paiement
    const paymentPayload = {
      amount: bookingData.total,
      currency: 'XAF',
      method: 'CREDIT_CARD',
      status: 'COMPLETED',
      externalId: paymentId,
      reservationId: currentReservationId,
      userId: currentUserId
    };

    console.log('💰 Création paiement COMPLETED:', paymentPayload);
    const paymentResult = await apiCall(API_ENDPOINTS.PAYMENTS.BASE, 'POST', paymentPayload, token);
    console.log('✅ Paiement créé:', paymentResult);

    // ÉTAPE 3B : Mettre à jour la réservation en CONFIRMED
    const updateReservationPayload = {
      status: 'CONFIRMED'
    };

    console.log('🔄 Mise à jour réservation CONFIRMED');
    await apiCall(API_ENDPOINTS.RESERVATIONS.BY_ID(currentReservationId), 'PATCH', updateReservationPayload, token);
    
    console.log('🎉 Réservation confirmée avec succès!');

    // ÉTAPE 3C : Envoi de l'email de confirmation (NE PAS BLOQUER EN CAS D'ERREUR)
    try {
      await handleEmailSending();
      console.log('✉️ Email de confirmation envoyé avec succès.');
    } catch (emailError) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email, mais réservation confirmée:', emailError);
      // Ne pas propager l'erreur pour ne pas bloquer la réservation
    }

    return paymentResult;
    
  } catch (error) {
    console.error('❌ Erreur lors de la confirmation de la réservation:', error);
    throw error;
  }
};

const handleEmailSending = async () => {
  // VALIDATION CRITIQUE - Vérifier que les données nécessaires existent
  if (!bookingData.guestInfo?.email) {
    console.error('❌ Email manquant dans guestInfo:', bookingData.guestInfo);
    throw new Error('Missing required field: recipientEmail');
  }

  if (!bookingData.studioId || !bookingData.checkIn || !bookingData.checkOut || !bookingData.total) {
    console.error('❌ Données de réservation manquantes:', bookingData);
    throw new Error('Missing required reservation details');
  }

  const emailPayload = {
    recipientEmail: bookingData.guestInfo.email,
    reservationDetails: {
      studioId: bookingData.studioId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      total: bookingData.total,
      guestInfo: bookingData.guestInfo,
    }
  };

  console.log('📧 Envoi email avec payload:', emailPayload);

  try {
    const response = await fetch(API_ENDPOINTS.EMAIL.SEND, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || `Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Email envoyé avec succès:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error; // Propager l'erreur pour la gestion en amont
  }
};

  const handleDirectPaymentSubmit = async () => {
    setIsProcessing(true);
    setError('');

    try {
      if (!bookingData.total || bookingData.total <= 0) {
        throw new Error('Le montant total de la réservation est invalide.');
      }

      const paymentResult = await initiatePayment(); 

      if (paymentResult.success) {
        setPaymentStatus('IN_PROGRESS'); 
        
        // Simuler le succès du paiement
        setTimeout(async () => {
          try {
            await confirmReservationAndCreatePayment(paymentResult.paymentId);
            setPaymentStatus('COMPLETED');
            setIsProcessing(false);
            onBookingComplete(currentReservationId!.toString());
          } catch (error) {
            const errorMessage = handleError(error, 'Erreur lors de la confirmation');
            setError(errorMessage);
            setPaymentStatus('FAILED');
            setIsProcessing(false);
          }
        }, 1500);
      } else {
        throw new Error(paymentResult.error || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Erreur inconnue');
      setError(errorMessage);
      setPaymentStatus('FAILED');
      setIsProcessing(false);
    } 
  };

  const validatePaymentMethod = (method: string): boolean => {
    switch (method) {
      case 'CREDIT_CARD':
        return !!(paymentInfo.cardholderName && paymentInfo.cardNumber && 
                 paymentInfo.expiryDate && paymentInfo.cvv);
      case 'PAYPAL':
        return true; 
      case 'PAWAPAY': 
        return true;
      default:
        return false;
    }
  };

  const initiatePayment = async () => {
    const method = paymentInfo.method;

    if (method === 'MONETBIL') {
      const response = await fetch('/api/monetbil/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* ... payload ... */ })
      });
      return await response.json();
    } 
    
    if (method === 'CREDIT_CARD' || method === 'PAYPAL') {
        return {
            success: true,
            paymentId: `${method.toLowerCase()}_${Date.now()}`,
            channel: method === 'CREDIT_CARD' ? 'Carte Bancaire' : 'PayPal',
            message: 'Redirection/Traitement...'
        };
    }
    
    throw new Error('Méthode de paiement non supportée');
  };

  // Gestion du succès PawaPay
  const handlePawaPaySuccess = async (paymentData: any) => {
    console.log('✅ Paiement PawaPay confirmé. Données reçues:', paymentData);
    
    setPaymentStatus('COMPLETED');
    setIsProcessing(true);
    
    const paymentId = paymentData.depositId || paymentData.paymentId;
    
    if (!paymentId) {
      console.error('❌ Aucun ID de paiement trouvé');
      setError('Erreur: Identifiant de paiement manquant');
      setIsProcessing(false);
      return;
    }
    
    try {
      // ÉTAPE 3 : Confirmer la réservation et créer le paiement
      await confirmReservationAndCreatePayment(paymentId, paymentData);
      
      setIsPaymentStep(false);
      setIsProcessing(false);
      onBookingComplete(currentReservationId!.toString());
      
    } catch (error) {
      console.error('❌ Erreur lors de la confirmation:', error);
      setError('Erreur lors de la confirmation de la réservation');
      setPaymentStatus('FAILED');
      setIsProcessing(false);
    }
  };

  const handlePawaPayError = (errorMessage: string) => {
    console.error('❌ Erreur finale PawaPay:', errorMessage);
    setPaymentStatus('FAILED');
    setError(errorMessage);
    setIsPaymentStep(false);
    setIsProcessing(false);
  };

  const handlePawaPayStatusChange = (status: string) => {
    console.log('📊 Statut PawaPay changé:', status);
    
    if (status === 'PENDING' || status === 'INITIATED' || status === 'ACCEPTED') {
      setPaymentStatus('IN_PROGRESS');
    } else if (status === 'FAILED' || status === 'REJECTED' || status === 'EXPIRED') {
      setPaymentStatus('FAILED');
    } else if (status === 'COMPLETED') {
      setPaymentStatus('COMPLETED');
    }
    onInputChange('paymentInfo', 'status', status);
  };

  // Fonction utilitaire pour extraire l'ID utilisateur du token
  const getUserIdFromToken = (token: string | null): number | null => {
    if (!token) return null;
    
    try {
      // Vérifier d'abord dans localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id ? parseInt(user.id) : null;
      }
      
      // Décoder le token JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ? parseInt(payload.sub) : 
             payload.userId ? parseInt(payload.userId) : 
             payload.id ? parseInt(payload.id) : null;
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID utilisateur:', error);
      return null;
    }
  };

  // Rendu Conditionnel
  if (paymentInfo.method === 'PAWAPAY' && isPaymentStep && paymentStatus !== 'COMPLETED') {
    return (
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4">Finalisation du Paiement Mobile</h3>
        
        <PawaPayPayment
          paymentInfo={paymentInfo}
          onInputChange={(section, field, value) => onInputChange(section, field, value)}
          amount={bookingData.total}
          onPaymentSuccess={handlePawaPaySuccess}
          onPaymentError={handlePawaPayError}
          onPaymentStatusChange={handlePawaPayStatusChange}
        />

        {paymentStatus === 'FAILED' && (
          <button 
            onClick={() => {
              setIsPaymentStep(false);
              setPaymentStatus('IDLE');
            }}
            className="mt-6 w-full py-3 px-6 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Retourner à la sélection du mode de paiement
          </button>
        )}
      </div>
    );
  }

  if (paymentStatus === 'COMPLETED') {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <h3 className="text-2xl font-bold text-green-800">Paiement et Réservation Confirmés ! 🎉</h3>
        <p className="mt-2 text-green-700">Votre réservation est finalisée. Veuillez patienter pour la redirection.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PaymentMethodSelector
          paymentInfo={paymentInfo}
          onInputChange={onInputChange}
          amount={bookingData.total}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h4 className="font-medium text-red-800">Erreur de paiement</h4>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {paymentStatus === 'IN_PROGRESS' && paymentInfo.method !== 'PAWAPAY' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              <span className="inline-flex animate-pulse mr-2">...</span>
              Traitement de votre paiement en cours. Veuillez ne pas fermer cette page.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            Annuler
          </button>
          
          <button
            onClick={handlePaymentInitiation}
            disabled={isProcessing || paymentInfo.method === '' || paymentStatus === 'IN_PROGRESS'}
            className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing || paymentStatus === 'IN_PROGRESS' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {paymentStatus === 'IN_PROGRESS' ? 'Vérification...' : 'Traitement...'}
              </span>
            ) : (
              `Confirmer et Payer ${(bookingData.total)}`
            )}
          </button>
        </div>
      </div>
    </>
  );
}