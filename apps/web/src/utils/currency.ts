'use client';

// Version simplifiée - tout en FCFA
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'decimal',
    minimumFractionDigits: 0
  }).format(amount) + ' FCFA';
}

// Validation des montants
export function validateAmount(amount: number): boolean {
  return amount >= 100; // Minimum 100 FCFA
}
