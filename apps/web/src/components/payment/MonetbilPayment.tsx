'use client';

import { useState } from 'react';
import { useCurrency } from '../../hooks/useCurrency';

interface MonetbilPaymentProps {
  paymentInfo: {
    phoneNumber?: string;
    country?: string;
    operator?: string;
    email?: string;
  };
  onInputChange: (field: string, value: string) => void;
  amount?: number; // Montant en FCFA directement
}

export default function MonetbilPayment({ 
  paymentInfo, 
  onInputChange, 
  amount = 0
}: MonetbilPaymentProps) {
  const [error, setError] = useState<string>('');
  
  // Hook simplifié (tout en FCFA)
  const currency = useCurrency();

  // Pays supportés par Monetbil (Afrique francophone)
  const countries = [
    { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
    { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
    { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: 'NE', name: 'Niger', flag: '🇳🇪' },
    { code: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: 'BJ', name: 'Bénin', flag: '🇧🇯' }
  ];

  // Opérateurs par pays
  const operatorsByCountry: Record<string, Array<{code: string, name: string, ussd: string}>> = {
    CM: [
      { code: 'MTN', name: 'MTN Mobile Money', ussd: '*126#' },
      { code: 'ORANGE', name: 'Orange Money', ussd: '#150#' },
      { code: 'CAMTEL', name: 'Camtel Money', ussd: '*366#' }
    ],
    CI: [
      { code: 'MTN', name: 'MTN Mobile Money', ussd: '*133#' },
      { code: 'ORANGE', name: 'Orange Money', ussd: '#144#' },
      { code: 'MOOV', name: 'Moov Money', ussd: '*155#' }
    ],
    SN: [
      { code: 'ORANGE', name: 'Orange Money', ussd: '#144#' },
      { code: 'FREE', name: 'Free Money', ussd: '*880#' },
      { code: 'EXPRESSO', name: 'Expresso', ussd: '*232#' }
    ]
    // Autres pays peuvent être ajoutés
  };

  const selectedCountry = countries.find(c => c.code === paymentInfo.country);
  const availableOperators = paymentInfo.country ? operatorsByCountry[paymentInfo.country] || [] : [];

  const formatPhoneNumber = (value: string, country: string = 'CM'): string => {
    // Supprimer tous les caractères non numériques
    const cleaned = value.replace(/\D/g, '');
    
    // Mapping des préfixes par pays
    const countryPrefixes: Record<string, string> = {
      CM: '237', CI: '225', SN: '221', GA: '241', BF: '226', 
      ML: '223', NE: '227', TG: '228', BJ: '229'
    };
    
    const prefix = countryPrefixes[country] || '237';
    
    // Si le numéro commence par le préfixe, le garder
    if (cleaned.startsWith(prefix)) {
      return cleaned;
    }
    
    // Si le numéro commence par 6, 7, 8 ou 9 (numéros locaux)
    if (cleaned.length >= 8 && /^[6-9]/.test(cleaned)) {
      return prefix + cleaned;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value, paymentInfo.country);
    onInputChange('phoneNumber', formatted);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Paiement Mobile Money
        </h3>
        <p className="text-sm text-gray-600">
          Paiement sécurisé via Monetbil - {currency.formatPrice(amount)}
        </p>
      </div>

      {/* Sélection du pays */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pays *
        </label>
        <select
          value={paymentInfo.country || ''}
          onChange={(e) => {
            onInputChange('country', e.target.value);
            // Reset de l'opérateur quand on change de pays
            onInputChange('operator', '');
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Sélectionnez votre pays</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sélection de l'opérateur */}
      {paymentInfo.country && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opérateur Mobile Money *
          </label>
          <div className="grid grid-cols-1 gap-2">
            {availableOperators.map((operator) => (
              <label
                key={operator.code}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  paymentInfo.operator === operator.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={operator.code}
                  checked={paymentInfo.operator === operator.code}
                  onChange={(e) => onInputChange('operator', e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{operator.name}</div>
                  <div className="text-sm text-gray-500">Code USSD: {operator.ussd}</div>
                </div>
                {paymentInfo.operator === operator.code && (
                  <div className="text-blue-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Numéro de téléphone */}
      {paymentInfo.country && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">
                {selectedCountry?.flag} +{paymentInfo.country === 'CM' ? '237' : 
                  paymentInfo.country === 'CI' ? '225' : 
                  paymentInfo.country === 'SN' ? '221' : '237'}
              </span>
            </div>
            <input
              type="tel"
              value={paymentInfo.phoneNumber || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="6 12 34 56 78"
              className="w-full pl-16 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Format: 237612345678 (avec indicatif pays)
          </p>
        </div>
      )}

      {/* Email (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email (optionnel)
        </label>
        <input
          type="email"
          value={paymentInfo.email || ''}
          onChange={(e) => onInputChange('email', e.target.value)}
          placeholder="votre@email.com"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Pour recevoir la confirmation de paiement par email
        </p>
      </div>

      {/* Récapitulatif du paiement */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Récapitulatif</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Montant:</span>
            <span className="font-medium">{currency.formatPrice(amount)}</span>
          </div>
          {paymentInfo.country && (
            <div className="flex justify-between">
              <span className="text-gray-600">Pays:</span>
              <span className="font-medium">
                {selectedCountry?.flag} {selectedCountry?.name}
              </span>
            </div>
          )}
          {paymentInfo.operator && (
            <div className="flex justify-between">
              <span className="text-gray-600">Opérateur:</span>
              <span className="font-medium">
                {availableOperators.find(op => op.code === paymentInfo.operator)?.name}
              </span>
            </div>
          )}
          {paymentInfo.phoneNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Téléphone:</span>
              <span className="font-medium">{paymentInfo.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Informations importantes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Instructions de paiement:</p>
            <ul className="space-y-1 text-xs">
              <li>• Assurez-vous d'avoir un solde suffisant sur votre compte mobile money</li>
              <li>• Vous recevrez un code USSD à composer sur votre téléphone</li>
              <li>• Le paiement sera traité instantanément</li>
              <li>• Frais supplémentaires possibles selon votre opérateur</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
