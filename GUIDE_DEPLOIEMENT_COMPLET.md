# 🚀 Guide de Déploiement Complet - Gestion Apparts

Ce guide vous accompagne pas à pas pour déployer votre application **Gestion Apparts** avec:
- **Backend (API NestJS)** sur **Railway** 🚂
- **Frontend (Next.js)** sur **Vercel** ▲

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir:

- [x] Un compte GitHub avec ce repository
- [x] Un compte [Railway](https://railway.app) (gratuit)
- [x] Un compte [Vercel](https://vercel.com) (gratuit)
- [x] Les informations de votre base de données PostgreSQL (Railway peut en créer une)
- [x] Les clés API nécessaires (PawaPay, Email, etc.)

---

## 🗂️ Structure du Projet

```
Gestion_apparts/
├── apps/
│   ├── api/          # Backend NestJS (→ Railway)
│   └── web/          # Frontend Next.js (→ Vercel)
├── railway.toml      # Configuration Railway
└── vercel.json       # Configuration Vercel
```

---

## 🎯 PARTIE 1: Déploiement du Backend sur Railway

### Étape 1.1: Créer un Projet Railway

1. **Connectez-vous à Railway**: [https://railway.app](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Choisissez le repository **`jeobran69367/Gestion_apparts`**
5. Railway détectera automatiquement votre projet

### Étape 1.2: Créer une Base de Données PostgreSQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"Add PostgreSQL"**
3. Railway créera automatiquement une base de données
4. Copiez l'URL de connexion (elle sera disponible dans les variables)

### Étape 1.3: Configurer les Variables d'Environnement

Dans Railway, allez dans l'onglet **"Variables"** et ajoutez:

```bash
# Base de données (automatiquement fournie par Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Port (automatiquement fourni par Railway)
PORT=${{PORT}}

# JWT Configuration
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi_en_production
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

# Frontend URL (à mettre à jour après déploiement Vercel)
FRONTEND_URL=https://votre-app.vercel.app

# Environment
NODE_ENV=production

# Limite de téléchargement
MAX_FILE_SIZE=100mb
```

**📌 Note importante**: Pour `EMAIL_PASSWORD` avec Gmail:
1. Activez la validation en 2 étapes sur votre compte Google
2. Générez un "Mot de passe d'application" dans les paramètres de sécurité
3. Utilisez ce mot de passe ici

### Étape 1.4: Configurer le Build

Railway utilisera automatiquement le fichier `railway.toml` qui contient:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd apps/api && npm install && npx prisma generate && npm run build"

[deploy]
startCommand = "cd apps/api && npx prisma migrate deploy && npm run start:prod"
```

### Étape 1.5: Déployer

1. Railway déploiera automatiquement après la configuration
2. Attendez que le déploiement se termine (voyant vert ✅)
3. Cliquez sur **"Settings"** → **"Generate Domain"** pour obtenir une URL publique
4. **Copiez l'URL de votre API** (ex: `https://votre-app.railway.app`)

### ✅ Vérification du Backend

Testez votre API déployée:

```bash
# Remplacez l'URL par la vôtre
curl https://votre-app.railway.app/api/studios
```

Ou ouvrez dans un navigateur:
```
https://votre-app.railway.app/api/studios
```

---

## 🎯 PARTIE 2: Déploiement du Frontend sur Vercel

### Étape 2.1: Importer le Projet sur Vercel

1. **Connectez-vous à Vercel**: [https://vercel.com](https://vercel.com)
2. Cliquez sur **"Add New"** → **"Project"**
3. Importez depuis GitHub: **`jeobran69367/Gestion_apparts`**
4. Vercel détectera automatiquement Next.js

### Étape 2.2: Configurer le Projet

Dans les paramètres de projet Vercel:

1. **Root Directory**: **IMPORTANT** - Spécifiez `apps/web` (ceci est obligatoire pour un monorepo)
2. **Framework Preset**: Next.js (détecté automatiquement)
3. **Build Command**: Laissez par défaut (`npm run build`) ou laissez vide pour auto-détection
4. **Output Directory**: Laissez par défaut (`.next`) ou laissez vide pour auto-détection
5. **Install Command**: Laissez par défaut (`npm install`) ou laissez vide pour auto-détection

**Note importante**: Le paramètre **Root Directory** doit être `apps/web` car votre application Next.js est dans un sous-dossier (structure monorepo).

### Étape 2.3: Configurer les Variables d'Environnement

Dans Vercel, allez dans **"Settings"** → **"Environment Variables"** et ajoutez:

```bash
# URL de l'API Backend (l'URL Railway que vous avez copiée)
NEXT_PUBLIC_API_URL=https://votre-app.railway.app

# PawaPay API Key
PAWAPAY_API_KEY=votre_cle_api_pawapay

# Informations de l'application
NEXT_PUBLIC_APP_NAME=Gestion Apparts
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

**⚠️ Important**: Les variables commençant par `NEXT_PUBLIC_` sont exposées au navigateur.

### Étape 2.4: Déployer

1. Cliquez sur **"Deploy"**
2. Vercel construira et déploiera votre application
3. Une fois terminé, vous obtiendrez une URL (ex: `https://votre-app.vercel.app`)
4. **Copiez cette URL**

### Étape 2.5: Mettre à Jour la Variable FRONTEND_URL sur Railway

1. Retournez sur **Railway**
2. Allez dans **"Variables"**
3. Mettez à jour `FRONTEND_URL` avec l'URL Vercel que vous venez de copier:
   ```
   FRONTEND_URL=https://votre-app.vercel.app
   ```
4. Railway redéploiera automatiquement avec la nouvelle configuration

### ✅ Vérification du Frontend

1. Ouvrez votre application: `https://votre-app.vercel.app`
2. Testez la connexion avec l'API
3. Vérifiez que les fonctionnalités fonctionnent

---

## 🔄 Redéploiements Automatiques

### Déploiements Automatiques Configurés ✅

Les deux plateformes sont maintenant configurées pour se redéployer automatiquement:

**Railway (Backend)**:
- Se redéploie à chaque push sur la branche `main`
- Vérifie les changements dans `apps/api/`

**Vercel (Frontend)**:
- Se redéploie à chaque push sur la branche `main`
- Vérifie les changements dans `apps/web/`

### Pour Forcer un Redéploiement Manuel

**Railway**:
1. Allez dans "Deployments"
2. Cliquez sur "Deploy" en haut à droite

**Vercel**:
1. Allez dans "Deployments"
2. Cliquez sur les trois points (•••) → "Redeploy"

---

## 📝 Commandes Utiles

### Commandes Locales pour Tester Avant Déploiement

```bash
# Backend (API)
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev
npm run build
npm run start:prod

# Frontend (Web)
cd apps/web
npm install
npm run build
npm start
```

### Vérification de la Production

```bash
# Tester l'API
curl https://votre-app.railway.app/api/studios

# Tester le frontend
curl https://votre-app.vercel.app
```

---

## 🔧 Configuration de la Base de Données

### Migration de la Base de Données

Les migrations Prisma sont exécutées automatiquement au déploiement sur Railway grâce à la commande:

```bash
npx prisma migrate deploy
```

### Si vous devez exécuter des migrations manuellement:

1. Installez Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Connectez-vous:
   ```bash
   railway login
   ```

3. Liez votre projet:
   ```bash
   railway link
   ```

4. Exécutez les migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Accéder à Prisma Studio en Production

```bash
# Localement avec connexion à la base de données Railway
DATABASE_URL="votre_url_railway" npx prisma studio
```

---

## 🐛 Dépannage (Troubleshooting)

### Problème: "CORS Error" dans le navigateur

**Solution**:
1. Vérifiez que `FRONTEND_URL` est correctement configuré sur Railway
2. Assurez-vous que l'URL Vercel est exacte (sans `/` à la fin)
3. Vérifiez les logs Railway pour voir si les requêtes arrivent

### Problème: "Cannot connect to database"

**Solution**:
1. Vérifiez que `DATABASE_URL` est correctement configuré
2. Assurez-vous que la base de données PostgreSQL est active
3. Vérifiez les logs Railway pour les erreurs de connexion

### Problème: "Build Failed" sur Railway

**Solution**:
1. Vérifiez que toutes les dépendances sont dans `package.json`
2. Consultez les logs de build pour l'erreur spécifique
3. Testez le build localement: `cd apps/api && npm run build`

### Problème: "Build Failed" sur Vercel

**Solution**:
1. Vérifiez que `NEXT_PUBLIC_API_URL` est défini
2. Consultez les logs de build Vercel
3. Testez le build localement: `cd apps/web && npm run build`

### Problème: "Module not found" ou erreurs d'import

**Solution**:
1. Supprimez `node_modules` et `package-lock.json`
2. Réinstallez: `npm install`
3. Committez le nouveau `package-lock.json`

### Voir les Logs

**Railway**:
```bash
railway logs
```

**Vercel**:
- Interface web: "Deployments" → sélectionnez un déploiement → "View Function Logs"
- CLI: `vercel logs <url>`

---

## 🔒 Sécurité et Bonnes Pratiques

### ✅ Checklist de Sécurité

- [ ] JWT_SECRET est fort et unique (au moins 32 caractères aléatoires)
- [ ] Les mots de passe d'email utilisent des "mots de passe d'application"
- [ ] Les clés API ne sont jamais committées dans le code
- [ ] CORS est configuré avec les bons domaines uniquement
- [ ] Les variables d'environnement sensibles sont seulement sur Railway/Vercel
- [ ] NODE_ENV=production sur Railway
- [ ] Désactivez les endpoints de debug en production

### Générer un JWT_SECRET sécurisé

```bash
# Sous Linux/Mac
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📊 Monitoring et Performance

### Railway

- **Logs**: Disponibles en temps réel dans l'interface
- **Métriques**: CPU, Mémoire, Network dans l'onglet "Metrics"
- **Alertes**: Configurables pour les erreurs critiques

### Vercel

- **Analytics**: Activez Vercel Analytics pour voir les performances
- **Logs**: Disponibles dans chaque déploiement
- **Speed Insights**: Pour optimiser les performances

---

## 🎉 Post-Déploiement

### Tâches à Effectuer Après le Déploiement

1. **Testez toutes les fonctionnalités principales**:
   - [ ] Inscription/Connexion utilisateur
   - [ ] Création de studio
   - [ ] Réservation
   - [ ] Paiement
   - [ ] Envoi d'email

2. **Configurez les domaines personnalisés** (optionnel):
   - Railway: Settings → Domains → Add Custom Domain
   - Vercel: Settings → Domains → Add Domain

3. **Configurez les sauvegardes**:
   - Railway: Backups automatiques PostgreSQL activés par défaut
   - Téléchargez une sauvegarde initiale pour sécurité

4. **Configurez le monitoring**:
   - Ajoutez des outils de monitoring (Sentry, LogRocket, etc.)
   - Configurez les alertes email pour les erreurs

5. **Documentation pour l'équipe**:
   - Partagez les URLs de production
   - Documentez les accès Railway et Vercel
   - Créez un guide utilisateur

---

## 📞 Support et Ressources

### Documentation Officielle

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

### Communautés

- [Railway Discord](https://discord.gg/railway)
- [Vercel Discord](https://discord.gg/vercel)

---

## ✅ Résumé des URLs Importantes

À la fin du déploiement, vous aurez:

| Service | URL | Exemple |
|---------|-----|---------|
| **Backend API** | `https://[projet].railway.app` | `https://gestion-apparts-api.railway.app` |
| **Frontend Web** | `https://[projet].vercel.app` | `https://gestion-apparts.vercel.app` |
| **Base de Données** | Interne à Railway | Via `DATABASE_URL` |

---

## 🎯 Prochaines Étapes

1. **Performance**: Optimisez les images et le chargement
2. **SEO**: Configurez les métadonnées Next.js
3. **Analytics**: Ajoutez Google Analytics ou Plausible
4. **Tests**: Mettez en place des tests E2E avec Playwright
5. **CI/CD**: Configurez GitHub Actions pour les tests automatiques

---

## 👤 Auteur

- **Nom**: Jeobran Kombou
- **Projet**: Gestion Apparts
- **Date**: Décembre 2024

---

## 📄 Licence

Ce projet est privé et propriétaire.

---

**🎊 Félicitations! Votre application est maintenant en ligne et accessible à tous! 🎊**
