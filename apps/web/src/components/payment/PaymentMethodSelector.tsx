'use client';

import { useState } from 'react';
import CreditCardPayment from './CreditCardPayment';
import MonetbilPayment from './MonetbilPayment';
import PawaPayPayment from './PawaPayPayment';
import PaypalPayment from './PaypalPayment';

interface PaymentMethodSelectorProps {
  paymentInfo: any;
  onInputChange: (section: string, field: string, value: string) => void;
  amount?: number; // Montant en centimes
  currency?: string; // Devise
}

export default function PaymentMethodSelector({ 
  paymentInfo, 
  onInputChange, 
  amount = 0, 
  currency = 'EUR' 
}: PaymentMethodSelectorProps) {

  
  const [selectedMethod, setSelectedMethod] = useState(paymentInfo.method || 'CREDIT_CARD');

  const paymentMethods = [
    {
      id: 'CREDIT_CARD',
      name: 'Carte de crédit/débit',
      description: 'Visa, Mastercard, American Express',
      icon: '💳',
      popular: true
    },
    {
      id: 'PAYPAL',
      name: 'PayPal',
      description: 'Paiement rapide et sécurisé',
      icon: '🅿️',
      popular: false
    },
    {
      id: 'MONETBIL',
      name: 'Monetbil',
      description: 'Paiement mobile sécurisé BEAC',
      icon: '💰',
      popular: true
    },
    {
      id: 'PAWAPAY',
      name: 'PawaPay',
      description: 'Paiement mobile rapide et sécurisé',
      icon: '📱',
      countries: ['CM', 'CI', 'SN'], // Cameroun, Côte d'Ivoire, Sénégal
      currencies: ['XAF', 'XOF'],
      popular: false
    }
  ];

  const handleMethodChange = (methodId: string) => {
    setSelectedMethod(methodId);
    onInputChange('paymentInfo', 'method', methodId);
  };

  const handlePaymentInputChange = (field: string, value: string) => {
    onInputChange('paymentInfo', field, value);
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'CREDIT_CARD':
        return (
          <CreditCardPayment
            paymentInfo={paymentInfo}
            onInputChange={handlePaymentInputChange}
          />
        );
      
      case 'PAYPAL':
        return (
          <PaypalPayment
            paymentInfo={paymentInfo}
            onInputChange={handlePaymentInputChange} amount={0}          />
        );
      
      case 'MONETBIL':
        return (
          <MonetbilPayment
            paymentInfo={paymentInfo}
            onInputChange={handlePaymentInputChange}
            amount={amount}
          />
        );
      
      case 'PAWAPAY':
        return (
          <PawaPayPayment
            paymentInfo={paymentInfo}
            onInputChange={handlePaymentInputChange}
            amount={amount}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Informations de paiement
        </h2>
        
        {/* Sélecteur de méthode de paiement */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Choisissez votre méthode de paiement *
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => handleMethodChange(e.target.value)}
                  className="sr-only"
                />
                
                {/* Badge populaire */}
                {method.popular && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Populaire
                  </div>
                )}
                
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">{method.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                  </div>
                </div>
                
                {/* Indicateur de sélection */}
                {selectedMethod === method.id && (
                  <div className="absolute top-4 right-4">
                    <svg width="24" height="24" fill="#3b82f6" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Formulaire de paiement dynamique */}
      <div className="bg-gray-50 rounded-xl p-6">
        {renderPaymentForm()}
      </div>     
    </div>
  );
}
