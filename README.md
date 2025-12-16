# Gestion Apparts

Application de gestion d'appartements avec backend NestJS et frontend Next.js.

## 🚀 Démarrage Rapide avec Docker

> **📘 Guide Complet** : Consultez [DOCKER_QUICK_START.md](./DOCKER_QUICK_START.md) pour un guide détaillé avec résolution de problèmes.

### Prérequis
- Docker et Docker Compose installés
- Git

### Démarrage en 3 étapes

1. **Cloner le projet** :
```bash
git clone https://github.com/jeobran69367/Gestion_apparts.git
cd Gestion_apparts
```

2. **Configurer les variables d'environnement** :

Créer `.env` à la racine du projet :
```bash
cp .env.example .env
# Puis éditez .env avec vos valeurs
```

**Minimum requis** :
```env
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
PAWAPAY_API_KEY=your-pawapay-api-key
```

3. **Lancer l'application** :
```bash
docker-compose up -d
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- API : http://localhost:4000/api
- PostgreSQL : localhost:5432

### Commandes utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Reconstruire et redémarrer
docker-compose up -d --build
```

## 📚 Documentation Complète

Pour plus de détails sur le déploiement (Railway, Render, Vercel, etc.), consultez [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🏗️ Structure du Projet

```
Gestion_apparts/
├── apps/
│   ├── api/              # Backend NestJS
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/              # Frontend Next.js
│       ├── src/
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml
├── render.yaml
├── vercel.json
└── DEPLOYMENT.md
```

## 🛠️ Développement Local

### Backend (API)

```bash
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend (Web)

```bash
cd apps/web
npm install
npm run dev
```

## 🌐 Déploiement sur Cloud

### Railway
- Déployez directement depuis GitHub
- Les fichiers `railway.json` sont déjà configurés
- Ajoutez une base de données PostgreSQL depuis la marketplace

### Render
- Utilisez le fichier `render.yaml` pour un déploiement automatique
- Ou configurez manuellement les services web et la base de données

### Vercel (Frontend uniquement)
- Importez le projet depuis GitHub
- Sélectionnez `apps/web` comme root directory
- Configurez les variables d'environnement

## 📝 Variables d'Environnement

Consultez les fichiers `.env.example` dans chaque application pour la liste complète des variables requises.

## 👤 Auteur

**Jeobran Kombou**
- Projet : Gestion Apparts
- Date : Novembre 2025

## 📄 Licence

Private
