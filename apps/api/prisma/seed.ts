import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer des compagnies de test
  const company1 = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'CompagnieA',
      description: 'Compagnie avec accueil bloqué',
    },
  });

  const company2 = await prisma.company.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'CompagnieB',
      description: 'Compagnie avec studios bloqués',
    },
  });

  // Créer les paramètres de compagnie avec menus bloqués
  await prisma.companySettings.upsert({
    where: { companyId: company1.id },
    update: { blockedMenus: ['accueil'] },
    create: {
      companyId: company1.id,
      blockedMenus: ['accueil'],
    },
  });

  await prisma.companySettings.upsert({
    where: { companyId: company2.id },
    update: { blockedMenus: ['studios', 'properties'] },
    create: {
      companyId: company2.id,
      blockedMenus: ['studios', 'properties'],
    },
  });

  console.log('✅ Compagnies et paramètres créés');

  // Créer des utilisateurs de test
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Test',
      phone: '+33123456789',
      role: 'ADMIN',
      companyId: company1.id, // Compagnie avec accueil bloqué
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: hashedPassword,
      firstName: 'User',
      lastName: 'Test',
      phone: '+33987654321',
      role: 'GUEST',
      companyId: company2.id, // Compagnie avec studios bloqués
    },
  });

  // Utilisateur sans compagnie (pas de restrictions)
  const user3 = await prisma.user.upsert({
    where: { email: 'libre@test.com' },
    update: {},
    create: {
      email: 'libre@test.com',
      password: hashedPassword,
      firstName: 'Libre',
      lastName: 'Test',
      phone: '+33555666777',
      role: 'GUEST',
      companyId: null, // Pas de compagnie, donc pas de restrictions
    },
  });

  console.log('✅ Utilisateurs créés');

  // Créer des studios de test
  const studios = [
    {
      name: 'Studio Moderne Montmartre',
      description: 'Charmant studio au cœur de Montmartre avec vue sur Sacré-Cœur. Idéal pour un séjour romantique à Paris.',
      address: '15 Rue des Abbesses',
      city: 'Paris',
      postalCode: '75018',
      country: 'France',
      surface: 35.0,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: 8500, // 85€/nuit en centimes
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
      ],
      amenities: ['WiFi', 'Cuisine équipée', 'Chauffage', 'Ascenseur'],
      rules: ['Non fumeur', 'Pas d\'animaux', 'Check-in après 15h'],
      ownerId: user1.id,
    },
    {
      name: 'Appartement Lumineux Marais',
      description: 'Magnifique appartement dans le quartier historique du Marais. Proche des musées et restaurants.',
      address: '8 Rue de Rosiers',
      city: 'Paris',
      postalCode: '75004',
      country: 'France',
      surface: 55.0,
      capacity: 4,
      bedrooms: 2,
      bathrooms: 1,
      pricePerNight: 12000, // 120€/nuit
      photos: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
      ],
      amenities: ['WiFi', 'Cuisine équipée', 'Lave-linge', 'Climatisation', 'Balcon'],
      rules: ['Non fumeur', 'Pas de fêtes', 'Respecter le voisinage'],
      ownerId: user1.id,
    },
    {
      name: 'Studio Cosy Belleville',
      description: 'Studio moderne et confortable dans le quartier animé de Belleville. Parfait pour découvrir Paris autrement.',
      address: '42 Rue de Belleville',
      city: 'Paris',
      postalCode: '75020',
      country: 'France',
      surface: 28.0,
      capacity: 2,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: 6500, // 65€/nuit
      photos: [
        'https://images.unsplash.com/photo-1520637836862-4d197d17c13a?w=800'
      ],
      amenities: ['WiFi', 'Cuisine équipée', 'Chauffage'],
      rules: ['Non fumeur', 'Check-out avant 11h'],
      ownerId: user1.id,
    },
    {
      name: 'Loft Industriel République',
      description: 'Superbe loft dans un ancien atelier d\'artiste. Cachet industriel et confort moderne.',
      address: '25 Boulevard du Temple',
      city: 'Paris',
      postalCode: '75003',
      country: 'France',
      surface: 75.0,
      capacity: 6,
      bedrooms: 2,
      bathrooms: 2,
      pricePerNight: 15000, // 150€/nuit
      photos: [
        'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
      ],
      amenities: ['WiFi', 'Cuisine équipée', 'Lave-linge', 'Lave-vaisselle', 'Parking'],
      rules: ['Non fumeur', 'Pas d\'animaux', 'Pas de fêtes'],
      ownerId: user1.id,
    },
    {
      name: 'Studio Étudiant Bastille',
      description: 'Studio fonctionnel proche de la Bastille. Idéal pour les courts séjours et les budgets serrés.',
      address: '12 Rue de la Roquette',
      city: 'Paris',
      postalCode: '75011',
      country: 'France',
      surface: 22.0,
      capacity: 1,
      bedrooms: 1,
      bathrooms: 1,
      pricePerNight: 4500, // 45€/nuit
      photos: [
        'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800'
      ],
      amenities: ['WiFi', 'Cuisine équipée', 'Chauffage'],
      rules: ['Non fumeur', 'Calme après 22h'],
      ownerId: user1.id,
      isAvailable: false, // Occupé
    }
  ];

  for (const studioData of studios) {
    const existingStudio = await prisma.studio.findFirst({
      where: { 
        name: studioData.name,
        ownerId: studioData.ownerId 
      }
    });

    if (!existingStudio) {
      await prisma.studio.create({
        data: studioData,
      });
    }
  }

  console.log('✅ Studios créés');

  // Créer quelques réservations de test
  const reservations = [
    {
      checkIn: new Date('2024-01-15'),
      checkOut: new Date('2024-01-20'),
      nights: 5,
      guestCount: 2,
      subtotal: 42500, // 5 nuits * 85€
      cleaningFee: 2500,
      serviceFee: 1500,
      taxes: 3000,
      total: 49500,
      status: 'CONFIRMED' as const,
      specialRequests: 'Arrivée tardive prévue',
    }
  ];

  // Récupérer les studios pour les réservations
  const createdStudios = await prisma.studio.findMany({
    where: { ownerId: user1.id }
  });

  if (createdStudios.length > 0) {
    for (const reservationData of reservations) {
      await prisma.reservation.create({
        data: {
          ...reservationData,
          studioId: createdStudios[0].id,
          guestId: user2.id,
        }
      });
    }

    console.log('✅ Réservations créées');
  }

  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
