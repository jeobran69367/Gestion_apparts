'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Interface pour les données du studio
export interface MaisonLocation {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  surface?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  isAvailable: boolean;
  minStay: number;
  maxStay: number;
  photos: string[];
  amenities: string[];
  rules?: string[];
  owner?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviews?: number;
  images?: string[];
  isNewListing?: boolean;
  isFeatured?: boolean;
  lastBooked?: string;
}

interface CardMaisonLocationProps {
  maison: MaisonLocation;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  onFavorite?: (id: number) => void;
  onShare?: (id: number) => void;
  onContact?: (id: number) => void;
}

export default function CardMaisonProprietaire({
  maison,
  showActions = true,
  variant = 'default',
  onFavorite,
  onShare,
  onContact
}: CardMaisonLocationProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Images par défaut
  const defaultImages = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
  ];

  const images = maison.photos?.length > 0 
    ? maison.photos 
    : (maison.images && maison.images.length > 0 ? maison.images : defaultImages);
  const priceInEuros = maison.pricePerNight;
  const rating = maison.rating || (4.0 + Math.random() * 1.0);
  const reviewCount = maison.reviews || (Math.floor(Math.random() * 80) + 20);

  // Auto rotation des images au survol
  useEffect(() => {
    if (images && images.length > 1 && isHovered) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [images, isHovered]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(maison.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: maison.name,
        text: `Découvrez ce magnifique studio à ${maison.city}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    onShare?.(maison.id);
  };

  const amenityIcons: { [key: string]: string } = {
    'wifi': '📶',
    'kitchen': '🍳',
    'parking': '🅿️',
    'air conditioning': '❄️',
    'heating': '🔥',
    'washing machine': '👕',
    'tv': '📺',
    'balcony': '🏖️',
    'terrace': '🏡',
    'garden': '🌿',
    'pool': '🏊',
    'gym': '💪',
    'elevator': '🛗',
    'pets allowed': '🐕',
    'workspace': '💻',
  };

  const formatAmenities = (amenities: string[]) => {
    const maxAmenities = variant === 'compact' ? 3 : 4;
    return amenities.slice(0, maxAmenities).map(amenity => ({
      name: amenity,
      icon: amenityIcons[amenity.toLowerCase()] || '✨'
    }));
  };

  const getAvailabilityStatus = () => {
    if (!maison.isAvailable) {
      return { text: 'Indisponible', color: 'text-red-600', bgColor: 'bg-red-50', dotColor: 'bg-red-500' };
    }
    if (maison.lastBooked && new Date(maison.lastBooked).getTime() > Date.now() - 24 * 60 * 60 * 1000) {
      return { text: 'Récemment réservé', color: 'text-amber-600', bgColor: 'bg-amber-50', dotColor: 'bg-amber-500' };
    }
    return { text: 'Disponible', color: 'text-success-600', bgColor: 'bg-success-50', dotColor: 'bg-success-500' };
  };

  const availabilityStatus = getAvailabilityStatus();
  const formattedAmenities = formatAmenities(maison.amenities);

  return (
    <div 
      className={`
        group relative flex flex-col overflow-hidden rounded-3xl
        bg-white shadow-soft border border-gray-100
        transition-all duration-500 ease-out
        hover:shadow-soft-lg hover:-translate-y-2
        ${variant === 'featured' ? 'ring-2 ring-accent-400 ring-offset-4' : ''}
        ${variant === 'compact' ? 'max-w-[320px]' : 'max-w-[400px]'}
        w-full h-full min-h-[480px]
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section Image avec overlay */}
      <div className={`relative ${variant === 'compact' ? 'h-52' : 'h-64'} overflow-hidden bg-gray-100`}>
        {/* Image principale avec zoom au survol */}
        <div className="image-zoom-container h-full">
          <img
            src={images && images[currentImageIndex] ? images[currentImageIndex] : defaultImages[0]}
            alt={maison.name}
            className={`
              image-zoom w-full h-full object-cover
              transition-opacity duration-500
              ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setIsImageLoaded(true)}
            loading="lazy"
          />
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 overlay-gradient pointer-events-none" />
        
        {/* Skeleton loader */}
        {!isImageLoaded && (
          <div className="absolute inset-0 loading-skeleton" />
        )}

        {/* Badges en haut à gauche */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {maison.isNewListing && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-full shadow-lg badge-float">
              <span>🆕</span>
              <span>Nouveau</span>
            </span>
          )}
          {variant === 'featured' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-500 text-white text-xs font-semibold rounded-full shadow-lg badge-float">
              <span>⭐</span>
              <span>Coup de cœur</span>
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${availabilityStatus.bgColor} ${availabilityStatus.color} text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm`}>
            <span className={`w-2 h-2 ${availabilityStatus.dotColor} rounded-full animate-pulse`}></span>
            <span>{availabilityStatus.text}</span>
          </span>
        </div>

        {/* Actions en haut à droite */}
        {showActions && (
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={handleFavoriteClick}
              className={`
                p-2.5 rounded-full backdrop-blur-xl transition-all duration-300
                ${isFavorited 
                  ? 'bg-red-500 text-white shadow-lg scale-110' 
                  : 'bg-white/90 text-gray-700 hover:bg-white hover:scale-110'
                }
                shadow-soft hover:shadow-lg
              `}
              aria-label="Ajouter aux favoris"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={handleShareClick}
              className="p-2.5 rounded-full bg-white/90 backdrop-blur-xl text-gray-700 shadow-soft hover:bg-white hover:scale-110 hover:shadow-lg transition-all duration-300"
              aria-label="Partager"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        )}

        {/* Indicateurs d'images */}
        {images && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentImageIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/60 hover:bg-white/80'
                  }
                `}
                aria-label={`Image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Prix en bas à droite */}
        <div className="absolute bottom-4 right-4 glass-effect px-4 py-2.5 rounded-xl shadow-lg">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">{priceInEuros}</span>
            <span className="text-sm text-gray-600">Fcfa</span>
            <span className="text-xs text-gray-500">/nuit</span>
          </div>
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="flex-1 flex flex-col p-5 bg-gradient-to-b from-white to-gray-50/50">
        {/* En-tête avec titre et rating */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
              {maison.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-1">{maison.city}, {maison.country}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg flex-shrink-0">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-600">({reviewCount})</span>
          </div>
        </div>

        {/* Description */}
        {maison.description && variant !== 'compact' && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {maison.description}
          </p>
        )}

        {/* Caractéristiques */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
          <div className="flex items-center gap-1.5">
            <span className="text-base">👥</span>
            <span className="font-medium">{maison.capacity}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🛏️</span>
            <span className="font-medium">{maison.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🚿</span>
            <span className="font-medium">{maison.bathrooms}</span>
          </div>
          {maison.surface && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">📐</span>
              <span className="font-medium">{maison.surface}m²</span>
            </div>
          )}
        </div>

        {/* Équipements */}
        {formattedAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formattedAmenities.map((amenity, index) => (
              <span key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors">
                <span>{amenity.icon}</span>
                <span className="capitalize">{amenity.name}</span>
              </span>
            ))}
            {maison.amenities.length > (variant === 'compact' ? 3 : 4) && (
              <span className="inline-flex items-center px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
                +{maison.amenities.length - (variant === 'compact' ? 3 : 4)}
              </span>
            )}
          </div>
        )}

        {/* Séjour info */}
        {variant !== 'compact' && (
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
            <span>Séjour min: {maison.minStay} nuit{maison.minStay > 1 ? 's' : ''}</span>
            <span>Max: {maison.maxStay} nuits</span>
          </div>
        )}

        {/* Propriétaire */}
        {maison.owner && variant !== 'compact' && (
          <div className="flex items-center gap-3 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {maison.owner.firstName[0]}{maison.owner.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                {maison.owner.firstName} {maison.owner.lastName}
              </p>
              <p className="text-xs text-gray-600">Propriétaire</p>
            </div>
            {onContact && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onContact(maison.id);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Contacter le propriétaire"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Bouton d'action */}
        <div className="mt-auto pt-2">
          {maison.isAvailable ? (
            <Link
              href={`/studios/details/${maison.id}`}
              className="btn btn-primary w-full justify-center group/btn"
            >
              <span>Voir les détails</span>
              <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ) : (
            <button
              disabled
              className="w-full px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
            >
              Indisponible
            </button>
          )}
        </div>

        {/* Footer avec statut et date */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${availabilityStatus.color}`}>
            <span className={`w-1.5 h-1.5 ${availabilityStatus.dotColor} rounded-full animate-pulse`}></span>
            <span>{availabilityStatus.text}</span>
          </span>
          
          {variant !== 'compact' && (
            <span className="text-xs text-gray-500">
              Mis à jour: {new Date(maison.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
