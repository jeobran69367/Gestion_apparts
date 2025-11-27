import React from 'react';

interface StudioSummaryProps {
  studio: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    surface?: number;
    photos?: string[];
  };
  defaultImage: string;
}

const StudioSummary: React.FC<StudioSummaryProps> = ({ studio, defaultImage }) => {
  return (
    <div className="flex gap-4 mb-6">
      <img
        src={studio.photos?.[0] || defaultImage}
        alt={studio.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{studio.name}</h3>
        <p className="text-sm text-gray-600">{studio.address}</p>
        <p className="text-sm text-gray-600">{studio.city} {studio.postalCode}, {studio.country}</p>
        {studio.surface && (
          <p className="text-sm text-gray-500">{studio.surface}m²</p>
        )}
      </div>
    </div>
  );
};

export default StudioSummary;
