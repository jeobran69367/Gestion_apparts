'use client';

export default function PaymentPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Page de paiement</h1>
        <p className="text-gray-600 mt-2">Chargement...</p>
      </div>
    </div>
  );
}
