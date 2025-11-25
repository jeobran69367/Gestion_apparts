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
  pricePerNight: number; // en centimes
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
  // Données simulées pour l'affichage
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

export default function CardMaisonLocation({
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

  // Images par défaut si aucune photo n'est fournie
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

  // Auto rotation des images
  useEffect(() => {
    if (images && images.length > 1 && isHovered) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [images, isHovered]);

  // Gestion des favoris
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(maison.id);
  };

  // Gestion du partage
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

  // Formater les équipements
  const formatAmenities = (amenities: string[]) => {
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
      'smoking allowed': '🚬',
      'breakfast': '🥐',
      'workspace': '💻',
      'fireplace': '🔥'
    };

    const maxAmenities = variant === 'compact' ? 3 : 4;
    return amenities.slice(0, maxAmenities).map(amenity => ({
      name: amenity,
      icon: amenityIcons[amenity.toLowerCase()] || '✨'
    }));
  };

  // Calculer la disponibilité
  const getAvailabilityStatus = () => {
    if (!maison.isAvailable) {
      return { text: 'Indisponible', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
    }
    if (maison.lastBooked && new Date(maison.lastBooked).getTime() > Date.now() - 24 * 60 * 60 * 1000) {
      return { text: 'Récemment réservé', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' };
    }
    return { text: 'Disponible', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' };
  };

  const availabilityStatus = getAvailabilityStatus();
  const formattedAmenities = formatAmenities(maison.amenities);

  // Styles CSS inline
  const cardStyles: React.CSSProperties = {
    maxWidth: variant === 'compact' ? '280px' : '350px',
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: isHovered 
      ? '0 20px 40px rgba(0, 0, 0, 0.15)' 
      : '0 8px 25px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    transform: isHovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
    border: variant === 'featured' ? '2px solid #fbbf24' : 'none',
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // important pour éviter le débordement
    minHeight: '400px' // hauteur minimale pour un affichage cohérent
  };


  const imageContainerStyles: React.CSSProperties = {
    position: 'relative',
    height: variant === 'compact' ? '160px' : '180px',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9'
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'all 0.5s ease',
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    opacity: isImageLoaded ? 1 : 0
  };

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)'
  };

  const badgeStyles: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const actionButtonsStyles: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    display: 'flex',
    gap: '8px'
  };

  const priceTagStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const contentStyles: React.CSSProperties = {
    padding: variant === 'compact' ? '14px' : '18px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '0 0 20px 20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: variant === 'compact' ? '16px' : '18px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '6px',
    lineHeight: '1.2',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const locationStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6b7280',
    fontSize: '13px',
    marginBottom: '12px'
  };

  const descriptionStyles: React.CSSProperties = {
    color: '#6b7280',
    fontSize: '13px',
    lineHeight: '1.4',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const featuresStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '12px',
    marginBottom: '12px',
    fontSize: '13px',
    color: '#6b7280'
  };

  const amenitiesContainerStyles: React.CSSProperties = {
    marginBottom: '12px'
  };

  const amenitiesGridStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  };

  const amenityTagStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '4px 8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#374151'
  };

  const ownerSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    backdropFilter: 'blur(5px)',
    borderRadius: '10px',
    marginBottom: '16px'
  };

  const ownerAvatarStyles: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600'
  };

  const buttonsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '10px'
  };

  const primaryButtonStyles: React.CSSProperties = {
    flex: 1,
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '10px',
    fontWeight: '600',
    textAlign: 'center',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '13px'
  };

  const secondaryButtonStyles: React.CSSProperties = {
    flex: 1,
    background: 'white',
    color: '#3b82f6',
    padding: '12px 16px',
    borderRadius: '10px',
    fontWeight: '600',
    textAlign: 'center',
    textDecoration: 'none',
    border: '2px solid #3b82f6',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '13px'
  };

  return (
    <>
      <style jsx>{`
        .card-container:hover .primary-btn {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }
        .card-container:hover .secondary-btn {
          background: #3b82f6;
          color: white;
        }
        .icon-button {
          padding: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .icon-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        .favorite-button.active {
          background: #ef4444;
          color: white;
        }
        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }
        .badge-new {
          background: #3b82f6;
          animation: pulse 2s infinite;
        }
        .badge-featured {
          background: #fbbf24;
          color: #1f2937;
          animation: float 3s ease-in-out infinite;
        }
        .badge-status {
          background: ${availabilityStatus.color};
        }
        .image-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .image-indicator.active {
          background: white;
          transform: scale(1.2);
        }
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
      `}</style>

      <div 
        className="card-container"
        style={cardStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Section Image */}
        <div style={imageContainerStyles}>
          <img
            src={images && images[currentImageIndex] ? images[currentImageIndex] : defaultImages[0]}
            alt={maison.name}
            style={imageStyles}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          <div style={overlayStyles} />
          
          {/* Skeleton loader */}
          {!isImageLoaded && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }} className="loading-skeleton" />
          )}

          {/* Badges */}
          <div style={badgeStyles}>
            {maison.isNewListing && (
              <span className="badge badge-new">🆕 Nouveau</span>
            )}
            {variant === 'featured' && (
              <span className="badge badge-featured">⭐ Coup de cœur</span>
            )}
            <span className="badge badge-status">{availabilityStatus.text}</span>
          </div>

          {/* Actions */}
          {showActions && (
            <div style={actionButtonsStyles}>
              <button
                onClick={handleFavoriteClick}
                className={`icon-button favorite-button ${isFavorited ? 'active' : ''}`}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button onClick={handleShareClick} className="icon-button">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          )}

          {/* Indicateurs d'images */}
          {images && images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px'
            }}>
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`image-indicator ${index === currentImageIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          )}

          {/* Prix */}
          <div style={priceTagStyles}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
              {priceInEuros}Fcfa
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '2px' }}>
              /nuit
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div style={contentStyles}>
          {/* En-tête */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={titleStyles}>{maison.name}</h3>
              <div style={locationStyles}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{maison.city}, {maison.country}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '10px' }}>
              <svg width="14" height="14" fill="#fbbf24" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                {rating.toFixed(1)}
              </span>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                ({reviewCount})
              </span>
            </div>
          </div>

          {/* Description */}
          {maison.description && (
            <p style={descriptionStyles}>{maison.description}</p>
          )}

          {/* Caractéristiques */}
          <div style={featuresStyles}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span>👥</span>
              <span>{maison.capacity} pers.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span>🛏️</span>
              <span>{maison.bedrooms} ch.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span>🚿</span>
              <span>{maison.bathrooms} sdb</span>
            </div>
            {maison.surface && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span>📐</span>
                <span>{maison.surface}m²</span>
              </div>
            )}
          </div>

          {/* Équipements */}
          {formattedAmenities.length > 0 && (
            <div style={amenitiesContainerStyles}>
              <div style={amenitiesGridStyles}>
                {formattedAmenities.map((amenity, index) => (
                  <span key={index} style={amenityTagStyles}>
                    <span>{amenity.icon}</span>
                    <span style={{ textTransform: 'capitalize' }}>{amenity.name}</span>
                  </span>
                ))}
                {maison.amenities.length > (variant === 'compact' ? 3 : 4) && (
                  <span style={{
                    ...amenityTagStyles,
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8'
                  }}>
                    +{maison.amenities.length - (variant === 'compact' ? 3 : 4)} autres
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Info séjour */}
          {variant !== 'compact' && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#9ca3af',
              marginBottom: '12px'
            }}>
              <span>Séjour min: {maison.minStay} nuit{maison.minStay > 1 ? 's' : ''}</span>
              <span>Max: {maison.maxStay} nuits</span>
            </div>
          )}

          {/* Propriétaire */}
          {maison.owner && variant !== 'compact' && (
            <div style={ownerSectionStyles}>
              <div style={ownerAvatarStyles}>
                {maison.owner.firstName[0]}{maison.owner.lastName[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {maison.owner.firstName} {maison.owner.lastName}
                </p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                  Propriétaire
                </p>
              </div>
              {onContact && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onContact(maison.id);
                  }}
                  style={{
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Boutons d'action */}
          <div style={{
            ...buttonsContainerStyles,
            marginTop: 'auto', // pousse les boutons vers le bas
            paddingTop: variant === 'compact' ? '8px' : '0'
          }}>
          
            {maison.isAvailable && (
              <Link
                href={`/studios/details/${maison.id}`}
                style={{
                  ...secondaryButtonStyles,
                  padding: variant === 'compact' ? '10px 12px' : '12px 16px',
                  fontSize: variant === 'compact' ? '12px' : '13px'
                }}
                className="secondary-btn"
              >
                Voir détails
              </Link>
            )}
          </div>

          {/* Statut final */}
          <div style={{
            display: 'flex',
            justifyContent: variant === 'compact' ? 'center' : 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '500',
              color: availabilityStatus.color
            }}>
              ● {availabilityStatus.text}
            </span>
            
            {variant !== 'compact' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#9ca3af'
              }}>
                <span>Mis à jour:</span>
                <span>{new Date(maison.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}