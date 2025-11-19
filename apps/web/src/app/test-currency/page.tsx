'use client';

import React from 'react';
import { useCurrency } from '../../hooks/useCurrency';

export default function TestCurrency() {
  const currency = useCurrency(); // Plus d'argument

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Test Système de Devises Simplifié</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-semibold">Devise Actuelle (Fixe)</h3>
              <p>Affichage: {currency.displayCurrency}</p>
              <p>Paiement: {currency.paymentCurrency}</p>
              <p>Chargement: {currency.isLoading ? 'Oui' : 'Non'}</p>
            </div>

            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-semibold">Formatage des Prix (FCFA)</h3>
              <p>1000 FCFA → {currency.formatPrice(1000)}</p>
              <p>50000 FCFA → {currency.formatPrice(50000)}</p>
              <p>131900 FCFA → {currency.formatPrice(131900)}</p>
            </div>

            <div className="p-4 bg-yellow-50 rounded">
              <h3 className="font-semibold">✅ Simplifications Effectuées</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>❌ Supprimé la détection géographique automatique</li>
                <li>❌ Supprimé la conversion multi-devises</li>
                <li>❌ Supprimé les appels API externes</li>
                <li>✅ Tout fonctionne en FCFA uniquement</li>
                <li>✅ Formatage simple et performant</li>
                <li>✅ Plus de doubles appels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
