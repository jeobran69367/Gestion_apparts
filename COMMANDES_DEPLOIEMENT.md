# 🚀 Commandes de Déploiement - Référence Rapide

Ce document contient toutes les commandes essentielles pour déployer et gérer votre application.

---

## 📦 Installation Initiale

### Backend (API)
```bash
cd apps/api
npm install
npx prisma generate
```

### Frontend (Web)
```bash
cd apps/web
npm install
```

---

## 🏗️ Build et Test Locaux

### Backend (API)

```bash
# Installer les dépendances
cd apps/api
npm install

# Générer le client Prisma
npx prisma generate

# Créer/Appliquer les migrations
npx prisma migrate dev

# Builder l'application
npm run build

# Démarrer en mode production
npm run start:prod

# Démarrer en mode développement
npm run start:dev
```

### Frontend (Web)

```bash
# Installer les dépendances
cd apps/web
npm install

# Builder l'application
npm run build

# Démarrer en mode production
npm start

# Démarrer en mode développement
npm run dev
```

---

## 🚂 Railway (Backend)

### Installation du CLI Railway

```bash
# Installer Railway CLI globalement
npm install -g @railway/cli

# Ou avec Homebrew (Mac)
brew install railway
```

### Connexion et Configuration

```bash
# Se connecter à Railway
railway login

# Lier le projet local à Railway
railway link

# Voir les variables d'environnement
railway variables

# Définir une variable d'environnement
railway variables set KEY=VALUE
```

### Déploiement

```bash
# Déployer depuis la ligne de commande
railway up

# Forcer un redéploiement
railway redeploy

# Voir les logs en temps réel
railway logs

# Ouvrir le projet dans le navigateur
railway open
```

### Base de Données

```bash
# Se connecter à la base de données
railway connect postgres

# Exécuter les migrations Prisma
railway run npx prisma migrate deploy

# Ouvrir Prisma Studio connecté à Railway
railway run npx prisma studio

# Faire un seed de la base de données
railway run npm run db:seed
```

### Informations et Debugging

```bash
# Obtenir l'URL du projet
railway domain

# Voir le statut du déploiement
railway status

# Voir les détails du projet
railway info

# Lister tous les projets
railway list
```

---

## ▲ Vercel (Frontend)

### Installation du CLI Vercel

```bash
# Installer Vercel CLI globalement
npm install -g vercel

# Ou avec Homebrew (Mac)
brew install vercel
```

### Connexion et Configuration

```bash
# Se connecter à Vercel
vercel login

# Lier le projet local à Vercel
vercel link

# Voir les variables d'environnement
vercel env ls

# Ajouter une variable d'environnement
vercel env add NEXT_PUBLIC_API_URL production
# Ensuite, entrez la valeur quand demandé
```

### Déploiement

```bash
# Déployer en preview (branche actuelle)
vercel

# Déployer en production
vercel --prod

# Forcer un redéploiement
vercel redeploy

# Lister les déploiements
vercel ls

# Voir les logs d'un déploiement
vercel logs [deployment-url]
```

### Informations et Debugging

```bash
# Obtenir l'URL du projet
vercel inspect

# Voir les détails du projet
vercel project ls

# Supprimer un déploiement
vercel rm [deployment-url]
```

---

## 🗄️ Prisma (Base de Données)

### Migrations

```bash
# Créer une nouvelle migration (développement)
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base de données (développement uniquement!)
npx prisma migrate reset

# Voir le statut des migrations
npx prisma migrate status
```

### Prisma Studio

```bash
# Ouvrir Prisma Studio localement
npx prisma studio

# Avec connexion à Railway
railway run npx prisma studio
```

### Génération et Format

```bash
# Générer le client Prisma
npx prisma generate

# Formater le schema.prisma
npx prisma format

# Valider le schema
npx prisma validate
```

### Push Direct (sans migrations)

```bash
# Pousser le schema directement (développement)
npx prisma db push

# Avec Railway
railway run npx prisma db push
```

---

## 🔧 Git et GitHub

### Workflow de Déploiement Typique

```bash
# 1. Créer une branche pour vos changements
git checkout -b feature/ma-nouvelle-fonctionnalite

# 2. Faire vos modifications...

# 3. Ajouter les fichiers modifiés
git add .

# 4. Committer
git commit -m "feat: ajout de ma nouvelle fonctionnalité"

# 5. Pousser vers GitHub
git push origin feature/ma-nouvelle-fonctionnalite

# 6. Créer une Pull Request sur GitHub

# 7. Merger dans main (via GitHub)

# 8. Railway et Vercel déploient automatiquement!
```

### Vérifier l'état

```bash
# Voir les fichiers modifiés
git status

# Voir les différences
git diff

# Voir l'historique
git log --oneline --graph --all
```

---

## 🧪 Tests

### Backend (API)

```bash
cd apps/api

# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Frontend (Web)

```bash
cd apps/web

# Linter (vérification du code)
npm run lint

# Linter avec correction automatique
npm run lint -- --fix
```

---

## 🔍 Debugging

### Vérifier les Connexions

```bash
# Tester l'API Railway
curl https://votre-app.railway.app/api/studios

# Tester le frontend Vercel
curl https://votre-app.vercel.app

# Vérifier la santé de l'API
curl https://votre-app.railway.app/api/health
```

### Variables d'Environnement

```bash
# Backend: Lister toutes les variables (local)
cd apps/api
cat .env

# Frontend: Lister toutes les variables (local)
cd apps/web
cat .env

# Railway: Voir les variables
railway variables

# Vercel: Voir les variables
vercel env ls
```

### Logs

```bash
# Railway logs (temps réel)
railway logs --tail

# Vercel logs (dernier déploiement)
vercel logs --follow

# Logs locaux du backend
cd apps/api
npm run start:dev  # Les logs apparaissent dans la console

# Logs locaux du frontend
cd apps/web
npm run dev  # Les logs apparaissent dans la console
```

---

## 🔄 Mise à Jour et Maintenance

### Mettre à Jour les Dépendances

```bash
# Vérifier les packages obsolètes
npm outdated

# Mettre à jour tous les packages
npm update

# Mettre à jour un package spécifique
npm install package-name@latest

# Auditer la sécurité
npm audit

# Corriger les vulnérabilités automatiquement
npm audit fix
```

### Nettoyer le Projet

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer les builds Next.js
cd apps/web
rm -rf .next

# Nettoyer les builds NestJS
cd apps/api
rm -rf dist
```

---

## 📊 Monitoring

### Railway

```bash
# Voir les métriques
railway metrics

# Voir les logs des dernières 24h
railway logs --since 24h

# Surveiller les logs en continu
railway logs --tail
```

### Vercel

```bash
# Voir les déploiements récents
vercel ls

# Inspecter un déploiement spécifique
vercel inspect [deployment-url]
```

---

## 🚨 Urgences et Rollback

### Railway

```bash
# Lister les déploiements
railway deployments

# Revenir à un déploiement précédent
# (via l'interface web: Deployments → ... → Rollback)
```

### Vercel

```bash
# Lister les déploiements
vercel ls

# Promouvoir un ancien déploiement en production
vercel promote [deployment-url]

# Supprimer un déploiement problématique
vercel rm [deployment-url]
```

---

## 📝 Scripts Personnalisés Utiles

### Script de Backup de Base de Données

```bash
#!/bin/bash
# backup-db.sh
# Utilisation: ./backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
railway run pg_dump $DATABASE_URL > backup_$DATE.sql
echo "Backup créé: backup_$DATE.sql"
```

### Script de Déploiement Complet

```bash
#!/bin/bash
# deploy.sh
# Utilisation: ./deploy.sh "message de commit"

git add .
git commit -m "$1"
git push origin main
echo "✅ Code poussé sur GitHub"
echo "⏳ Railway et Vercel vont déployer automatiquement..."
echo "📊 Surveillez les déploiements:"
echo "   Railway: railway logs"
echo "   Vercel: vercel logs --follow"
```

### Rendre les scripts exécutables

```bash
chmod +x backup-db.sh deploy.sh
```

---

## 🎯 Commandes Fréquentes (Cheatsheet)

| Action | Commande |
|--------|----------|
| **Développement local backend** | `cd apps/api && npm run start:dev` |
| **Développement local frontend** | `cd apps/web && npm run dev` |
| **Déployer sur Railway** | `railway up` ou push sur `main` |
| **Déployer sur Vercel** | `vercel --prod` ou push sur `main` |
| **Voir logs Railway** | `railway logs` |
| **Voir logs Vercel** | `vercel logs [url]` |
| **Migrations Prisma** | `npx prisma migrate deploy` |
| **Ouvrir Prisma Studio** | `npx prisma studio` |
| **Variables Railway** | `railway variables` |
| **Variables Vercel** | `vercel env ls` |
| **Build backend** | `cd apps/api && npm run build` |
| **Build frontend** | `cd apps/web && npm run build` |

---

## 📚 Liens Utiles

- [Railway CLI Docs](https://docs.railway.app/develop/cli)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Prisma CLI Docs](https://www.prisma.io/docs/reference/api-reference/command-reference)

---

**💡 Astuce**: Ajoutez ces alias à votre `.bashrc` ou `.zshrc` pour aller plus vite:

```bash
# Alias utiles pour Gestion Apparts
alias api="cd apps/api"
alias web="cd apps/web"
alias rw="railway"
alias vc="vercel"
alias pm="npx prisma migrate"
alias ps="npx prisma studio"
```

---

**Dernière mise à jour**: Décembre 2024
