# 🏠 Gestion Apparts - Documentation Complète

Application complète de gestion de réservations de studios avec paiements intégrés.

---

## 📚 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation et Configuration Locale](#installation-et-configuration-locale)
4. [Déploiement en Production](#déploiement-en-production)
5. [Gestion des Images](#gestion-des-images)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Tests](#tests)
8. [Sécurité](#sécurité)
9. [Commandes de Référence](#commandes-de-référence)
10. [Dépannage](#dépannage)
11. [Support et Ressources](#support-et-ressources)

---

## Vue d'Ensemble

### 🌟 Fonctionnalités

- 🔐 **Authentification JWT** - Système d'authentification sécurisé
- 🏢 **Gestion de studios** - Interface complète pour les propriétaires
- 📅 **Système de réservations** - Gestion des réservations en temps réel
- 💳 **Intégration paiements** - Paiements via PawaPay
- 📧 **Notifications email** - Système de notifications automatiques
- 📱 **Interface responsive** - Compatible mobile, tablette et desktop
- 🖼️ **Upload d'images** - Gestion professionnelle des photos de studios

### 🔧 Technologies

#### Backend
- **Framework**: NestJS
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (Passport)
- **Email**: Nodemailer
- **Upload**: Multer
- **Tests**: Jest

#### Frontend
- **Framework**: Next.js 15
- **UI**: React 19
- **Styling**: Tailwind CSS
- **TypeScript**: 5.x

---

## Architecture

### Structure du Projet

```
Gestion_apparts/
├── .github/
│   └── workflows/          # CI/CD GitHub Actions
│       └── ci-cd.yml
├── apps/
│   ├── api/               # Backend NestJS + Prisma
│   │   ├── src/
│   │   │   ├── auth/      # Module d'authentification
│   │   │   ├── studios/   # Gestion des studios
│   │   │   ├── bookings/  # Système de réservations
│   │   │   ├── uploads/   # Gestion des images
│   │   │   └── main.ts    # Point d'entrée
│   │   ├── prisma/        # Schéma et migrations
│   │   └── uploads/       # Stockage des images
│   │       └── studios/
│   └── web/               # Frontend Next.js + React
│       ├── src/
│       │   ├── app/       # Pages et routes
│       │   ├── components/# Composants React
│       │   └── lib/       # Utilitaires
│       └── public/        # Assets statiques
├── railway.toml           # Configuration Railway
├── vercel.json            # Configuration Vercel
└── DOCUMENTATION_COMPLETE.md  # Ce fichier
```

### Architecture de Déploiement

```
┌─────────────────┐
│   Utilisateurs  │
└────────┬────────┘
         │
         ├─────────────────────────┬──────────────────────────┐
         │                         │                          │
         v                         v                          v
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Frontend Web   │─────>│  Backend API    │─────>│   PostgreSQL    │
│  (Vercel)       │      │  (Railway)      │      │   (Railway)     │
│  Next.js        │      │  NestJS         │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  │
                                  v
                         ┌─────────────────┐
                         │  Services Tiers │
                         │  - PawaPay      │
                         │  - Email SMTP   │
                         └─────────────────┘
```

---

## Installation et Configuration Locale

### Prérequis

- **Node.js** 18 ou supérieur
- **PostgreSQL** 14 ou supérieur
- **npm** ou **yarn**
- **Git**

### Étape 1: Cloner le Projet

```bash
git clone https://github.com/jeobran69367/Gestion_apparts.git
cd Gestion_apparts
```

### Étape 2: Configuration du Backend (API)

#### Installation des Dépendances

```bash
cd apps/api
npm install
```

#### Configuration de l'Environnement

1. Créer le fichier `.env`:
```bash
cp .env.example .env
```

2. Éditer `.env` avec vos valeurs:
```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/gestion_apparts"

# JWT
JWT_SECRET="votre_secret_jwt_tres_securise_32_caracteres_minimum"
JWT_EXPIRES_IN="7d"

# Email (exemple avec Gmail)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="votre_email@gmail.com"
EMAIL_PASSWORD="votre_mot_de_passe_application"
EMAIL_FROM="noreply@gestion-apparts.com"

# PawaPay
PAWAPAY_API_KEY="votre_cle_api_pawapay"
PAWAPAY_API_URL="https://api.pawapay.cloud"

# Frontend
FRONTEND_URL="http://localhost:3000"

# Environment
NODE_ENV="development"

# Upload
MAX_FILE_SIZE="100mb"
```

#### Initialiser la Base de Données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma migrate dev

# (Optionnel) Peupler avec des données de test
npm run db:seed
```

#### Démarrer le Backend

```bash
# Mode développement (hot-reload)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API est maintenant disponible sur: `http://localhost:4000`

### Étape 3: Configuration du Frontend (Web)

#### Installation des Dépendances

```bash
cd apps/web
npm install
```

#### Configuration de l'Environnement

1. Créer le fichier `.env.local`:
```bash
cp .env.example .env.local
```

2. Éditer `.env.local`:
```env
# URL de l'API Backend
NEXT_PUBLIC_API_URL=http://localhost:4000

# PawaPay
PAWAPAY_API_KEY=votre_cle_api_pawapay

# Application
NEXT_PUBLIC_APP_NAME="Gestion Apparts"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Démarrer le Frontend

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

L'application est maintenant disponible sur: `http://localhost:3000`

### Vérification de l'Installation

1. **Backend**: Ouvrir `http://localhost:4000/api/studios`
2. **Frontend**: Ouvrir `http://localhost:3000`
3. **Créer un compte** et tester les fonctionnalités

---

## Déploiement en Production

### Vue d'Ensemble

- **Backend (API)**: Déployé sur **Railway** 🚂
- **Frontend (Web)**: Déployé sur **Vercel** ▲
- **Base de données**: PostgreSQL sur **Railway**

### Prérequis Déploiement

- [x] Compte GitHub avec le repository
- [x] Compte [Railway](https://railway.app) (gratuit)
- [x] Compte [Vercel](https://vercel.com) (gratuit)
- [x] Clés API (PawaPay, Email)

---

### PARTIE 1: Déploiement du Backend sur Railway

#### Étape 1.1: Créer un Projet Railway

1. Se connecter à [Railway](https://railway.app)
2. Cliquer sur **"New Project"**
3. Sélectionner **"Deploy from GitHub repo"**
4. Choisir **`jeobran69367/Gestion_apparts`**
5. Railway détectera automatiquement le projet

#### Étape 1.2: Créer la Base de Données PostgreSQL

1. Dans le projet Railway, cliquer sur **"+ New"**
2. Sélectionner **"Database"** → **"Add PostgreSQL"**
3. Railway crée automatiquement la base de données
4. L'URL de connexion sera disponible dans les variables

#### Étape 1.3: Configurer les Variables d'Environnement

Dans Railway, onglet **"Variables"**, ajouter:

```bash
# Base de données (référence automatique)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Port (référence automatique)
PORT=${{PORT}}

# JWT Configuration (IMPORTANT: Changer en production!)
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi_32_caracteres_minimum
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail exemple)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application_google
EMAIL_FROM=noreply@gestion-apparts.com

# PawaPay Configuration
PAWAPAY_API_KEY=votre_cle_api_pawapay
PAWAPAY_API_URL=https://api.pawapay.cloud

# Frontend URL (mettre à jour après déploiement Vercel)
FRONTEND_URL=https://votre-app.vercel.app

# Environment
NODE_ENV=production

# Upload
MAX_FILE_SIZE=100mb
```

**📌 Note Gmail**: Pour utiliser Gmail:
1. Activer la validation en 2 étapes
2. Générer un "Mot de passe d'application" dans les paramètres de sécurité
3. Utiliser ce mot de passe pour `EMAIL_PASSWORD`

**🔒 Générer un JWT_SECRET sécurisé**:
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Étape 1.4: Configuration Automatique du Build

Railway utilise automatiquement `railway.toml`:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd apps/api && npm install && npx prisma generate && npm run build"

[deploy]
startCommand = "cd apps/api && npx prisma migrate deploy && npm run start:prod"
```

#### Étape 1.5: Déployer et Obtenir l'URL

1. Railway déploie automatiquement après configuration
2. Attendre le voyant vert ✅
3. **Settings** → **Generate Domain** pour obtenir une URL publique
4. **Copier l'URL** (ex: `https://gestion-apparts-api.railway.app`)

#### ✅ Vérifier le Backend

```bash
# Tester l'API
curl https://votre-app.railway.app/api/studios

# Ou dans le navigateur
https://votre-app.railway.app/api/studios
```

---

### PARTIE 2: Déploiement du Frontend sur Vercel

#### Étape 2.1: Importer sur Vercel

1. Se connecter à [Vercel](https://vercel.com)
2. **"Add New"** → **"Project"**
3. Importer: **`jeobran69367/Gestion_apparts`**
4. Vercel détecte automatiquement Next.js

#### Étape 2.2: Configurer le Projet

**⚠️ IMPORTANT pour Monorepo**:

1. **Root Directory**: `apps/web` (obligatoire!)
2. **Framework Preset**: Next.js (auto-détecté)
3. **Build Command**: Laisser par défaut
4. **Output Directory**: Laisser par défaut
5. **Install Command**: Laisser par défaut

#### Étape 2.3: Variables d'Environnement

Dans Vercel, **"Settings"** → **"Environment Variables"**:

```bash
# URL de l'API Backend (URL Railway)
NEXT_PUBLIC_API_URL=https://votre-app.railway.app

# PawaPay API Key
PAWAPAY_API_KEY=votre_cle_api_pawapay

# Application Info
NEXT_PUBLIC_APP_NAME=Gestion Apparts
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

**⚠️ Important**: Variables `NEXT_PUBLIC_*` sont exposées au navigateur.

#### Étape 2.4: Déployer

1. Cliquer sur **"Deploy"**
2. Attendre la fin du build
3. Obtenir l'URL (ex: `https://gestion-apparts.vercel.app`)
4. **Copier cette URL**

#### Étape 2.5: Mettre à Jour FRONTEND_URL sur Railway

1. Retourner sur Railway
2. Onglet **"Variables"**
3. Mettre à jour:
   ```
   FRONTEND_URL=https://votre-app.vercel.app
   ```
4. Railway redéploie automatiquement

#### ✅ Vérifier le Frontend

1. Ouvrir `https://votre-app.vercel.app`
2. Tester la connexion
3. Créer un studio
4. Vérifier les fonctionnalités

---

### 🔄 Redéploiements Automatiques

#### Déploiements Configurés

**Railway (Backend)**:
- Auto-déploiement sur push vers `master`
- Surveille les changements dans `apps/api/`

**Vercel (Frontend)**:
- Auto-déploiement sur push vers `master`
- Surveille les changements dans `apps/web/`

#### Forcer un Redéploiement Manuel

**Railway**: Deployments → Deploy
**Vercel**: Deployments → ••• → Redeploy

---

## Gestion des Images

### Vue d'Ensemble

Système professionnel de gestion d'images pour les studios, avec stockage sécurisé dans la base de données PostgreSQL.

### Architecture du Système d'Images

```
Frontend (Upload)
     │
     v
POST /api/uploads/studios/images
     │
     v
┌────────────────────┐
│ UploadsController  │ ← Validation (JWT, taille, type)
└─────────┬──────────┘
          │
          v
┌────────────────────┐
│  UploadsService    │ ← Traitement et stockage
└─────────┬──────────┘
          │
          v
┌────────────────────┐
│  File System       │ ← Stockage: apps/api/uploads/studios/
└────────────────────┘
```

### Endpoints API

#### 1. Upload d'Images

```http
POST /api/uploads/studios/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: FormData avec 'images' (max 10 fichiers)
```

**Validation**:
- Formats: JPEG, JPG, PNG, WEBP
- Taille max: 5MB par fichier
- Nombre max: 10 images par requête

**Réponse**:
```json
{
  "urls": [
    "http://localhost:4000/api/uploads/studios/studio-1234567890-123456789.jpg"
  ],
  "message": "1 image(s) uploadée(s) avec succès"
}
```

#### 2. Récupération d'Image

```http
GET /api/uploads/studios/:filename
```

Retourne le fichier image directement.

#### 3. Suppression d'Images

```http
DELETE /api/uploads/studios/images
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "urls": [
    "http://localhost:4000/api/uploads/studios/studio-xxx.jpg"
  ]
}
```

### Utilisation Frontend

#### Upload dans Create Studio

```typescript
// Exemple d'upload
const formData = new FormData();
selectedFiles.forEach(file => {
  formData.append('images', file);
});

const response = await fetch(`${API_URL}/api/uploads/studios/images`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { urls } = await response.json();
```

#### Affichage des Images

```jsx
{studio.photos?.map((url, index) => (
  <img 
    key={index}
    src={url}
    alt={`Photo ${index + 1}`}
  />
))}
```

### Nommage des Fichiers

Format: `studio-{timestamp}-{random}.{ext}`

Exemple: `studio-1702345678901-842736.jpg`

- **timestamp**: Millisecondes depuis epoch
- **random**: Nombre aléatoire 6 chiffres
- **ext**: Extension du fichier original

---

## CI/CD Pipeline

### Vue d'Ensemble

Pipeline automatique de qualité qui s'exécute avant chaque merge vers `master`.

### Configuration

Fichier: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  pull_request:
    branches:
      - master
  push:
    branches:
      - master

permissions:
  contents: read

jobs:
  api-tests:
    name: API - Tests, Lint & Build
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 18
      - Install dependencies (npm ci)
      - Run linter
      - Run tests
      - Build

  web-tests:
    name: Web - Lint & Build
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 18
      - Install dependencies (npm ci)
      - Run linter
      - Build

  all-tests-passed:
    name: All Tests Passed
    needs: [api-tests, web-tests]
    steps:
      - Confirmation message
```

### Fonctionnement

1. **Déclenchement**: Pull request vers `master` ou push sur `master`
2. **Jobs Parallèles**:
   - **API**: Lint → Test → Build
   - **Web**: Lint → Build
3. **Résultat**: Tous les jobs doivent réussir pour autoriser le merge

### Vérifier les Workflows

Dans GitHub:
1. Aller dans l'onglet **"Actions"**
2. Voir l'historique des exécutions
3. Cliquer sur un workflow pour voir les détails

---

## Tests

### Backend (API)

#### Lancer les Tests

```bash
cd apps/api

# Tous les tests
npm test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

#### Structure des Tests

```
apps/api/src/
├── auth/
│   └── auth.controller.spec.ts
├── studios/
│   └── studios.service.spec.ts
└── uploads/
    └── uploads.controller.spec.ts
```

#### Exemple de Test

```typescript
describe('StudiosController', () => {
  it('should create a studio', async () => {
    const dto = {
      name: 'Test Studio',
      description: 'Description',
      pricePerNight: 5000
    };
    
    const result = await controller.create(dto);
    
    expect(result).toBeDefined();
    expect(result.name).toBe('Test Studio');
  });
});
```

### Frontend (Web)

#### Linter

```bash
cd apps/web
npm run lint
```

### Tests Manuels - Guide Complet

#### 1. Test de Création de Studio avec Images

**Étapes**:
1. Se connecter en tant qu'admin
2. Aller sur `/studios/create`
3. Remplir tous les champs
4. Cliquer sur "Photos"
5. Sélectionner 3 images valides (JPEG/PNG, < 5MB)
6. Vérifier l'aperçu des images
7. Cliquer "Créer le studio"

**Résultats attendus**:
- ✅ Aperçu des images avec boutons de suppression
- ✅ Indicateur de progression pendant l'upload
- ✅ Message de succès
- ✅ Studio créé avec 3 URLs d'images
- ✅ Images accessibles sur `/studios/details/[id]`

#### 2. Test de Validation

**Type de fichier**:
- Essayer d'uploader un PDF ❌
- Essayer d'uploader un TXT ❌
- Essayer d'uploader un JPEG ✅

**Taille de fichier**:
- Image > 5MB ❌
- Image = 5MB ✅
- Image < 5MB ✅

#### 3. Test de Sécurité

**Authentification**:
```bash
# Sans token (doit échouer)
curl -X POST http://localhost:4000/api/uploads/studios/images \
  -F "images=@test.jpg"

# Résultat attendu: 401 Unauthorized
```

**Path Traversal**:
```bash
# Tentative d'accès malveillant (doit échouer)
curl http://localhost:4000/api/uploads/studios/../../../etc/passwd

# Résultat attendu: 404 Not Found
```

---

## Sécurité

### Mesures de Sécurité Implémentées

#### 1. Authentification & Autorisation

- **JWT Authentication**: Toutes les opérations sensibles nécessitent un token JWT
- **Vérification du propriétaire**: Les utilisateurs ne peuvent modifier que leurs propres studios
- **Guards NestJS**: `JwtAuthGuard` sur les endpoints protégés

#### 2. Validation des Uploads

**Types de fichiers**:
- Seuls JPEG, PNG, WEBP acceptés
- Validation côté serveur (multer) ET client
- Vérification MIME type

**Tailles**:
- Maximum 5MB par fichier
- Maximum 10 fichiers par requête
- Limite totale configurable via `MAX_FILE_SIZE`

**Noms de fichiers**:
- Noms générés automatiquement
- Format: `studio-{timestamp}-{random}.{ext}`
- Aucune entrée utilisateur dans le nom

#### 3. Protection Path Traversal

```typescript
// Sanitization du nom de fichier
const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '');

// Vérifications
if (sanitizedFilename !== filename || 
    filename.includes('..') || 
    filename.includes('/') || 
    filename.includes('\\')) {
  throw new NotFoundException('Image non trouvée');
}
```

**Protection contre**:
- `../../../etc/passwd`
- `..%2F..%2F..%2Fetc%2Fpasswd`
- `/etc/passwd`
- `\windows\system32`

#### 4. CORS Configuration

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

#### 5. Variables d'Environnement

**Secrets protégés**:
- JWT_SECRET: Jamais commité, minimum 32 caractères
- EMAIL_PASSWORD: Utilise des mots de passe d'application
- PAWAPAY_API_KEY: Stocké uniquement sur Railway/Vercel
- DATABASE_URL: Jamais exposé publiquement

#### 6. Headers de Sécurité

```typescript
// Helmet pour headers de sécurité
app.use(helmet());

// Headers configurés:
// - X-Frame-Options: DENY
// - X-Content-Type-Options: nosniff
// - X-XSS-Protection: 1; mode=block
// - Strict-Transport-Security: max-age=31536000
```

### Checklist de Sécurité

#### Avant Production

- [ ] JWT_SECRET est fort (32+ caractères aléatoires)
- [ ] Mots de passe email utilisent des "mots de passe d'application"
- [ ] Aucune clé API dans le code source
- [ ] CORS configuré avec domaines spécifiques
- [ ] Variables sensibles uniquement sur Railway/Vercel
- [ ] NODE_ENV=production sur Railway
- [ ] Endpoints de debug désactivés
- [ ] Taux de limitation (rate limiting) activé
- [ ] HTTPS forcé en production
- [ ] Backups de base de données configurés

### Audit de Sécurité

#### Vérifications Régulières

```bash
# Vérifier les dépendances vulnérables
npm audit

# Fixer les vulnérabilités
npm audit fix

# Vérifier les packages obsolètes
npm outdated
```

#### Monitoring

- **Railway**: Logs en temps réel, alertes configurables
- **Vercel**: Logs de fonction, analytics
- **Sentry** (recommandé): Tracking d'erreurs en production

---

## Commandes de Référence

### Backend (API)

```bash
# Installation
cd apps/api
npm install

# Prisma
npx prisma generate          # Générer le client
npx prisma migrate dev       # Créer migration
npx prisma migrate deploy    # Appliquer en prod
npx prisma studio           # Interface graphique BDD

# Développement
npm run start:dev           # Démarrer avec hot-reload
npm run start:debug         # Démarrer avec debugger

# Production
npm run build               # Build
npm run start:prod          # Démarrer en prod

# Tests
npm test                    # Lancer tests
npm run test:watch          # Tests en watch
npm run test:cov            # Tests avec couverture
npm run test:e2e            # Tests E2E

# Qualité du code
npm run lint                # Linter
npm run format              # Formatter (Prettier)

# Base de données
npm run db:seed             # Peupler avec données test
npm run db:push             # Push schema sans migration
```

### Frontend (Web)

```bash
# Installation
cd apps/web
npm install

# Développement
npm run dev                 # Démarrer dev
npm run dev:turbo           # Démarrer avec Turbopack

# Production
npm run build               # Build
npm start                   # Démarrer en prod

# Qualité du code
npm run lint                # Linter
```

### Railway CLI

```bash
# Installation
npm install -g @railway/cli

# Utilisation
railway login               # Se connecter
railway link                # Lier projet local
railway run <command>       # Exécuter commande
railway logs                # Voir logs
railway status              # Statut du déploiement
railway variables           # Lister variables
railway open                # Ouvrir dans navigateur
```

### Vercel CLI

```bash
# Installation
npm install -g vercel

# Utilisation
vercel login                # Se connecter
vercel                      # Déployer
vercel --prod               # Déployer en prod
vercel logs <url>           # Voir logs
vercel env ls               # Lister variables
vercel env pull             # Télécharger variables
```

### Git - Workflow

```bash
# Créer une branche
git checkout -b feature/ma-fonctionnalite

# Commit
git add .
git commit -m "feat: ma fonctionnalité"

# Push
git push origin feature/ma-fonctionnalite

# Pull Request
# Via l'interface GitHub
```

---

## Dépannage

### Problèmes Communs

#### "CORS Error" dans le Navigateur

**Cause**: Configuration CORS incorrecte

**Solution**:
1. Vérifier `FRONTEND_URL` sur Railway
2. S'assurer que l'URL Vercel est exacte (sans `/` à la fin)
3. Vérifier les logs Railway
4. Redémarrer l'API sur Railway

#### "Cannot Connect to Database"

**Cause**: Problème de connexion PostgreSQL

**Solution**:
1. Vérifier `DATABASE_URL` sur Railway
2. S'assurer que PostgreSQL est actif
3. Tester la connexion:
   ```bash
   railway run npx prisma db push
   ```
4. Vérifier les logs pour erreurs spécifiques

#### "Build Failed" sur Railway

**Causes possibles**:
- Dépendances manquantes
- Erreur de migration Prisma
- Problème de mémoire

**Solution**:
1. Vérifier `package.json` complet
2. Consulter logs de build détaillés
3. Tester localement:
   ```bash
   cd apps/api
   npm run build
   ```
4. Vérifier Prisma:
   ```bash
   npx prisma generate
   ```

#### "Build Failed" sur Vercel

**Causes possibles**:
- `NEXT_PUBLIC_API_URL` manquant
- Root directory incorrect
- Erreur de build Next.js

**Solution**:
1. Vérifier Root Directory = `apps/web`
2. Vérifier variables d'environnement
3. Consulter logs Vercel détaillés
4. Tester localement:
   ```bash
   cd apps/web
   npm run build
   ```

#### Images ne S'Affichent Pas

**Causes possibles**:
- Problème CORS
- URL API incorrecte
- Fichier supprimé

**Solution**:
1. Vérifier console navigateur
2. Tester URL image directement
3. Vérifier `NEXT_PUBLIC_API_URL`
4. Vérifier permissions fichiers:
   ```bash
   ls -la apps/api/uploads/studios/
   ```

#### "Module Not Found"

**Cause**: Dépendances manquantes ou cache corrompu

**Solution**:
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Rebuilder
npm run build

# Commit le nouveau package-lock.json
git add package-lock.json
git commit -m "fix: update dependencies"
```

#### Migrations Prisma Échouent

**Solution**:
```bash
# Réinitialiser la base de données (⚠️ Efface données!)
npx prisma migrate reset

# Ou appliquer manuellement
npx prisma migrate deploy

# Vérifier le schéma
npx prisma validate
```

### Commandes de Debug

```bash
# Vérifier variables d'environnement
env | grep -E "(DATABASE|JWT|EMAIL|FRONTEND)"

# Vérifier ports en écoute
lsof -i :4000
lsof -i :3000

# Tester connexion PostgreSQL
psql $DATABASE_URL

# Vérifier fichiers uploadés
ls -lah apps/api/uploads/studios/

# Logs Railway en temps réel
railway logs --follow

# Logs Vercel
vercel logs <url> --follow
```

### Outils de Debug Recommandés

- **Postman**: Tester les API
- **PostgreSQL Client**: pgAdmin, DBeaver
- **Browser DevTools**: Console, Network, Application
- **Railway CLI**: Logs et commandes
- **Vercel CLI**: Logs et déploiement

---

## Support et Ressources

### Documentation Officielle

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

### Communautés

- [Railway Discord](https://discord.gg/railway)
- [Vercel Discord](https://discord.gg/vercel)
- [NestJS Discord](https://discord.gg/nestjs)
- [Next.js Discord](https://discord.gg/nextjs)

### Tutoriels et Guides

- **NestJS**: [Official Tutorials](https://docs.nestjs.com/first-steps)
- **Next.js**: [Learn Next.js](https://nextjs.org/learn)
- **Prisma**: [Get Started](https://www.prisma.io/docs/getting-started)
- **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### URLs Importantes du Projet

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | `https://[projet].railway.app` | API NestJS |
| **Frontend Web** | `https://[projet].vercel.app` | Application Next.js |
| **Database** | Via Railway | PostgreSQL |
| **GitHub Repo** | `github.com/jeobran69367/Gestion_apparts` | Code source |
| **GitHub Actions** | Dans l'onglet Actions | CI/CD |

### Contact et Support

**Repository GitHub**: [jeobran69367/Gestion_apparts](https://github.com/jeobran69367/Gestion_apparts)

**Pour obtenir de l'aide**:
1. Consulter cette documentation
2. Vérifier les [issues existantes](https://github.com/jeobran69367/Gestion_apparts/issues)
3. Créer une nouvelle issue avec:
   - Description du problème
   - Étapes pour reproduire
   - Logs d'erreur
   - Captures d'écran si applicable

---

## Prochaines Étapes

### Court Terme

1. **Performance**:
   - Optimiser les images (compression, lazy loading)
   - Mettre en cache les requêtes fréquentes
   - CDN pour les assets statiques

2. **SEO**:
   - Métadonnées Next.js complètes
   - Sitemap.xml généré
   - Structured data (JSON-LD)

3. **Analytics**:
   - Google Analytics ou Plausible
   - Suivi des conversions
   - Heatmaps (Hotjar)

### Moyen Terme

1. **Tests**:
   - Tests E2E avec Playwright
   - Augmenter couverture de tests
   - Tests de performance (k6)

2. **Features**:
   - Notifications push
   - Chat en temps réel
   - Système de reviews
   - Calendrier de disponibilité avancé

3. **Infrastructure**:
   - Monitoring avancé (Sentry, DataDog)
   - Alertes automatiques
   - Backups automatiques réguliers

### Long Terme

1. **Scalabilité**:
   - Microservices si nécessaire
   - Cache distribué (Redis)
   - CDN global
   - Load balancing

2. **Mobile**:
   - Application mobile (React Native)
   - Progressive Web App (PWA)
   - Notifications push natives

3. **Business**:
   - Tableau de bord analytics propriétaire
   - Système de rapports avancés
   - Multi-tenancy
   - White-label

---

## Changelog

### Version 1.0.0 (Décembre 2024)

**Features**:
- ✅ Authentification JWT
- ✅ Gestion complète des studios
- ✅ Système de réservations
- ✅ Intégration paiements PawaPay
- ✅ Upload et gestion d'images
- ✅ Notifications email
- ✅ Interface responsive

**Infrastructure**:
- ✅ Déploiement Railway (Backend)
- ✅ Déploiement Vercel (Frontend)
- ✅ CI/CD GitHub Actions
- ✅ PostgreSQL Database
- ✅ Documentation complète

**Sécurité**:
- ✅ JWT Authentication
- ✅ CORS Configuration
- ✅ Path Traversal Protection
- ✅ File Upload Validation
- ✅ Security Headers (Helmet)

---

## Licence

Ce projet est privé et propriétaire.

**Tous droits réservés © 2024 Jeobran Kombou**

---

## Auteur

**Jeobran Kombou**
- GitHub: [@jeobran69367](https://github.com/jeobran69367)
- Projet: Gestion Apparts
- Date: Décembre 2024

---

## Remerciements

Merci à toutes les technologies open-source utilisées dans ce projet:
- NestJS, Next.js, React, TypeScript
- Prisma, PostgreSQL
- Railway, Vercel
- Et tous les packages npm qui rendent ce projet possible

---

**🎊 Documentation Complète - Gestion Apparts 🎊**

*Dernière mise à jour: Décembre 2024*

---

**Fait avec ❤️ par Jeobran Kombou**
