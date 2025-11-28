'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';

export default function PaymentPage({ params: _params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { isLoggedIn, mounted } = useAuth();

  useEffect(() => {
    if (!mounted) return;

    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Chargement...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Page de paiement</h1>
        <p className="text-gray-600 mt-2">Fonctionnalité en cours de développement</p>
      </div>
    </div>
  );
}
