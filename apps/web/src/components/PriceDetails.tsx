import React from 'react';

interface PriceDetailsProps {
  pricePerNight: number; // Prix par nuit en centimes
  totalNights: number; // Nombre total de nuits
  className?: string;
}

const PriceDetails: React.FC<PriceDetailsProps> = ({ pricePerNight, totalNights, className = '' }) => {
  // Calculs
  const subtotal = pricePerNight * totalNights; // Sous-total
  const serviceFee = Math.round(subtotal * 0.12); // 12% de frais de service
  const taxes = Math.round(subtotal * 0.05); // 5% de taxes
  const total = subtotal + serviceFee + taxes; // Total

  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="font-semibold text-gray-900">Détail des prix</h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Logement ({totalNights} nuit{totalNights > 1 ? 's' : ''}):</span>
          <span>{(subtotal / 100).toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Frais de service (12%):</span>
          <span>{(serviceFee / 100).toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Taxes (5%):</span>
          <span>{(taxes / 100).toFixed(2)} €</span>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>{(total / 100).toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};

export default PriceDetails;
