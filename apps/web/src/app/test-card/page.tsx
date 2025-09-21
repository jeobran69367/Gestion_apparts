'use client';

import { useState } from 'react';
import CardMaisonLocation, { MaisonLocation } from '../../components/CardMaisonLocation';

// Données de test
const sampleStudio: MaisonLocation = {
  id: 1,
  name: "Studio Cosy Centre Ville Paris",
  description: "Magnifique studio entièrement rénové au cœur de Paris. Idéal pour un séjour romantique ou professionnel. Vue sur la Seine, équipements modernes et décoration soignée.",
  address: "15 Rue de Rivoli",
  city: "Paris",
  postalCode: "75001",
  country: "France",
  surface: 35,
  capacity: 2,
  bedrooms: 1,
  bathrooms: 1,
  pricePerNight: 12000, // 120€ en centimes
  isAvailable: true,
  minStay: 2,
  maxStay: 14,
  photos: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
  ],
  amenities: ["wifi", "kitchen", "air conditioning", "heating", "tv", "washing machine", "workspace", "elevator"],
  rules: ["Non fumeur", "Calme après 22h", "Animaux acceptés avec supplément"],
  owner: {
    id: 1,
    email: "marie.dupont@example.com",
    firstName: "Marie",
    lastName: "Dupont"
  },
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
  rating: 4.8,
  reviews: 156,
  isNewListing: false,
  isFeatured: true,
  lastBooked: "2024-01-18T09:00:00Z"
};

const sampleStudio2: MaisonLocation = {
  id: 2,
  name: "Loft Moderne Lyon",
  description: "Superbe loft industriel rénové dans le quartier de la Confluence. Hauteur sous plafond exceptionnelle, terrasse privative.",
  address: "42 Cours Charlemagne",
  city: "Lyon",
  postalCode: "69002",
  country: "France",
  surface: 65,
  capacity: 4,
  bedrooms: 2,
  bathrooms: 2,
  pricePerNight: 18000, // 180€ en centimes
  isAvailable: true,
  minStay: 1,
  maxStay: 30,
  photos: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop"
  ],
  amenities: ["wifi", "kitchen", "parking", "terrace", "fireplace", "tv", "gym"],
  owner: {
    id: 2,
    email: "pierre.martin@example.com",
    firstName: "Pierre",
    lastName: "Martin"
  },
  createdAt: "2024-01-10T08:00:00Z",
  updatedAt: "2024-01-22T12:15:00Z",
  rating: 4.5,
  reviews: 89,
  isNewListing: true,
  isFeatured: false
};

const unavailableStudio: MaisonLocation = {
  id: 3,
  name: "Studio Beachfront Nice",
  description: "Vue mer exceptionnelle, accès direct à la plage privée.",
  address: "8 Promenade des Anglais",
  city: "Nice",
  postalCode: "06000",
  country: "France",
  surface: 28,
  capacity: 2,
  bedrooms: 1,
  bathrooms: 1,
  pricePerNight: 15000, // 150€ en centimes
  isAvailable: false,
  minStay: 3,
  maxStay: 21,
  photos: [],
  amenities: ["wifi", "air conditioning", "balcony"],
  owner: {
    id: 3,
    email: "sophie.bernard@example.com",
    firstName: "Sophie",
    lastName: "Bernard"
  },
  createdAt: "2024-01-05T14:00:00Z",
  updatedAt: "2024-01-21T18:45:00Z",
  rating: 4.9,
  reviews: 234
};

export default function TestCardPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const handleFavorite = (id: number) => {
    setFavoriteIds(prev => 
      prev.includes(id) 
        ? prev.filter(fId => fId !== id)
        : [...prev, id]
    );
  };

  const handleShare = (id: number) => {
    console.log('Partager studio:', id);
    // Ajouter notification toast ici
  };

  const handleContact = (id: number) => {
    console.log('Contacter propriétaire du studio:', id);
    // Ouvrir modal de contact ou rediriger
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Test CardMaisonLocation
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Démonstration des différentes variantes de la carte studio avec toutes les fonctionnalités.
          </p>
        </div>

        {/* Section: Variante par défaut */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '30px', 
            color: '#1f2937' 
          }}>
            🏠 Variante Standard
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '30px' 
          }}>
            <CardMaisonLocation
              maison={sampleStudio}
              onFavorite={handleFavorite}
              onShare={handleShare}
              onContact={handleContact}
            />
            <CardMaisonLocation
              maison={sampleStudio2}
              onFavorite={handleFavorite}
              onShare={handleShare}
              onContact={handleContact}
            />
          </div>
        </section>

        {/* Section: Variante featured */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '30px', 
            color: '#1f2937' 
          }}>
            ⭐ Variante Coup de Cœur
          </h2>
          <div style={{ maxWidth: '450px' }}>
            <CardMaisonLocation
              maison={sampleStudio}
              variant="featured"
              onFavorite={handleFavorite}
              onShare={handleShare}
              onContact={handleContact}
            />
          </div>
        </section>

        {/* Section: Variante compacte */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '30px', 
            color: '#1f2937' 
          }}>
            📱 Variante Compacte
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '20px',
            maxWidth: '1000px'
          }}>
            <CardMaisonLocation
              maison={sampleStudio}
              variant="compact"
              onFavorite={handleFavorite}
              onShare={handleShare}
              onContact={handleContact}
            />
            <CardMaisonLocation
              maison={sampleStudio2}
              variant="compact"
              onFavorite={handleFavorite}
              onShare={handleShare}
              onContact={handleContact}
            />
          </div>
        </section>

        {/* Section: Studio indisponible */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '30px', 
            color: '#1f2937' 
          }}>
            🚫 Studio Indisponible
          </h2>
          <div style={{ maxWidth: '450px' }}>
            <CardMaisonLocation
              maison={unavailableStudio}
              onFavorite={handleFavorite}
              onShare={handleShare}
              onContact={handleContact}
            />
          </div>
        </section>

        {/* Section: Sans actions */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            marginBottom: '30px', 
            color: '#1f2937' 
          }}>
            👁️ Affichage Lecture Seule
          </h2>
          <div style={{ maxWidth: '450px' }}>
            <CardMaisonLocation
              maison={sampleStudio}
              showActions={false}
            />
          </div>
        </section>

        {/* Informations sur les interactions */}
        <section style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            marginBottom: '20px', 
            color: '#1f2937' 
          }}>
            🎮 Fonctionnalités Interactives
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '10px', color: '#374151' }}>
                🖱️ Interactions souris
              </h4>
              <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <li>• Survol → Rotation automatique des images</li>
                <li>• Survol → Effet de zoom sur l'image</li>
                <li>• Survol → Élévation de la carte</li>
                <li>• Clic → Navigation vers les détails</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '10px', color: '#374151' }}>
                ❤️ Actions utilisateur
              </h4>
              <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <li>• Favoris → Toggle visuel + callback</li>
                <li>• Partage → API native ou copie</li>
                <li>• Contact → Modal ou redirection</li>
                <li>• Réservation → Navigation contexte</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '10px', color: '#374151' }}>
                🎨 Adaptations visuelles
              </h4>
              <ul style={{ color: '#6b7280', lineHeight: '1.6' }}>
                <li>• Statut disponibilité → Couleurs</li>
                <li>• Nouveau listing → Badge animé</li>
                <li>• Coup de cœur → Bordure dorée</li>
                <li>• Images multiples → Indicateurs</li>
              </ul>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: '#f3f4f6', 
            borderRadius: '12px' 
          }}>
            <h4 style={{ fontWeight: '600', marginBottom: '10px', color: '#374151' }}>
              📊 Favoris actuels: {favoriteIds.length > 0 ? favoriteIds.join(', ') : 'Aucun'}
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Cliquez sur les cœurs pour tester le système de favoris. 
              Les IDs s'affichent ici et les callbacks sont loggés dans la console.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
