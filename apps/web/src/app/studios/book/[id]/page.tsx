'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BookingConfirmationManager from '../../../../components/payment/BookingConfirmationManager';

/**
 * Local SmartPriceDisplay component used to render prices (expects price in cents).
 * Kept simple and self-contained to avoid additional imports.
 */
type SmartPriceDisplayProps = {
  price: number;
  size?: 'sm' | 'lg' | string;
  showPaymentConversion?: boolean;
  paymentMethod?: string;
  className?: string;
};

function SmartPriceDisplay({
  price,
  size = 'sm',
  showPaymentConversion = false,
  paymentMethod,
  className = ''
}: SmartPriceDisplayProps) {
  const formatted = (price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  const sizeClass = size === 'lg' ? 'text-lg' : 'text-sm';

  return (
    <div className={`${sizeClass} ${className}`}>
      <span>{formatted}</span>
      {showPaymentConversion && paymentMethod && (
        <div className="text-xs text-gray-500">{paymentMethod}</div>
      )}
    </div>
  );
}

interface Studio {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  surface?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number; // en centimes
  isAvailable: boolean;
  minStay: number;
  maxStay: number;
  photos: string[];
  amenities: string[];
  rules: string[];
  owner: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BookingData {
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalNights: number;
  subtotal: number; // en centimes
  serviceFee: number; // en centimes
  taxes: number; // en centimes
  total: number; // en centimes
  specialRequests: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentInfo: {
    method: string;
    // Carte de crédit
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    // PayPal
    email?: string;
    // Mobile Money
    phoneNumber?: string;
    provider?: string;
    // Orange Money
    country?: string;
    // Monetbil
    operator?: string;
  };
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const studioId = params?.id as string;
  
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(2); // Start at step 2 (guest info)
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: '',
    checkOut: '',
    guestCount: 1,
    totalNights: 0,
    subtotal: 0,
    serviceFee: 0,
    taxes: 0,
    total: 0,
    specialRequests: '',
    guestInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    paymentInfo: {
      method: 'CREDIT_CARD',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    }
  });

  useEffect(() => {
    if (studioId) {
      fetchStudio();
      
      // Récupérer les paramètres de l'URL (dates pré-remplies)
      const urlParams = new URLSearchParams(window.location.search);
      const checkIn = urlParams.get('checkIn');
      const checkOut = urlParams.get('checkOut');
      const guests = urlParams.get('guests');
      
      if (checkIn && checkOut && guests) {
        setBookingData(prev => ({
          ...prev,
          checkIn,
          checkOut,
          guestCount: parseInt(guests)
        }));
      }
    }
  }, [studioId]);

  useEffect(() => {
    if (bookingData.checkIn && bookingData.checkOut) {
      calculateTotalPrice();
    }
  }, [bookingData.checkIn, bookingData.checkOut, studio]);

  const fetchStudio = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/studios/${studioId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Studio data received:', data);
        // L'API devrait retourner directement le studio avec les relations
        setStudio(data);
      } else {
        console.error('Error response:', response.status);
        setError('Studio non trouvé');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Erreur lors du chargement du studio');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!studio || !bookingData.checkIn || !bookingData.checkOut) return;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    
    if (nights > 0) {
      // Calculs en centimes (comme dans le schéma Prisma)
      const subtotal = studio.pricePerNight * nights; // déjà en centimes
      const serviceFee = Math.round(subtotal * 0.1); // 12% de frais de service
      const taxes = Math.round(subtotal * 0.05); // 5% de taxes
      const total = subtotal + serviceFee + taxes;
      
      setBookingData(prev => ({
        ...prev,
        totalNights: nights,
        subtotal: subtotal,
        serviceFee: serviceFee,
        taxes: taxes,
        total: total
      }));
    }
  };

  const handleInputChange = (section: keyof BookingData, field: string, value: string | number) => {
    if (section === 'guestInfo' || section === 'paymentInfo') {
      setBookingData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Version adaptée pour le composant de paiement
  const handlePaymentInputChange = (section: string, field: string, value: string) => {
    if (section === 'paymentInfo') {
      handleInputChange('paymentInfo', field, value);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 2:
        return Object.values(bookingData.guestInfo).every(value => value.trim() !== '');
      case 3:
        // La validation est maintenant gérée par BookingConfirmationManager
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Studio non trouvé'}
          </h2>
          <Link 
            href="/studios" 
            className="text-blue-600 hover:underline"
          >
            Retour aux studios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/studios/details/${studioId}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux détails
            </Link>
            
            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-4">
              {[2, 3, 4].map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 ${
                    step < currentStep ? 'text-blue-600' : 
                    step === currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step < currentStep ? 'bg-blue-600 border-blue-600 text-white' :
                    step === currentStep ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'
                  }`}>
                    {step < currentStep ? '✓' : step - 1}
                  </div>
                  <span className="text-sm font-medium">
                    {step === 2 && 'Infos'}
                    {step === 3 && 'Paiement'}
                    {step === 4 && 'Confirmation'}
                  </span>
                  {index < 2 && <div className="w-8 h-px bg-gray-300 mx-2"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Step 2: Guest Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Informations personnelles
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          value={bookingData.guestInfo.firstName}
                          onChange={(e) => handleInputChange('guestInfo', 'firstName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Votre prénom"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          value={bookingData.guestInfo.lastName}
                          onChange={(e) => handleInputChange('guestInfo', 'lastName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={bookingData.guestInfo.email}
                        onChange={(e) => handleInputChange('guestInfo', 'email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="votre.email@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={bookingData.guestInfo.phone}
                        onChange={(e) => handleInputChange('guestInfo', 'phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Demandes spéciales (optionnel)
                      </label>
                      <textarea
                        value={bookingData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', 'specialRequests', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Arrivée tardive, demandes particulières..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <BookingConfirmationManager
                  bookingData={{
                    studioId: parseInt(studioId),
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                    guestCount: bookingData.guestCount,
                    totalNights: bookingData.totalNights,
                    subtotal: bookingData.subtotal,
                    serviceFee: bookingData.serviceFee,
                    taxes: bookingData.taxes,
                    total: bookingData.total,
                    specialRequests: bookingData.specialRequests,
                    guestInfo: bookingData.guestInfo
                  }}
                  paymentInfo={bookingData.paymentInfo}
                  onInputChange={handlePaymentInputChange}
                  onBookingComplete={(bookingId) => {
                    console.log('Réservation confirmée:', bookingId);
                    setCurrentStep(4);
                  }}
                  onCancel={() => {
                    setCurrentStep(2); // Retour aux infos personnelles
                  }}
                />
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" fill="#10b981" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Réservation confirmée !
                  </h2>
                  
                  <p className="text-gray-600 mb-8">
                    Votre réservation a été confirmée. Vous recevrez un email de confirmation sous peu.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/studios/my-bookings"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Voir mes réservations
                    </Link>
                    <Link
                      href="/studios"
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Retour aux studios
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && currentStep !== 3 && (
                <div className="flex justify-between mt-8 pt-8 border-t">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 2}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      currentStep === 2 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Précédent
                  </button>
                  
                  <button
                    onClick={handleNextStep}
                    disabled={!validateStep(currentStep) || isSubmitting}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      !validateStep(currentStep) || isSubmitting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? 'Chargement...' : 'Suivant'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Studio Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex gap-4 mb-6">
                <img
                  src={studio.photos?.[0] || defaultImage}
                  alt={studio.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{studio.name}</h3>
                  <p className="text-sm text-gray-600">{studio.address}</p>
                  <p className="text-sm text-gray-600">{studio.city} {studio.postalCode}, {studio.country}</p>
                  {studio.surface && (
                    <p className="text-sm text-gray-500">{studio.surface}m²</p>
                  )}
                </div>
              </div>

              {bookingData.totalNights > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900">Détails du séjour</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Dates:</span>
                      <span>{bookingData.checkIn} → {bookingData.checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invités:</span>
                      <span>{bookingData.guestCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prix par nuit × {bookingData.totalNights} nuits:</span>
                      <SmartPriceDisplay
                        price={bookingData.subtotal}
                        size="sm"
                        showPaymentConversion={false}
                        className="text-right"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de service:</span>
                      <SmartPriceDisplay
                        price={bookingData.serviceFee}
                        size="sm"
                        showPaymentConversion={false}
                        className="text-right"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes:</span>
                      <SmartPriceDisplay
                        price={bookingData.taxes}
                        size="sm"
                        showPaymentConversion={false}
                        className="text-right"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total:</span>
                      <SmartPriceDisplay
                        price={bookingData.total}
                        size="lg"
                        showPaymentConversion={true}
                        paymentMethod={bookingData.paymentInfo.method}
                        className="text-right"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
