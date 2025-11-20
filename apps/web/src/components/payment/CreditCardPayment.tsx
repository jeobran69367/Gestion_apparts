'use client';

import { ChangeEvent } from 'react';

interface CreditCardPaymentProps {
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
  onInputChange: (field: string, value: string) => void;
}

/* ----------------------------- Format Helpers ----------------------------- */

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
};

const detectCardType = (number: string): 'visa' | 'mastercard' | 'amex' | 'generic' => {
  const num = number.replace(/\s/g, '');

  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';

  return 'generic';
};

/* --------------------------- Component Principal -------------------------- */

export default function CreditCardPayment({
  paymentInfo,
  onInputChange
}: CreditCardPaymentProps) {
  
  // 🟢 CORRECTION : Utilisation du chaînage optionnel pour gérer le cas où paymentInfo est undefined.
  const cardNumberValue = paymentInfo?.cardNumber || '';
  const cardType = detectCardType(cardNumberValue);

  /* --------------------------- Change Handlers --------------------------- */

  const handleCardNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    onInputChange('cardNumber', formatted);
  };

  const handleExpiryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    onInputChange('expiryDate', formatted);
  };

  const handleCVVChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3);
    onInputChange('cvv', cleaned);
  };

  /* ------------------------------ UI Carte ------------------------------ */

  const cardLabel =
    cardType === 'visa'
      ? 'VISA'
      : cardType === 'mastercard'
      ? 'MC'
      : cardType === 'amex'
      ? 'AMEX'
      : '';

  const cardColor =
    cardType === 'visa'
      ? 'bg-blue-600'
      : cardType === 'mastercard'
      ? 'bg-red-600'
      : cardType === 'amex'
      ? 'bg-green-600'
      : 'bg-gray-400';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-blue-900">Paiement par carte bancaire</h3>
          <p className="text-sm text-blue-700">Transaction sécurisée via SSL</p>
        </div>

        <div className="flex gap-2">
          <div className="w-9 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
            VISA
          </div>
          <div className="w-9 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
            MC
          </div>
          <div className="w-9 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
            AE
          </div>
        </div>
      </div>

      {/* Cardholder name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom sur la carte *</label>
        <input
          type="text"
          // Assure que la valeur est une chaîne même si la propriété est manquante
          value={paymentInfo?.cardholderName || ''} 
          onChange={(e) => onInputChange('cardholderName', e.target.value)}
          placeholder="Nom complet"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Card number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de carte *</label>
        <div className="relative">
          <input
            type="text"
            // Assure que la valeur est une chaîne même si la propriété est manquante
            value={paymentInfo?.cardNumber || ''} 
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {cardType !== 'generic' && (
            <div className={`absolute right-3 top-2.5 w-10 h-7 rounded flex items-center justify-center text-white text-xs font-bold ${cardColor}`}>
              {cardLabel}
            </div>
          )}
        </div>
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration *</label>
          <input
            type="text"
            value={paymentInfo?.expiryDate || ''} // Assure que la valeur est une chaîne
            onChange={handleExpiryChange}
            placeholder="MM/AA"
            maxLength={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* CVV */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
          <input
            type="text"
            value={paymentInfo?.cvv || ''} // Assure que la valeur est une chaîne
            onChange={handleCVVChange}
            placeholder={cardType === 'amex' ? '1234' : '123'}
            maxLength={cardType === 'amex' ? 4 : 3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {cardType === 'amex'
              ? '4 chiffres au recto de votre carte AMEX'
              : '3 chiffres au dos de votre carte'}
          </p>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
        <svg width="20" height="20" fill="#10b981" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <h4 className="font-medium text-green-800">Paiement sécurisé</h4>
          <p className="text-sm text-green-700 mt-1">
            Vos informations sont protégées et chiffrées grâce à notre technologie SSL 256 bits.
          </p>
        </div>
      </div>

    </div>
  );
}