# 🏠 Mon-Appart - Plateforme de Location d'Appartements

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

Une plateforme moderne et complète pour la gestion de locations d'appartements, construite avec les meilleures pratiques du développement full-stack.

## 📋 Table des Matières

- [🏗️ Architecture](#️-architecture)
- [⚡ Quick Start](#-quick-start)
- [🛠️ Installation Détaillée](#️-installation-détaillée)
- [🗄️ Gestion Base de Données](#️-gestion-base-de-données)
- [📊 Modèles de Données](#-modèles-de-données)
- [🔄 Migrations](#-migrations)
- [🚀 Déploiement](#-déploiement)
- [🧪 Tests](#-tests)
- [📚 Documentation API](#-documentation-api)
- [🛡️ Sécurité](#️-sécurité)
- [🤝 Contribution](#-contribution)

## 🏗️ Architecture

```
mon-appart/
├── 📱 apps/
│   ├── 🌐 web/          # Frontend Next.js 15 + TypeScript
│   └── 🚀 api/          # Backend NestJS + Prisma
├── 📦 packages/         # Packages partagés
├── 🏗️ infra/           # Infrastructure as Code
├── 📖 docs/             # Documentation
├── 🐳 docker-compose.yml
├── 🚀 start.sh          # Script de démarrage
└── 🗄️ db.sh             # Gestionnaire BDD
```

### 🎯 Stack Technologique

| Composant | Technologie | Version | Rôle |
|-----------|-------------|---------|------|
| **Frontend** | Next.js | 15.5.3 | Interface utilisateur |
| **Backend** | NestJS | 11.0.1 | API REST |
| **Base de Données** | PostgreSQL | 15 | Stockage des données |
| **ORM** | Prisma | 6.16.2 | Gestion BDD |
| **Containerisation** | Docker | Latest | Environnement |
| **UI Framework** | TailwindCSS | 4 | Styles |

## ⚡ Quick Start

### Prérequis
- 🐳 Docker & Docker Compose
- 📦 Node.js 20+ (pour développement local)
- 🧶 Yarn (gestionnaire de packages)

### Démarrage Rapide

```bash
# Cloner le projet
git clone <votre-repo>
cd mon-appart

# Démarrage automatique
./start.sh
```

**🎉 C'est tout !** Vos services sont disponibles :
- 🌐 **Frontend** : http://localhost:3000
- 🚀 **API** : http://localhost:4000
- 🗄️ **Adminer** : http://localhost:8080
- 🐘 **PostgreSQL** : localhost:5432

## 🛠️ Installation Détaillée

### 1. Configuration de l'Environnement

#### Variables d'Environnement

**API (`apps/api/.env`)**
```env
# Base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb"

# Application
NODE_ENV=development
PORT=4000

# JWT (à configurer)
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=7d

# Upload (optionnel)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-bucket
```

**Web (`apps/web/.env.local`)**
```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:4000

# Configuration Next.js
NEXT_PUBLIC_APP_NAME="Mon-Appart"
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Installation Manuelle (Développement)

```bash
# Installation des dépendances racine
yarn install

# Installation API
cd apps/api
yarn install
cd ../..

# Installation Frontend
cd apps/web
yarn install
cd ../..

# Démarrage des services
docker compose up -d postgres adminer
cd apps/api && yarn start:dev &
cd apps/web && yarn dev
```

### 3. Configuration IDE

#### VS Code Extensions Recommandées
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode-remote.remote-containers"
  ]
}
```

## 🗄️ Gestion Base de Données

### Script de Gestion `./db.sh`

```bash
# Appliquer les migrations
./db.sh migrate

# Interface graphique Prisma Studio
./db.sh studio

# Voir le statut des migrations
./db.sh status

# Générer le client Prisma
./db.sh generate

# Seeder la base (optionnel)
./db.sh seed

# ⚠️ Réinitialiser la base (DANGER)
./db.sh reset
```

### Commandes Prisma Avancées

```bash
# Entrer dans le container API
docker compose exec api sh

# Commandes disponibles dans le container
npx prisma migrate dev --name "description-migration"
npx prisma db push
npx prisma studio --hostname 0.0.0.0
npx prisma generate
npx prisma migrate status
npx prisma migrate reset --force
```

## 📊 Modèles de Données

### Schéma Actuel

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("guest")
  listings  Listing[]
  bookings  Booking[]
  createdAt DateTime @default(now())
}

model Listing {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  priceCents  Int      // Prix en centimes
  owner       User     @relation(fields: [ownerId], references: [id])
  ownerId     Int
  photos      String[] // URLs des photos
  createdAt   DateTime @default(now())
  bookings    Booking[]
}

model Booking {
  id         Int      @id @default(autoincrement())
  listing    Listing  @relation(fields: [listingId], references: [id])
  listingId  Int
  guest      User     @relation(fields: [guestId], references: [id])
  guestId    Int
  startDate  DateTime
  endDate    DateTime
  totalCents Int
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}
```

### Diagramme ERD

```mermaid
erDiagram
    User ||--o{ Listing : owns
    User ||--o{ Booking : makes
    Listing ||--o{ Booking : has
    
    User {
        int id PK
        string email UK
        string password
        string name
        string role
        datetime createdAt
    }
    
    Listing {
        int id PK
        string title
        string description
        int priceCents
        int ownerId FK
        string_array photos
        datetime createdAt
    }
    
    Booking {
        int id PK
        int listingId FK
        int guestId FK
        datetime startDate
        datetime endDate
        int totalCents
        string status
        datetime createdAt
    }
```

## 🔄 Migrations

### Créer une Nouvelle Migration

#### 1. Modifier le Schéma Prisma

**Exemple : Ajouter un système de reviews**

```prisma
model Review {
  id        Int      @id @default(autoincrement())
  rating    Int      // 1-5 étoiles
  comment   String?
  booking   Booking  @relation(fields: [bookingId], references: [id])
  bookingId Int      @unique
  createdAt DateTime @default(now())
}

model Booking {
  // ... champs existants
  review    Review?  // Relation optionnelle
}
```

#### 2. Générer et Appliquer la Migration

```bash
# Méthode 1 : Via script (recommandé)
./db.sh migrate

# Méthode 2 : Directement dans le container
docker compose exec api npx prisma migrate dev --name "add-review-system"

# Méthode 3 : Développement local
cd apps/api
npx prisma migrate dev --name "add-review-system"
```

#### 3. Vérifier la Migration

```bash
# Voir le statut
./db.sh status

# Voir les tables créées
./db.sh studio
```

### Types de Migrations Courantes

#### 🆕 Ajouter une Table

```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  listings Listing[]
}

model Listing {
  // ... champs existants
  category   Category? @relation(fields: [categoryId], references: [id])
  categoryId Int?
}
```

#### ➕ Ajouter une Colonne

```prisma
model User {
  // ... champs existants
  phone      String?   // Nouvelle colonne
  verified   Boolean   @default(false)
  avatar     String?
}
```

#### 🔄 Modifier une Colonne

```prisma
model Listing {
  // ... champs existants
  priceCents BigInt    // Changé de Int à BigInt
  currency   String    @default("EUR") // Nouvelle colonne
}
```

#### 🗂️ Créer un Index

```prisma
model Listing {
  // ... champs existants
  
  @@index([ownerId])
  @@index([createdAt])
  @@index([priceCents])
}
```

### Rollback de Migrations

```bash
# Voir l'historique
./db.sh status

# Rollback (réinitialisation complète)
./db.sh reset

# Restaurer depuis une migration spécifique (manuel)
docker compose exec api sh
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npx prisma migrate deploy
```

## 🚀 Déploiement

### Environnements

#### 🔧 Développement
```bash
./start.sh
```

#### 🚀 Production

**Docker Compose Production**
```yaml
# docker-compose.prod.yml
services:
  api:
    build: ./apps/api
    environment:
      DATABASE_URL: "${PROD_DATABASE_URL}"
      NODE_ENV: production
    restart: always
    
  web:
    build: ./apps/web
    environment:
      NEXT_PUBLIC_API_URL: "${PROD_API_URL}"
    restart: always
```

**Déploiement**
```bash
# Build et déploiement
docker compose -f docker-compose.prod.yml up -d --build

# Migrations en production
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd apps/api && yarn install
          cd ../web && yarn install
          
      - name: Run tests
        run: |
          cd apps/api && yarn test
          cd ../web && yarn test
          
      - name: Build and Deploy
        run: |
          docker compose -f docker-compose.prod.yml up -d --build
          docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
```

## 🧪 Tests

### Structure des Tests

```
apps/api/
├── src/
│   ├── **/*.spec.ts     # Tests unitaires
│   └── **/*.e2e-spec.ts # Tests d'intégration
└── test/
    └── **/*.e2e-spec.ts  # Tests end-to-end
```

### Commandes de Test

```bash
# Tests unitaires API
cd apps/api
yarn test
yarn test:watch
yarn test:cov

# Tests e2e API
yarn test:e2e

# Tests Frontend
cd apps/web
yarn test
```

### Exemple de Test

```typescript
// apps/api/src/users/users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword'
    };

    jest.spyOn(prisma.user, 'create').mockResolvedValue({
      id: 1,
      ...userData,
      role: 'guest',
      createdAt: new Date()
    });

    const result = await service.create(userData);
    expect(result.email).toBe(userData.email);
  });
});
```

## 📚 Documentation API

### Endpoints Disponibles

#### 🔐 Authentication
```http
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
DELETE /auth/logout
```

#### 👥 Users
```http
GET    /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

#### 🏠 Listings
```http
GET    /listings
POST   /listings
GET    /listings/:id
PUT    /listings/:id
DELETE /listings/:id
POST   /listings/:id/photos
```

#### 📅 Bookings
```http
GET    /bookings
POST   /bookings
GET    /bookings/:id
PUT    /bookings/:id
DELETE /bookings/:id
```

### Documentation Swagger

L'API est documentée avec Swagger. Après démarrage :
- 📖 **Documentation** : http://localhost:4000/api/docs

## 🛡️ Sécurité

### Bonnes Pratiques Implémentées

- ✅ **Hashage des mots de passe** (bcrypt)
- ✅ **JWT pour l'authentification**
- ✅ **Variables d'environnement** pour les secrets
- ✅ **Validation des données** (class-validator)
- ✅ **CORS configuré**
- ✅ **Rate limiting** (à implémenter)
- ✅ **Helmet.js** (sécurité headers)

### Configuration Sécurité

```typescript
// apps/api/src/main.ts
app.use(helmet());
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

## 🤝 Contribution

### Workflow de Développement

1. **Fork** le projet
2. **Créer une branche** : `git checkout -b feature/nouvelle-fonctionnalite`
3. **Commiter** : `git commit -m 'Ajout nouvelle fonctionnalité'`
4. **Pousser** : `git push origin feature/nouvelle-fonctionnalite`
5. **Pull Request**

### Standards de Code

```bash
# Linting
cd apps/api && yarn lint
cd apps/web && yarn lint

# Formatting
cd apps/api && yarn format
cd apps/web && yarn format
```

### Commit Convention

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: refactoring
test: ajout de tests
chore: maintenance
```

## 📞 Support

- 📧 **Email** : support@mon-appart.com
- 📚 **Documentation** : [Wiki du projet]
- 🐛 **Issues** : [GitHub Issues]
- 💬 **Discussions** : [GitHub Discussions]

---

**Développé avec ❤️ par l'équipe Mon-Appart**
