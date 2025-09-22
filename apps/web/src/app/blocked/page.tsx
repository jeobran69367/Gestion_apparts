'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function BlockedAccess() {
  const searchParams = useSearchParams();
  const blockedMenu = searchParams.get('menu') || 'cette page';

  const menuDisplayNames: Record<string, string> = {
    'accueil': 'Accueil',
    'properties': 'Propriétés',
    'studios': 'Studios',
  };

  const displayName = menuDisplayNames[blockedMenu] || blockedMenu;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Accès Bloqué
          </h1>
          <p className="text-gray-600">
            L'accès à la section "{displayName}" est restreint pour votre compagnie.
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800">
            <p className="text-sm">
              Cette section du menu a été désactivée par votre administrateur. 
              Contactez votre équipe IT pour plus d'informations.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/?token=free_user"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors mr-2"
          >
            🆓 Tester sans restrictions
          </Link>
          <Link
            href="/auth/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
          <div className="mt-4 text-sm text-gray-500">
            <p>Test de la fonctionnalité:</p>
            <div className="space-y-1">
              <Link href="/?token=blocked_home_user" className="text-blue-600 hover:underline block">
                🚫 Utilisateur avec accueil bloqué
              </Link>
              <Link href="/?token=blocked_studios_user" className="text-blue-600 hover:underline block">
                🚫 Utilisateur avec studios bloqués
              </Link>
              <Link href="/?token=free_user" className="text-green-600 hover:underline block">
                ✅ Utilisateur libre (pas de restrictions)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}