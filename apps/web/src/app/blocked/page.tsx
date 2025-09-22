'use client';

import Link from 'next/link';

export default function BlockedAccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Accès Bloqué
          </h1>
          <p className="text-gray-600">
            L'accès à cette page est restreint pour votre compagnie.
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
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
          <div>
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Se reconnecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}