# 🗄️ Guide Complet de Gestion de Base de Données

## Table des Matières
- [📋 Vue d'Ensemble](#-vue-densemble)
- [🚀 Installation et Configuration](#-installation-et-configuration)
- [🔄 Migrations](#-migrations)
- [🏗️ Création de Tables](#️-création-de-tables)
- [📊 Modélisation Avancée](#-modélisation-avancée)
- [🛠️ Outils et Scripts](#️-outils-et-scripts)
- [🔍 Debugging et Monitoring](#-debugging-et-monitoring)
- [⚡ Performance](#-performance)
- [🛡️ Sécurité](#️-sécurité)
- [🔄 Backup et Restore](#-backup-et-restore)

## 📋 Vue d'Ensemble

### Architecture Base de Données

```
PostgreSQL (Container)
    ↓
Prisma ORM
    ↓
NestJS API
    ↓
Next.js Frontend
```

### Configuration Actuelle

| Paramètre | Valeur |
|-----------|--------|
| **SGBD** | PostgreSQL 15 |
| **ORM** | Prisma 6.16.2 |
| **Port** | 5432 |
| **Base** | appdb |
| **User** | postgres |
| **Schema** | public |

## 🚀 Installation et Configuration

### 1. Configuration Initiale

```bash
# 1. Démarrer PostgreSQL
docker compose up -d postgres

# 2. Configurer les variables d'environnement
cp apps/api/.env.example apps/api/.env

# 3. Installer Prisma CLI globalement (optionnel)
npm install -g prisma

# 4. Générer le client Prisma
cd apps/api
npx prisma generate
```

### 2. Première Migration

```bash
# Créer la migration initiale
npx prisma migrate dev --name init

# Vérifier le statut
npx prisma migrate status
```

### 3. Variables d'Environnement

**Production**
```env
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
```

**Développement**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb"
```

**Test**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb_test"
```

## 🔄 Migrations

### Workflow de Migration

```mermaid
graph LR
    A[Modifier Schema] --> B[Générer Migration]
    B --> C[Réviser Migration]
    C --> D[Appliquer Migration]
    D --> E[Tester]
    E --> F[Commit]
```

### 1. Créer une Migration

#### Étapes Détaillées

```bash
# 1. Modifier le schema.prisma
vim apps/api/prisma/schema.prisma

# 2. Générer la migration
cd apps/api
npx prisma migrate dev --name "description_de_la_migration"

# 3. Vérifier les fichiers générés
ls prisma/migrations/

# 4. Réviser le SQL généré
cat prisma/migrations/XXXXXX_description_de_la_migration/migration.sql
```

#### Exemple Complet

**1. Modification du Schema**
```prisma
// Ajout d'un système d'avis
model Review {
  id        Int      @id @default(autoincrement())
  rating    Int      @db.SmallInt // 1-5
  comment   String?  @db.Text
  photos    String[] // URLs des photos
  
  // Relations
  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  bookingId Int      @unique
  
  // Métadonnées
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("reviews")
}

// Modification de Booking
model Booking {
  // ... champs existants
  review Review?
}
```

**2. Génération de la Migration**
```bash
npx prisma migrate dev --name "add_review_system"
```

**3. SQL Généré (exemple)**
```sql
-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "photos" TEXT[],
    "bookingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" 
    FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
```

### 2. Types de Migrations

#### 🆕 Ajouter une Table

```prisma
model Amenity {
  id          Int       @id @default(autoincrement())
  name        String    @unique @db.VarChar(100)
  icon        String    @db.VarChar(50)
  category    String    @db.VarChar(50)
  description String?   @db.Text
  
  // Relations many-to-many
  listings    ListingAmenity[]
  
  createdAt   DateTime  @default(now())
  
  @@map("amenities")
  @@index([category])
}

model ListingAmenity {
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  listingId Int
  amenity   Amenity @relation(fields: [amenityId], references: [id], onDelete: Cascade)
  amenityId Int
  
  @@id([listingId, amenityId])
  @@map("listing_amenities")
}
```

#### ➕ Ajouter des Colonnes

```prisma
model User {
  // Colonnes existantes...
  
  // Nouvelles colonnes
  phone         String?   @db.VarChar(20)
  dateOfBirth   DateTime?
  profileImage  String?   @db.VarChar(255)
  isVerified    Boolean   @default(false)
  lastLoginAt   DateTime?
  
  // Adresse (embedded)
  street        String?   @db.VarChar(255)
  city          String?   @db.VarChar(100)
  postalCode    String?   @db.VarChar(10)
  country       String?   @db.VarChar(2) // Code ISO
  
  // Préférences (JSON)
  preferences   Json?     @db.JsonB
  
  updatedAt     DateTime  @updatedAt
}
```

#### 🔄 Modifier des Colonnes

```prisma
model Listing {
  // Migration : Int -> BigInt pour supporter de gros montants
  priceCents    BigInt    @db.BigInt
  
  // Ajout de contraintes
  title         String    @db.VarChar(200) // Limite de caractères
  description   String?   @db.Text
  
  // Nouveaux champs
  currency      String    @default("EUR") @db.VarChar(3)
  beds          Int       @db.SmallInt
  baths         Int       @db.SmallInt
  area          Decimal?  @db.Decimal(8,2) // m²
  floor         Int?      @db.SmallInt
  maxGuests     Int       @default(2) @db.SmallInt
  
  // Géolocalisation
  latitude      Decimal?  @db.Decimal(10, 8)
  longitude     Decimal?  @db.Decimal(11, 8)
  
  // Status et visibilité
  status        String    @default("draft") @db.VarChar(20) // draft, published, archived
  isActive      Boolean   @default(true)
  
  // SEO
  slug          String?   @unique @db.VarChar(250)
  metaTitle     String?   @db.VarChar(60)
  metaDescription String? @db.VarChar(160)
}
```

#### 🗂️ Ajouter des Index et Contraintes

```prisma
model Listing {
  // ... champs existants
  
  // Index simples
  @@index([ownerId])
  @@index([status])
  @@index([isActive])
  @@index([createdAt])
  
  // Index composés
  @@index([status, isActive])
  @@index([city, status])
  @@index([priceCents, beds, baths])
  
  // Index de texte (pour la recherche)
  @@index([title], type: Hash)
  
  // Index géospatial (si supporté)
  @@index([latitude, longitude])
  
  // Contraintes personnalisées
  @@check([priceCents > 0])
  @@check([beds >= 0])
  @@check([baths >= 0])
}
```

### 3. Migrations Complexes

#### Migration de Données

Quand une migration nécessite une transformation de données :

```sql
-- migration.sql personnalisé
-- Étape 1: Ajouter nouvelle colonne
ALTER TABLE "listings" ADD COLUMN "currency" VARCHAR(3) DEFAULT 'EUR';

-- Étape 2: Migrer les données existantes
UPDATE "listings" 
SET "currency" = CASE 
  WHEN "priceCents" > 100000 THEN 'USD'  -- Supposons que les gros montants sont en USD
  ELSE 'EUR'
END;

-- Étape 3: Ajouter contrainte
ALTER TABLE "listings" ALTER COLUMN "currency" SET NOT NULL;
```

#### Migration avec Downtime Minimal

```bash
# 1. Créer migration avec nouvelles colonnes (non-breaking)
npx prisma migrate dev --name "add_new_columns"

# 2. Déployer le code qui utilise les deux versions
# 3. Migrer les données en arrière-plan
# 4. Créer migration pour supprimer anciennes colonnes
npx prisma migrate dev --name "remove_old_columns"
```

## 🏗️ Création de Tables

### 1. Conception de Table

#### Template de Base

```prisma
model NomDuModel {
  // Clé primaire
  id        Int      @id @default(autoincrement())
  
  // Champs business
  name      String   @db.VarChar(100)
  status    String   @default("active") @db.VarChar(20)
  
  // Relations
  parentId  Int?
  parent    NomDuModel? @relation("ParentChild", fields: [parentId], references: [id])
  children  NomDuModel[] @relation("ParentChild")
  
  // Métadonnées
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Configuration table
  @@map("nom_de_la_table")
  @@index([status])
  @@index([createdAt])
}
```

#### Exemple Complet : Table Messages

```prisma
model Message {
  id          Int      @id @default(autoincrement())
  
  // Contenu
  subject     String   @db.VarChar(200)
  content     String   @db.Text
  attachments String[] // URLs des fichiers
  
  // Relations
  senderId    Int
  sender      User     @relation("SentMessages", fields: [senderId], references: [id])
  recipientId Int
  recipient   User     @relation("ReceivedMessages", fields: [recipientId], references: [id])
  
  // Contexte (optionnel)
  listingId   Int?
  listing     Listing? @relation(fields: [listingId], references: [id])
  bookingId   Int?
  booking     Booking? @relation(fields: [bookingId], references: [id])
  
  // État
  isRead      Boolean  @default(false)
  readAt      DateTime?
  isArchived  Boolean  @default(false)
  isSpam      Boolean  @default(false)
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("messages")
  @@index([senderId])
  @@index([recipientId])
  @@index([isRead])
  @@index([createdAt])
  @@index([listingId])
}

// Mise à jour du modèle User
model User {
  // ... champs existants
  
  // Nouvelles relations
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
}
```

### 2. Types de Données Prisma

#### Types de Base

```prisma
model ExempleTypes {
  // Nombres
  intField      Int       // 32-bit signed integer
  bigIntField   BigInt    // 64-bit signed integer  
  floatField    Float     // Floating point number
  decimalField  Decimal   // Arbitrary precision decimal
  
  // Texte
  stringField   String    // Variable length string
  text          String    @db.Text // Long text
  varchar       String    @db.VarChar(100) // Fixed length
  
  // Booléens
  boolField     Boolean
  
  // Dates
  dateField     DateTime  // Timestamp
  dateOnly      DateTime  @db.Date // Date only
  timeOnly      DateTime  @db.Time // Time only
  
  // JSON
  jsonField     Json      // JSON object
  jsonbField    Json      @db.JsonB // PostgreSQL JSONB
  
  // Arrays (PostgreSQL only)
  tags          String[]  // Array of strings
  numbers       Int[]     // Array of integers
  
  // Bytes
  bytesField    Bytes     // Binary data
  
  // Optionnel
  optionalField String?   // Nullable field
  
  // Avec default
  defaultField  String    @default("valeur par défaut")
  uuidField     String    @default(uuid()) @db.Uuid
}
```

#### Types Spécialisés PostgreSQL

```prisma
model PostgreSQLTypes {
  // UUID
  id            String    @id @default(uuid()) @db.Uuid
  
  // Énumérations
  status        Status    // Enum défini
  
  // Géographie
  location      String    @db.Point // PostGIS
  
  // Réseau
  ipAddress     String    @db.Inet
  macAddress    String    @db.MacAddr
  
  // Types personnalisés
  customType    String    @db.CustomType("mon_type")
}

enum Status {
  ACTIVE
  INACTIVE
  PENDING
  CANCELLED
  
  @@map("status_enum")
}
```

### 3. Relations

#### One-to-Many

```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  listings Listing[] // Un-à-plusieurs
}

model Listing {
  id         Int       @id @default(autoincrement())
  categoryId Int?
  category   Category? @relation(fields: [categoryId], references: [id])
}
```

#### Many-to-Many

```prisma
model Tag {
  id       Int             @id @default(autoincrement())
  name     String          @unique
  listings ListingTag[]
}

model Listing {
  id   Int          @id @default(autoincrement())
  tags ListingTag[]
}

model ListingTag {
  listingId Int
  listing   Listing @relation(fields: [listingId], references: [id])
  tagId     Int
  tag       Tag     @relation(fields: [tagId], references: [id])
  
  // Champs additionnels pour la relation
  addedAt   DateTime @default(now())
  addedBy   Int?
  
  @@id([listingId, tagId])
}
```

#### Self-Relation

```prisma
model Category {
  id       Int        @id @default(autoincrement())
  name     String
  parentId Int?
  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
}
```

#### One-to-One

```prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  userId Int  @unique
  user   User @relation(fields: [userId], references: [id])
  bio    String?
}
```

## 📊 Modélisation Avancée

### 1. Patterns de Conception

#### Audit Trail (Historique des modifications)

```prisma
model AuditLog {
  id        Int      @id @default(autoincrement())
  
  // Entité modifiée
  tableName String   @db.VarChar(50)
  recordId  Int
  
  // Action
  action    String   @db.VarChar(10) // CREATE, UPDATE, DELETE
  
  // Données
  oldData   Json?    @db.JsonB
  newData   Json?    @db.JsonB
  changes   Json?    @db.JsonB // Champs modifiés uniquement
  
  // Métadonnées
  userId    Int?
  user      User?    @relation(fields: [userId], references: [id])
  userAgent String?  @db.Text
  ipAddress String?  @db.Inet
  timestamp DateTime @default(now())
  
  @@map("audit_logs")
  @@index([tableName, recordId])
  @@index([userId])
  @@index([timestamp])
}
```

#### Soft Delete

```prisma
model Listing {
  // ... champs existants
  
  // Soft delete
  deletedAt DateTime?
  deletedBy Int?
  
  @@map("listings")
}
```

#### Versioning

```prisma
model ListingVersion {
  id        Int      @id @default(autoincrement())
  listingId Int
  version   Int
  
  // Données versionnées
  title       String
  description String?
  priceCents  BigInt
  
  // Métadonnées
  createdAt   DateTime @default(now())
  createdBy   Int
  
  @@unique([listingId, version])
  @@map("listing_versions")
}
```

#### Multi-tenancy

```prisma
model Tenant {
  id       Int       @id @default(autoincrement())
  name     String
  slug     String    @unique
  settings Json      @db.JsonB
  users    User[]
  listings Listing[]
}

model User {
  id       Int     @id @default(autoincrement())
  tenantId Int
  tenant   Tenant  @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
}
```

### 2. Optimisations

#### Index Strategies

```prisma
model Listing {
  // ... champs
  
  // Index pour la recherche
  @@index([title], type: Hash) // Recherche exacte
  @@fulltext([title, description]) // Recherche full-text
  
  // Index composés pour filtres combinés
  @@index([status, isActive, createdAt])
  @@index([city, priceCents, beds])
  
  // Index partiel (PostgreSQL)
  @@index([ownerId], where: "status = 'published'")
}
```

#### Partitioning (PostgreSQL)

```sql
-- Exemple de partitioning par date
CREATE TABLE bookings_2024 PARTITION OF bookings
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

## 🛠️ Outils et Scripts

### 1. Scripts Utilitaires

#### Reset Base de Données

```bash
#!/bin/bash
# scripts/reset-db.sh

echo "⚠️ Reset de la base de données"
read -p "Confirmer? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  cd apps/api
  npx prisma migrate reset --force
  npx prisma db seed
  echo "✅ Base de données réinitialisée"
fi
```

#### Backup Automatique

```bash
#!/bin/bash
# scripts/backup-db.sh

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker compose exec postgres pg_dump -U postgres appdb > $BACKUP_FILE

echo "✅ Backup créé: $BACKUP_FILE"
```

#### Seeding

```typescript
// apps/api/prisma/seed.ts
import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Créer des utilisateurs de test
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        name: 'John Doe',
        password: 'hashedpassword',
        role: 'owner'
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        name: 'Jane Smith', 
        password: 'hashedpassword',
        role: 'guest'
      }
    })
  ])

  // Créer des annonces
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: 'Appartement Paris Centre',
        description: 'Magnifique appartement au cœur de Paris',
        priceCents: 15000, // 150€
        ownerId: users[0].id,
        photos: ['https://example.com/photo1.jpg']
      }
    })
  ])

  console.log('🌱 Seeding terminé')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### 2. Commandes Utiles

```bash
# Informations sur la base
docker compose exec postgres psql -U postgres -d appdb -c "\dt" # Tables
docker compose exec postgres psql -U postgres -d appdb -c "\di" # Index
docker compose exec postgres psql -U postgres -d appdb -c "\ds" # Séquences

# Performance
docker compose exec postgres psql -U postgres -d appdb -c "
  SELECT schemaname,tablename,attname,n_distinct,correlation 
  FROM pg_stats 
  WHERE tablename = 'listings';"

# Taille des tables
docker compose exec postgres psql -U postgres -d appdb -c "
  SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
  FROM pg_tables 
  WHERE schemaname = 'public';"
```

## 🔍 Debugging et Monitoring

### 1. Logs Prisma

```typescript
// apps/api/src/prisma/prisma.service.ts
import { PrismaClient } from './generated/prisma'

export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    })

    // Logger les requêtes lentes
    this.$on('query', (e) => {
      if (e.duration > 1000) { // > 1 seconde
        console.warn(`Slow query: ${e.duration}ms`, e.query)
      }
    })
  }
}
```

### 2. Monitoring Performance

```sql
-- Requêtes lentes
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  stddev_time
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Blocages
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

## ⚡ Performance

### 1. Optimisation des Requêtes

#### Utilisation d'Include et Select

```typescript
// ❌ N+1 Problem
const listings = await prisma.listing.findMany()
for (const listing of listings) {
  const owner = await prisma.user.findUnique({
    where: { id: listing.ownerId }
  })
}

// ✅ Include relation
const listings = await prisma.listing.findMany({
  include: {
    owner: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  }
})

// ✅ Select spécifique
const listings = await prisma.listing.findMany({
  select: {
    id: true,
    title: true,
    priceCents: true,
    owner: {
      select: {
        name: true
      }
    }
  }
})
```

#### Pagination Efficace

```typescript
// ✅ Cursor-based pagination (recommandé)
const listings = await prisma.listing.findMany({
  take: 10,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' }
})

// ✅ Offset pagination (pour UI simple)
const [listings, total] = await Promise.all([
  prisma.listing.findMany({
    take: 10,
    skip: (page - 1) * 10,
    orderBy: { createdAt: 'desc' }
  }),
  prisma.listing.count()
])
```

### 2. Connection Pooling

```typescript
// apps/api/src/prisma/prisma.service.ts
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '?connection_limit=10&pool_timeout=20'
        }
      }
    })
  }
}
```

## 🛡️ Sécurité

### 1. Row Level Security (RLS)

```sql
-- Activer RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne voient que leurs annonces
CREATE POLICY listings_isolation ON listings
FOR ALL TO app_user
USING (owner_id = current_setting('app.user_id')::int);
```

### 2. Validation des Données

```typescript
// apps/api/src/listings/dto/create-listing.dto.ts
import { IsString, IsInt, Min, Max, IsArray, IsOptional } from 'class-validator'

export class CreateListingDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string

  @IsInt()
  @Min(100) // Minimum 1€
  @Max(100000000) // Maximum 1M€
  priceCents: number

  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  photos: string[]
}
```

## 🔄 Backup et Restore

### 1. Backup Automatique

```bash
#!/bin/bash
# scripts/backup-cron.sh

# Backup quotidien à 2h du matin
# 0 2 * * * /path/to/scripts/backup-cron.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d)
BACKUP_FILE="$BACKUP_DIR/appdb_$DATE.sql"

# Créer le répertoire si nécessaire
mkdir -p $BACKUP_DIR

# Backup
docker compose exec -T postgres pg_dump -U postgres appdb > $BACKUP_FILE

# Compression
gzip $BACKUP_FILE

# Nettoyage (garder 30 jours)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "✅ Backup créé: $BACKUP_FILE.gz"
```

### 2. Restore

```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

echo "⚠️ ATTENTION: Ceci va écraser la base de données actuelle"
read -p "Continuer? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Arrêter l'API
  docker compose stop api
  
  # Restore
  if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | docker compose exec -T postgres psql -U postgres -d appdb
  else
    docker compose exec -T postgres psql -U postgres -d appdb < $BACKUP_FILE
  fi
  
  # Redémarrer l'API
  docker compose start api
  
  echo "✅ Restore terminé"
fi
```

## 📈 Monitoring et Métriques

### 1. Métriques Custom

```typescript
// apps/api/src/common/prisma-metrics.interceptor.ts
@Injectable()
export class PrismaMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now()
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start
        // Logger les métriques
        console.log(`Query duration: ${duration}ms`)
      })
    )
  }
}
```

### 2. Health Checks

```typescript
// apps/api/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('db')
  async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'ok', timestamp: new Date() }
    } catch (error) {
      throw new ServiceUnavailableException('Database unavailable')
    }
  }
}
```

---

Cette documentation couvre tous les aspects essentiels de la gestion de base de données pour votre projet. Utilisez-la comme référence pour toutes vos opérations de base de données futures.
