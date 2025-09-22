'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TestMiddleware() {
  const [currentToken, setCurrentToken] = useState('');

  const testScenarios = [
    {
      id: 'blocked_home_user',
      name: 'Utilisateur avec Accueil Bloqué',
      description: 'CompagnieA - Accueil bloqué',
      blockedMenus: ['accueil'],
      color: 'bg-red-100 border-red-300'
    },
    {
      id: 'blocked_studios_user', 
      name: 'Utilisateur avec Studios Bloqués',
      description: 'CompagnieB - Studios et Propriétés bloqués',
      blockedMenus: ['studios', 'properties'],
      color: 'bg-orange-100 border-orange-300'
    },
    {
      id: 'free_user',
      name: 'Utilisateur Libre',
      description: 'Aucune compagnie - Pas de restrictions',
      blockedMenus: [],
      color: 'bg-green-100 border-green-300'
    }
  ];

  const testRoutes = [
    { path: '/', name: 'Accueil', menu: 'accueil' },
    { path: '/properties', name: 'Propriétés', menu: 'properties' },
    { path: '/studios', name: 'Studios', menu: 'studios' },
    { path: '/studios/my-studios', name: 'Mes Studios', menu: 'studios' },
    { path: '/studios/create', name: 'Créer Studio', menu: 'studios' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🛡️ Test du Middleware de Restriction d'Accès
          </h1>
          <p className="text-gray-600 mb-6">
            Cette page permet de tester le middleware qui bloque l'accès aux URLs 
            en fonction des menus bloqués pour chaque compagnie.
          </p>
        </div>

        {/* Scénarios de test */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {testScenarios.map((scenario) => (
            <div key={scenario.id} className={`border-2 rounded-lg p-4 ${scenario.color}`}>
              <h3 className="font-semibold text-lg mb-2">{scenario.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
              
              {scenario.blockedMenus.length > 0 ? (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Menus bloqués:</p>
                  <div className="flex flex-wrap gap-1">
                    {scenario.blockedMenus.map((menu) => (
                      <span key={menu} className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">
                        {menu}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-green-700 mb-3">✅ Aucune restriction</p>
              )}

              <button 
                onClick={() => setCurrentToken(scenario.id)}
                className={`w-full py-2 px-4 rounded font-medium text-sm transition-colors ${
                  currentToken === scenario.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                {currentToken === scenario.id ? 'Actuel' : 'Activer'}
              </button>
            </div>
          ))}
        </div>

        {/* Routes de test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Tester les Routes</h2>
          {currentToken ? (
            <>
              <p className="text-gray-600 mb-4">
                Utilisateur actuel: <span className="font-medium">{testScenarios.find(s => s.id === currentToken)?.name}</span>
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {testRoutes.map((route) => {
                  const isBlocked = testScenarios
                    .find(s => s.id === currentToken)
                    ?.blockedMenus.includes(route.menu);
                  
                  return (
                    <Link
                      key={route.path}
                      href={`${route.path}?token=${currentToken}`}
                      className={`block p-3 border rounded-lg transition-colors ${
                        isBlocked 
                          ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                          : 'border-green-300 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{route.name}</span>
                        <span className="text-xs">
                          {isBlocked ? '🚫' : '✅'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {route.path} → {route.menu}
                      </div>
                      {isBlocked && (
                        <div className="text-xs text-red-600 mt-1">
                          Sera bloqué et redirigé vers /blocked
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">
              Sélectionnez un scénario de test ci-dessus pour commencer.
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Comment ça marche</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Choisissez un scénario de test pour définir les restrictions</li>
            <li>• Cliquez sur une route pour la tester</li>
            <li>• Les routes bloquées vous redirigeront vers la page /blocked</li>
            <li>• Les routes autorisées s'afficheront normalement</li>
            <li>• Le middleware vérifie le token dans l'URL pour cette démo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}