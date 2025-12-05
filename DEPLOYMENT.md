# Documentation: Déploiement du Projet Gestion Apparts

## Introduction
Ce document décrit les étapes nécessaires pour déployer le projet **Gestion Apparts**, qui comprend un backend (API NestJS) et un frontend (Next.js). Le déploiement peut être effectué avec Docker, ou sur des plateformes gratuites et simples comme Railway, Render, et Vercel.

---

## Structure du Projet

- **Backend (API)** :
  - Framework : NestJS
  - Localisation : `apps/api`
  - Base de données : PostgreSQL

- **Frontend (Web)** :
  - Framework : Next.js
  - Localisation : `apps/web`

---

## Déploiement avec Docker (Recommandé)

### Prérequis
- Docker et Docker Compose installés sur votre machine
- Variables d'environnement configurées

### Déploiement Local Complet

1. **Cloner le repository** :
   ```bash
   git clone https://github.com/jeobran69367/Gestion_apparts.git
   cd Gestion_apparts
   ```

2. **Créer les fichiers .env** :
   
   Pour l'API (`apps/api/.env`) :
   ```env
   DATABASE_URL="postgresql://postgres:postgres@postgres:5432/gestion_apparts?schema=public"
   JWT_SECRET="your-secret-key-change-in-production"
   FRONTEND_URL="http://localhost:3000"
   NODE_ENV="production"
   PORT=4000
   ```
   
   Pour le Web (`apps/web/.env`) :
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:4000/api"
   PAWAPAY_API_KEY="your-pawapay-api-key"
   ```

3. **Lancer l'application avec Docker Compose** :
   ```bash
   docker-compose up -d
   ```

4. **Vérifier que les services sont en cours d'exécution** :
   ```bash
   docker-compose ps
   ```

5. **Accéder à l'application** :
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:4000/api
   - Base de données PostgreSQL : localhost:5432

6. **Arrêter les services** :
   ```bash
   docker-compose down
   ```

7. **Voir les logs** :
   ```bash
   docker-compose logs -f
   ```

### Déploiement Docker en Production

Pour déployer avec Docker sur un serveur de production :

1. **Build les images Docker** :
   ```bash
   # API
   cd apps/api
   docker build -t gestion-apparts-api .
   
   # Web
   cd ../web
   docker build -t gestion-apparts-web .
   ```

2. **Exécuter les conteneurs** :
   ```bash
   # PostgreSQL
   docker run -d --name postgres \
     -e POSTGRES_PASSWORD=yourpassword \
     -e POSTGRES_DB=gestion_apparts \
     -p 5432:5432 \
     postgres:15-alpine
   
   # API
   docker run -d --name api \
     -e DATABASE_URL="postgresql://postgres:yourpassword@postgres:5432/gestion_apparts" \
     -e JWT_SECRET="your-secret-key" \
     -e FRONTEND_URL="https://your-frontend-url.com" \
     -p 4000:4000 \
     --link postgres:postgres \
     gestion-apparts-api
   
   # Web
   docker run -d --name web \
     -e NEXT_PUBLIC_API_URL="https://your-api-url.com/api" \
     -p 3000:3000 \
     --link api:api \
     gestion-apparts-web
   ```

---

## Étapes de Déploiement sur Plateformes Cloud

### 1. Déploiement du Backend (API NestJS)

#### 1.1. Préparer le Backend
1. Assurez-vous que toutes les dépendances sont installées :
   ```bash
   cd apps/api
   npm install
   ```
2. Copiez le fichier `.env.example` vers `.env` et configurez les variables :
   ```bash
   cp .env.example .env
   ```
   
3. Variables d'environnement requises :
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-secret-key-change-in-production
   FRONTEND_URL=https://your-frontend-url.com
   ```

#### 1.2. Déployer sur Railway
1. Créez un compte sur [Railway](https://railway.app).
2. Créez un nouveau projet et ajoutez PostgreSQL depuis la marketplace.
3. Déployez le service API :
   - Importez le projet depuis GitHub
   - Sélectionnez le dossier `apps/api`
   - Railway utilisera automatiquement le fichier `railway.json`
4. Configurez les variables d'environnement :
   - `DATABASE_URL` : Copiée depuis le service PostgreSQL
   - `JWT_SECRET` : Générez une clé secrète sécurisée
   - `FRONTEND_URL` : URL de votre frontend (à ajouter après déploiement)
   - `PORT` : 4000
5. Railway déploiera automatiquement votre API.

#### 1.3. Déployer sur Render
1. Créez un compte sur [Render](https://render.com).
2. Créez une nouvelle base de données PostgreSQL.
3. Créez un nouveau "Web Service" :
   - Connectez votre dépôt GitHub
   - Sélectionnez le dossier racine
   - Render utilisera le fichier `render.yaml` pour la configuration
4. Ou configurez manuellement :
   - Build Command : `cd apps/api && npm install && npx prisma generate && npm run build`
   - Start Command : `cd apps/api && npx prisma migrate deploy && npm run start:prod`
5. Ajoutez les variables d'environnement nécessaires.
6. Render déploiera automatiquement votre backend.

---

### 2. Déploiement du Frontend (Next.js)

#### 2.1. Préparer le Frontend
1. Assurez-vous que toutes les dépendances sont installées :
   ```bash
   cd apps/web
   npm install
   ```
2. Copiez le fichier `.env.example` vers `.env.local` :
   ```bash
   cp .env.example .env.local
   ```
3. Configurez les variables d'environnement :
   ```env
   NEXT_PUBLIC_API_URL=https://api-backend.railway.app/api
   PAWAPAY_API_KEY=your-pawapay-api-key
   ```

#### 2.2. Déployer sur Vercel (Recommandé pour Next.js)
1. Créez un compte sur [Vercel](https://vercel.com).
2. Importez votre projet Next.js depuis GitHub.
3. Configuration du projet :
   - Framework Preset : Next.js
   - Root Directory : `apps/web`
   - Build Command : `npm run build`
   - Output Directory : `.next`
4. Configurez les variables d'environnement :
   - `NEXT_PUBLIC_API_URL` : URL de votre backend (ex: `https://api-backend.railway.app/api`)
   - `PAWAPAY_API_KEY` : Votre clé API PawaPay
5. Vercel déploiera automatiquement votre frontend.

#### 2.3. Déployer sur Railway (Alternative)
1. Dans votre projet Railway existant, ajoutez un nouveau service.
2. Importez depuis le même dépôt GitHub.
3. Sélectionnez le dossier `apps/web`.
4. Railway utilisera automatiquement le fichier `railway.json`.
5. Configurez les variables d'environnement.

---

## Communication entre le Frontend et le Backend

1. **CORS est déjà configuré** :
   - Le backend utilise la variable d'environnement `FRONTEND_URL` pour autoriser automatiquement les requêtes CORS.
   - En développement : `http://localhost:3000`
   - En production : Définissez `FRONTEND_URL` avec l'URL de votre frontend déployé.

2. **Utiliser des URLs publiques** :
   - Dans le frontend, utilisez l'URL publique du backend via `NEXT_PUBLIC_API_URL`.
   - Exemple : `https://api-backend.railway.app/api`

---

## Tester et Vérifier

1. **Tester le Backend** :
   - Utilisez Postman ou un navigateur pour vérifier les endpoints de l'API.
   - Exemple : `https://api-backend.railway.app/api/reservations`
   - Vérifiez le health check : `https://api-backend.railway.app/api`

2. **Tester le Frontend** :
   - Accédez à l'URL fournie par Vercel et vérifiez que l'application fonctionne correctement.
   - Testez la connexion avec le backend en créant une réservation.

3. **Vérifier les logs** :
   - Railway : Consultez les logs dans le dashboard
   - Render : Vérifiez les logs de déploiement
   - Vercel : Consultez les logs de build et runtime

---

## Dépannage

### Problèmes courants

1. **Erreur de connexion à la base de données** :
   - Vérifiez que `DATABASE_URL` est correctement configuré
   - Assurez-vous que les migrations Prisma ont été exécutées : `npx prisma migrate deploy`

2. **Erreurs CORS** :
   - Vérifiez que `FRONTEND_URL` est défini dans l'API
   - Assurez-vous que l'URL du frontend est exactement celle utilisée dans le navigateur

3. **Build échoue** :
   - Vérifiez que toutes les dépendances sont dans `package.json`
   - Assurez-vous que les variables d'environnement sont définies avant le build

4. **API ne démarre pas** :
   - Vérifiez les logs pour les erreurs de migration
   - Assurez-vous que `JWT_SECRET` est défini

---

## Fichiers de Configuration Créés

Ce déploiement inclut les fichiers de configuration suivants :

- `apps/api/Dockerfile` - Image Docker pour l'API
- `apps/api/.dockerignore` - Fichiers à exclure du build Docker
- `apps/api/railway.json` - Configuration Railway pour l'API
- `apps/api/.env.example` - Template des variables d'environnement de l'API
- `apps/web/Dockerfile` - Image Docker pour le frontend
- `apps/web/.dockerignore` - Fichiers à exclure du build Docker
- `apps/web/railway.json` - Configuration Railway pour le frontend
- `apps/web/.env.example` - Template des variables d'environnement du frontend
- `docker-compose.yml` - Configuration pour déploiement local avec Docker
- `render.yaml` - Configuration pour Render
- `vercel.json` - Configuration pour Vercel

---

## Ressources Utiles

- [Docker Documentation](https://docs.docker.com)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## Auteur
- **Nom** : Jeobran Kombou
- **Projet** : Gestion Apparts
- **Date** : 20 novembre 2025
- **Dernière mise à jour** : Décembre 2025
