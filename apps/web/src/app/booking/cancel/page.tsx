'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BookingCancelPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'cancelled';
  const transactionId = searchParams.get('transaction_id');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Icône d'annulation */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Paiement annulé
            </h2>
            
            <p className="mt-2 text-gray-600">
              Votre paiement a été annulé. Votre réservation n'a pas été confirmée.
            </p>

            {/* Informations sur l'annulation */}
            {transactionId && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Détails de la transaction
                </h3>
                <dl className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">ID Transaction:</dt>
                    <dd className="text-gray-900 font-mono text-xs">{transactionId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Statut:</dt>
                    <dd className="text-red-600 font-medium">Annulé</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Raison de l'annulation */}
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {reason === 'timeout' && 'Le délai de paiement a expiré.'}
                    {reason === 'insufficient_funds' && 'Fonds insuffisants sur votre compte mobile.'}
                    {reason === 'cancelled' && 'Vous avez annulé le paiement.'}
                    {reason === 'failed' && 'Le paiement a échoué. Vérifiez vos informations et réessayez.'}
                    {!['timeout', 'insufficient_funds', 'cancelled', 'failed'].includes(reason) && 
                     'Le paiement n\'a pas pu être complété.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Suggestions d'actions */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Que faire maintenant ?
                  </h4>
                  <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Vérifiez le solde de votre compte mobile</li>
                    <li>Assurez-vous que votre numéro est correct</li>
                    <li>Essayez un autre mode de paiement</li>
                    <li>Contactez votre opérateur mobile si nécessaire</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Réessayer le paiement
              </button>
              
              <Link
                href="/studios"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retour aux studios
              </Link>
            </div>

            {/* Support */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Besoin d'aide ? 
                <Link href="/support" className="text-blue-600 hover:text-blue-500 ml-1">
                  Contactez notre support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
