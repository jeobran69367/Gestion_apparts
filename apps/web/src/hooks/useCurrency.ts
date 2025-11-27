'use client';

import { useCallback } from 'react';

// Version simplifiée - tout en FCFA
export interface CurrencyContextType {
  displayCurrency: string;
  paymentCurrency: string;
  formatPrice: (price: number) => string;
  isLoading: boolean;
}

export function useCurrency(): CurrencyContextType {
  // Formatage simple en FCFA
  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'decimal',
      minimumFractionDigits: 0
    }).format(price) + ' FCFA';
  }, []);

  return {
    displayCurrency: 'XAF',
    paymentCurrency: 'XAF',
    formatPrice,
    isLoading: false
  };
}

// Hook simplifié pour l'affichage des prix
export function useSmartPricing(price: number) {
  const currency = useCurrency();
  
  const smartPrice = {
    display: currency.formatPrice(price),
    payment: currency.formatPrice(price),
    conversion: null,
    showConversion: false
  };

  return {
    ...currency,
    smartPrice
  };
}
