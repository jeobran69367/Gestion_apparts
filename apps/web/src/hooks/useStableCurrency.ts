'use client';

import { useMemo } from 'react';

// Version simplifiée stable - tout en FCFA
interface StableCurrencyState {
  userCountry: string;
  userCurrency: string;
  displayCurrency: string;
  paymentCurrency: string;
  paymentMethod: string;
  isLoading: boolean;
}

// Hook simplifié et stable - plus de détection géographique
export function useStableCurrency() {
  const state: StableCurrencyState = {
    userCountry: 'CM',
    userCurrency: 'XAF',
    displayCurrency: 'XAF',
    paymentCurrency: 'XAF',
    paymentMethod: 'CREDIT_CARD',
    isLoading: false
  };

  // Fonctions stables mémorisées
  const actions = useMemo(() => ({
    updatePaymentMethod: (method: string) => {
      // Pas d'update nécessaire - toujours XAF
    },
    
    convertPrice: (price: number, targetCurrency?: string) => {
      // Pas de conversion - toujours FCFA
      return price;
    },
    
    formatPrice: (price: number, currency?: string) => {
      return new Intl.NumberFormat('fr-CM', {
        style: 'decimal',
        minimumFractionDigits: 0
      }).format(price) + ' FCFA';
    }
  }), []);

  return {
    ...state,
    ...actions
  };
}

// Hook simplifié pour les prix
export function useSimplePrice(price: number, paymentMethod?: string) {
  const currency = useStableCurrency();

  // Calculs mémorisés
  const priceData = useMemo(() => {
    if (price <= 0) {
      return {
        display: '...',
        payment: '...',
        showConversion: false,
        conversion: null
      };
    }

    const displayPrice = currency.formatPrice(price);
    
    return {
      display: displayPrice,
      payment: displayPrice,
      showConversion: false,
      conversion: null
    };
  }, [currency.formatPrice, price]);

  return {
    ...currency,
    priceData
  };
}
