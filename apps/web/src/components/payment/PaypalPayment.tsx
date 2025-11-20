'use client';

import { useEffect } from 'react';

interface PaypalPaymentProps {
  paymentInfo: {
    email?: string;
  };
  onInputChange: (field: string, value: string) => void;
  amount: number; // montant du paiement
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'YOUR_CLIENT_ID';

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PaypalPayment({ paymentInfo, onInputChange, amount }: PaypalPaymentProps) {

  // Injection du script PayPal (SDK)
  useEffect(() => {
    if (document.getElementById('paypal-sdk')) return;

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (_: any, actions: { order: { create: (arg0: { purchase_units: { amount: { value: string; }; }[]; }) => any; }; }) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: { value: (amount ).toFixed(2) },
                },
              ],
            });
          },
          onApprove: async (_: any, actions: { order: { capture: () => any; }; }) => {
            await actions.order.capture();
          },
        }).render('#paypal-button-container');
      }
    };
  }, [amount]);

  return (
    <div className="space-y-6">

      {/* En-tête PayPal */}
      <div className="flex items-center justify-between p-4 bg-blue-600 rounded-lg">
        <div>
          <h3 className="font-semibold text-white">PayPal</h3>
          <p className="text-sm text-blue-100">Paiement rapide et sécurisé</p>
        </div>
        <span className="text-white font-bold text-xl">PayPal</span>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg width="20" height="20" fill="#3b82f6" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h4 className="font-medium text-blue-800">Comment ça marche ?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Vous serez redirigé vers PayPal pour finaliser votre paiement en toute sécurité.
            </p>
          </div>
        </div>
      </div>

      {/* Email optionnel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email PayPal (optionnel)
        </label>
        <input
          type="email"
          value={paymentInfo.email || ''}
          onChange={(e) => onInputChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="votre-email@exemple.com"
        />
        <p className="text-xs text-gray-500 mt-1">
          Saisissez votre email PayPal pour accélérer le processus.
        </p>
      </div>

      {/* Bouton PayPal officiel */}
      <div className="pt-2">
        <div id="paypal-button-container"></div>
      </div>

      {/* Avantages */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Avantages PayPal</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          {[
            'Protection des acheteurs PayPal',
            'Aucune information bancaire partagée',
            'Paiement en un clic',
          ].map((text) => (
            <li key={text} className="flex items-center gap-2">
              <svg width="16" height="16" fill="#10b981" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
