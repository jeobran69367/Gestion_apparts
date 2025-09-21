'use client';

import CardMaisonLocation, { MaisonLocation } from '../../components/CardMaisonLocation';

const testStudio: MaisonLocation = {
  id: 1,
  name: "Studio Moderne Paris 1er",
  description: "Magnifique studio entièrement rénové au cœur de Paris. Idéal pour un séjour romantique ou professionnel. Vue sur la Seine.",
  address: "15 Rue de Rivoli",
  city: "Paris",
  postalCode: "75001", 
  country: "France",
  surface: 35,
  capacity: 2,
  bedrooms: 1,
  bathrooms: 1,
  pricePerNight: 12000, // 120€
  isAvailable: true,
  minStay: 2,
  maxStay: 14,
  photos: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
  ],
  amenities: ["wifi", "kitchen", "air conditioning", "tv", "workspace"],
  owner: {
    id: 1,
    email: "marie@example.com",
    firstName: "Marie",
    lastName: "Dupont"
  },
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
  rating: 4.8,
  reviews: 156,
  isFeatured: true
};

export default function TestSimplePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '40px'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
        Test Card Simple
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        width: '100%'
      }}>
        <CardMaisonLocation maison={testStudio} />
        <CardMaisonLocation maison={{...testStudio, isFeatured: false, isAvailable: false}} />
        <CardMaisonLocation maison={testStudio} variant="compact" />
      </div>
    </div>
  );
}
