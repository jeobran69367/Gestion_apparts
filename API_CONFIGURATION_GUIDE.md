# Configuration API - Guide de Production

## 🎯 Vue d'ensemble

Ce guide explique comment l'application utilise maintenant une configuration centralisée pour toutes les URLs de l'API, rendant le code production-ready et facilitant le déploiement.

## ✅ Ce qui a été fait

### 1. Configuration centralisée (`apps/web/src/config/api.ts`)

Tous les endpoints de l'API sont maintenant définis dans un seul fichier :

```typescript
// Backend API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    USER_BY_EMAIL: (email: string) => `${API_BASE_URL}/api/auth/user-by-email?email=${email}`,
  },
  STUDIOS: { ... },
  RESERVATIONS: { ... },
  PAYMENTS: { ... },
  // etc.
};

// Internal Next.js API routes
export const INTERNAL_API = {
  BOOKINGS: {
    COMPLETE: `${FRONTEND_BASE_URL}/api/bookings/complete`,
  },
  // etc.
};
```

### 2. Remplacement des URLs hardcodées

**Avant** (❌ Non professionnel):
```typescript
const response = await fetch('http://localhost:4000/api/auth/login', { ... });
```

**Après** (✅ Production-ready):
```typescript
import { API_ENDPOINTS } from '@/config/api';
const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, { ... });
```

### 3. Fichiers mis à jour

**18 fichiers** ont été mis à jour pour utiliser la configuration centralisée :

#### Pages d'authentification
- ✅ `apps/web/src/app/auth/login/page.tsx`
- ✅ `apps/web/src/app/auth/forgot-password/page.tsx`
- ✅ `apps/web/src/app/auth/reset-password/page.tsx`

#### Pages studios
- ✅ `apps/web/src/app/studios/page.tsx`
- ✅ `apps/web/src/app/studios/book/[id]/page.tsx`
- ✅ `apps/web/src/app/studios/details/[id]/page.tsx`
- ✅ `apps/web/src/app/studios/my-studios/page.tsx`
- ✅ `apps/web/src/app/studios/my-bookings/page.tsx`
- ✅ `apps/web/src/app/studios/reservations/page.tsx`
- ✅ `apps/web/src/app/studios/reservations/[id]/page.tsx`
- ✅ `apps/web/src/app/studios/studio-payments/page.tsx`

#### Pages principales
- ✅ `apps/web/src/app/dashboard/page.tsx`
- ✅ `apps/web/src/app/page.tsx` (liens de développement conditionnels)

#### Composants
- ✅ `apps/web/src/components/payment/BookingConfirmationManager.tsx`

#### API routes (Next.js)
- ✅ `apps/web/src/app/api/bookings/complete/route.ts`
- ✅ `apps/web/src/app/api/reservations/check/route.ts`

#### Configuration
- ✅ `apps/web/src/config/api.ts` (étendu avec tous les endpoints)

## 📝 Variables d'environnement

### Development (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
PAWAPAY_API_KEY=your-dev-key
NODE_ENV=development
```

### Production
```env
NEXT_PUBLIC_API_URL=https://votre-api.railway.app/api
NEXT_PUBLIC_BASE_URL=https://votre-app.vercel.app
PAWAPAY_API_KEY=your-production-key
NODE_ENV=production
```

## 🚀 Avantages

### 1. **Déploiement simplifié**
- ✅ Un seul endroit pour changer les URLs
- ✅ Pas de recherche/remplacement dans le code
- ✅ Configuration par environnement via variables d'environnement

### 2. **Code maintenable**
- ✅ DRY (Don't Repeat Yourself)
- ✅ Endpoints typés (TypeScript)
- ✅ Auto-complétion dans l'IDE

### 3. **Moins d'erreurs**
- ✅ Pas de typos dans les URLs
- ✅ Changements centralisés
- ✅ Compilation TypeScript vérifie l'utilisation

### 4. **Multi-environnement**
- ✅ Développement local : `localhost:4000`
- ✅ Staging : URLs de test
- ✅ Production : URLs finales

## 📊 Utilisation

### Import simple
```typescript
import { API_ENDPOINTS } from '@/config/api';
```

### Exemples d'utilisation

#### 1. Endpoints simples
```typescript
// Login
const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, { ... });

// Studios
const response = await fetch(API_ENDPOINTS.STUDIOS.BASE);

// Reservations
const response = await fetch(API_ENDPOINTS.RESERVATIONS.BASE);
```

#### 2. Endpoints dynamiques
```typescript
// Studio par ID
const response = await fetch(API_ENDPOINTS.STUDIOS.BY_ID(studioId));

// Réservation par ID
const response = await fetch(API_ENDPOINTS.RESERVATIONS.BY_ID(reservationId));

// User par email
const response = await fetch(API_ENDPOINTS.AUTH.USER_BY_EMAIL(email));

// Réservations d'un studio
const response = await fetch(API_ENDPOINTS.STUDIOS.RESERVATIONS_BY_STUDIO(studioId));
```

#### 3. API routes internes
```typescript
import { INTERNAL_API } from '@/config/api';

const response = await fetch(INTERNAL_API.BOOKINGS.COMPLETE, { ... });
```

## 🔒 Sécurité

### URLs en développement uniquement
Les liens de développement (Prisma Studio, etc.) ne s'affichent que en mode développement :

```typescript
{process.env.NODE_ENV === 'development' && (
  <div>
    <a href="http://localhost:5555">Base de Données</a>
    <a href="http://localhost:4000">API REST</a>
  </div>
)}
```

## 🧪 Tests

Build réussi ✅ :
```bash
cd apps/web
npm run build
# ✓ Compiled successfully
```

## 📚 Endpoints disponibles

### AUTH
- `LOGIN` - Connexion utilisateur
- `REGISTER` - Inscription utilisateur
- `FORGOT_PASSWORD` - Mot de passe oublié
- `RESET_PASSWORD` - Réinitialisation mot de passe
- `USER_BY_EMAIL(email)` - Récupérer utilisateur par email

### STUDIOS
- `BASE` - Liste des studios
- `BY_ID(id)` - Studio par ID
- `MY_STUDIOS` - Mes studios (propriétaire)
- `RESERVATIONS_BY_STUDIO(id)` - Réservations d'un studio

### RESERVATIONS
- `BASE` - Liste des réservations
- `BY_ID(id)` - Réservation par ID
- `MY_RESERVATIONS` - Mes réservations (client)

### PAYMENTS
- `BASE` - Liste des paiements
- `STUDIO_PAYMENTS` - Paiements par studio

### USERS
- `BASE` - Liste des utilisateurs

### EMAIL
- `SEND` - Envoi d'email

## 🎉 Résultat

✅ **0 hardcoded URLs** dans le code métier  
✅ **Configuration centralisée**  
✅ **Build TypeScript sans erreurs**  
✅ **Production-ready**  

L'application est maintenant prête pour un déploiement professionnel ! 🚀
