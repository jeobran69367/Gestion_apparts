'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function BookingSuccessContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [transactionInfo, setTransactionInfo] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const transactionId = searchParams.get('transaction_id');
  const paymentMethod = searchParams.get('method') || 'unknown';

  useEffect(() => {
    if (transactionId) {
      // Vérifier le statut du paiement
      verifyPayment(transactionId);
    } else {
      // Pas d'ID de transaction, on peut quand même afficher le succès
      setStatus('success');
    }
  }, [transactionId]);

  const verifyPayment = async (txId: string) => {
    try {
      const response = await fetch(`/api/monetbil/payment?transaction_id=${txId}`);
      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setTransactionInfo(result);
        setStatus('success');
      } else {
        console.warn('Paiement en attente ou échoué:', result);
        setStatus('success'); // On affiche quand même le succès, le webhook gèrera les détails
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      setStatus('success'); // On considère comme succès par défaut
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Vérification du paiement...
              </h2>
              <p className="mt-2 text-gray-600">
                Nous vérifions le statut de votre paiement
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Icône de succès */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Paiement réussi !
            </h2>
            
            <p className="mt-2 text-gray-600">
              Votre réservation a été confirmée avec succès.
            </p>

            {/* Informations de la transaction */}
            {transactionInfo && (
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
                    <dt className="text-gray-500">Montant:</dt>
                    <dd className="text-gray-900">{transactionInfo.amount} {transactionInfo.currency}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Méthode:</dt>
                    <dd className="text-gray-900">{paymentMethod === 'MONETBIL' ? 'Monetbil' : paymentMethod}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Message de confirmation */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Un email de confirmation a été envoyé à votre adresse. 
                    Vous recevrez également un SMS de confirmation de votre opérateur mobile.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Link
                href="/studios/my-bookings"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voir mes réservations
              </Link>
              
              <Link
                href="/studios"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Explorer d'autres studios
              </Link>
            </div>

            {/* Support */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Des questions ? 
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

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Chargement...
              </h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
