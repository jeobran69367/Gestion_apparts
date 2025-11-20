# Documentation: Déploiement du Projet Gestion Apparts

## Introduction
Ce document décrit les étapes nécessaires pour déployer le projet **Gestion Apparts**, qui comprend un backend (API NestJS) et un frontend (Next.js). Le déploiement peut être effectué sur des plateformes gratuites et simples comme Railway, Render, et Vercel.

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

## Étapes de Déploiement

### 1. Déploiement du Backend (API NestJS)

#### 1.1. Préparer le Backend
1. Assurez-vous que toutes les dépendances sont installées :
   ```bash
   cd apps/api
   npm install
   ```
2. Vérifiez que le fichier `.env` contient les variables nécessaires, par exemple :
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

#### 1.2. Déployer sur Railway
1. Créez un compte sur [Railway](https://railway.app).
2. Importez le projet depuis GitHub.
3. Configurez les variables d'environnement nécessaires (comme `DATABASE_URL`).
4. Railway détectera automatiquement votre projet et déploiera l'API.

#### 1.3. Déployer sur Render
1. Créez un compte sur [Render](https://render.com).
2. Créez un nouveau service "Web Service" et connectez votre dépôt GitHub.
3. Ajoutez les variables d'environnement nécessaires.
4. Spécifiez la commande de démarrage :
   ```bash
   npm run start:prod
   ```
5. Render déploiera automatiquement votre backend.

---

### 2. Déploiement du Frontend (Next.js)

#### 2.1. Préparer le Frontend
1. Assurez-vous que toutes les dépendances sont installées :
   ```bash
   cd apps/web
   npm install
   ```
2. Vérifiez que le fichier `.env` contient les variables nécessaires, par exemple :
   ```env
   NEXT_PUBLIC_API_URL=https://api-backend.railway.app
   ```

#### 2.2. Déployer sur Vercel
1. Créez un compte sur [Vercel](https://vercel.com).
2. Importez votre projet Next.js depuis GitHub.
3. Configurez les variables d'environnement nécessaires (comme `NEXT_PUBLIC_API_URL`).
4. Vercel déploiera automatiquement votre frontend.

---

## Communication entre le Frontend et le Backend

1. **Configurer les CORS dans le Backend** :
   - Assurez-vous que le backend autorise les requêtes provenant du domaine du frontend.
   - Exemple de configuration dans NestJS :
     ```typescript
     import { NestFactory } from '@nestjs/core';
     import { AppModule } from './app.module';

     async function bootstrap() {
       const app = await NestFactory.create(AppModule);
       app.enableCors({
         origin: 'https://frontend.vercel.app',
       });
       await app.listen(4000);
     }
     bootstrap();
     ```

2. **Utiliser des URLs publiques** :
   - Dans le frontend, utilisez l'URL publique du backend (ex. `https://api-backend.railway.app`).

---

## Tester et Vérifier

1. **Tester le Backend** :
   - Utilisez Postman ou un navigateur pour vérifier les endpoints de l'API.
   - Exemple : `https://api-backend.railway.app/reservations`.

2. **Tester le Frontend** :
   - Accédez à l'URL fournie par Vercel et vérifiez que l'application fonctionne correctement.

---

## Ressources Utiles

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## Auteur
- **Nom** : Jeobran Kombou
- **Projet** : Gestion Apparts
- **Date** : 20 novembre 2025
