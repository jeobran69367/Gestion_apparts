'use client';

import { useState } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';
import PawaPayPayment from './PawaPayPayment';

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

interface PaymentProgress {
  isVisible: boolean;
  paymentId: string;
  amount: number;
  channel: string;
  channelUssd?: string;
  phoneNumber: string;
}

export default function BookingConfirmationManager({
  bookingData,
  paymentInfo,
  onInputChange,
  onBookingComplete,
  onCancel
}: BookingConfirmationManagerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState<PaymentProgress>({
    isVisible: false,
    paymentId: '',
    amount: 0,
    channel: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // Vérifier que le montant est valide
      if (!bookingData.total || bookingData.total <= 0) {
        throw new Error('Le montant total de la réservation est invalide.');
      }

      // 1. Valider les données de paiement selon la méthode
      const isValid = validatePaymentMethod(paymentInfo.method);
      if (!isValid) {
        throw new Error('Informations de paiement incomplètes');
      }

      // 2. Initier le paiement selon la méthode choisie
      const paymentResult = await initiatePayment();

      if (paymentResult.success) {
        // 3. Afficher le widget de progression
        setPaymentProgress({
          isVisible: true,
          paymentId: paymentResult.paymentId,
          amount: bookingData.total,
          channel: paymentResult.channel,
          channelUssd: paymentResult.channelUssd,
          phoneNumber: paymentInfo.phoneNumber || paymentInfo.email || 'N/A'
        });

        // 4. Mettre à jour le statut de la réservation
        onInputChange('payment', 'status', 'IN_PROGRESS');
      } else {
        throw new Error(paymentResult.error || 'Erreur lors de l\'initialisation du paiement');
      }

    } catch (error) {
      console.error('Erreur paiement:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      onInputChange('payment', 'status', 'FAILED'); // Mettre à jour le statut en cas d'erreur
    } finally {
      setIsProcessing(false);
    }
  };

  const validatePaymentMethod = (method: string): boolean => {
    switch (method) {
      case 'CREDIT_CARD':
        return !!(paymentInfo.cardholderName && paymentInfo.cardNumber && 
                 paymentInfo.expiryDate && paymentInfo.cvv);
      
      case 'PAYPAL':
        return true; // PayPal gère sa propre validation
      
      case 'MOBILE_MONEY':
      case 'ORANGE_MONEY':
      case 'MONETBIL':
        return !!(paymentInfo.phoneNumber && paymentInfo.country && 
                 (paymentInfo.operator || paymentInfo.provider));
      
      default:
        return false;
    }
  };

  const initiatePayment = async () => {
    const method = paymentInfo.method;

    if (method === 'MONETBIL') {
      // Appel à l'API Monetbil
      const response = await fetch('/api/monetbil/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bookingData.total,
          phoneNumber: paymentInfo.phoneNumber,
          country: paymentInfo.country,
          operator: paymentInfo.operator,
          email: paymentInfo.email,
          bookingId: `booking_${Date.now()}`,
          description: `Réservation Studio - ${bookingData.totalNights} nuits`
        })
      });

      return await response.json();
    } 
    
    // Autres méthodes de paiement (PayPal, Stripe, etc.)
    else if (method === 'CREDIT_CARD') {
      // Simulation pour Stripe/carte bancaire
      return {
        success: true,
        paymentId: `stripe_${Date.now()}`,
        channel: 'Carte Bancaire',
        message: 'Paiement par carte en cours...'
      };
    }
    
    else if (method === 'PAYPAL') {
      // Simulation pour PayPal
      return {
        success: true,
        paymentId: `paypal_${Date.now()}`,
        channel: 'PayPal',
        message: 'Redirection vers PayPal...'
      };
    }
    
    else {
      throw new Error('Méthode de paiement non supportée');
    }
  };

  // handlePaymentSuccess removed here to avoid duplicate declaration;
  // the full implementation that accepts paymentData is defined later in the file.

 
  // Dans votre BookingConfirmationManager
const handlePaymentSuccess = async (paymentData: any) => {
  try {
    // 1. Créer la réservation en base de données
    const bookingResult = await createBooking(paymentData);

    if (bookingResult.success) {
      // 2. Confirmer la réservation
      setPaymentProgress(prev => ({ ...prev, isVisible: false }));
      onBookingComplete(bookingResult.bookingId);
      onInputChange('payment', 'status', 'COMPLETED');
      
      // Mettre à jour les détails du paiement
      onInputChange('paymentInfo', 'pawaPayData', JSON.stringify(paymentData));
      onInputChange('paymentInfo', 'paidAt', new Date().toISOString());
    } else {
      throw new Error(bookingResult.error || 'Erreur lors de la création de la réservation');
    }

  } catch (error) {
    console.error('Erreur confirmation réservation:', error);
    setError(error instanceof Error ? error.message : 'Erreur confirmation réservation');
    setPaymentProgress(prev => ({ ...prev, isVisible: false }));
    onInputChange('payment', 'status', 'FAILED');
  }
};

const createBooking = async (paymentData: any) => {
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
    guestInfo: bookingData.guestInfo,
    paymentData: {
      paymentId: paymentData.depositId,
      referenceId: paymentData.referenceId,
      amount: paymentData.amount,
      method: 'PAWAPAY',
      provider: paymentData.provider,
      phoneNumber: paymentData.phoneNumber,
      status: 'COMPLETED',
      paidAt: new Date().toISOString(),
      rawData: paymentData
    }
  };

  const response = await fetch('http://localhost:4000/api/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reservationData)
  });

  const result = await response.json();

  if (response.ok) {
    return {
      success: true,
      bookingId: result.id,
      booking: result
    };
  } else {
    return {
      success: false,
      error: result.message || 'Erreur lors de la création de la réservation'
    };
  }
};

const handlePaymentCancel = () => {
  setPaymentProgress(prev => ({ ...prev, isVisible: false }));
  setError('Paiement annulé par l\'utilisateur');
  // Optionnel: nettoyer les données temporaires
  };

  const handlePaymentError = (errorMessage: string) => {
    setPaymentProgress(prev => ({ ...prev, isVisible: false }));
    setError(errorMessage);
    // Optionnel: logger l'erreur pour analyse
    console.error('Erreur paiement:', errorMessage);
  };

  return (
    <>
      {/* Formulaire de paiement principal */}
      <div className="space-y-6">
        <PaymentMethodSelector
          paymentInfo={paymentInfo}
          onInputChange={onInputChange}
          amount={bookingData.total}
        />

        {/* Affichage d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-red-800">Erreur de paiement</h4>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          
          <button
            onClick={handlePaymentSubmit}
            disabled={isProcessing || !validatePaymentMethod(paymentInfo.method)}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Traitement...
              </span>
            ) : (
              'Confirmer et Payer'
            )}
          </button>
        </div>
      </div>

    </>
  );
}
