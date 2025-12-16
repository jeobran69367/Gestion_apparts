# Docker Quick Start Guide

## 🚀 Démarrage Rapide

Ce guide vous aide à lancer l'application avec Docker en quelques minutes.

## Prérequis

- Docker et Docker Compose installés
- Git

## Étapes de Démarrage

### 1. Cloner le Projet

```bash
git clone https://github.com/jeobran69367/Gestion_apparts.git
cd Gestion_apparts
```

### 2. Créer les Fichiers de Configuration

#### Option A : Utiliser les valeurs par défaut

```bash
# Créer le .env à la racine
cp .env.example .env

# OU créer manuellement
cat > .env << EOF
JWT_SECRET=votre-secret-key-changez-moi-en-production
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
PAWAPAY_API_KEY=votre-cle-pawapay
EOF
```

#### Option B : Configuration manuelle

Créez `.env` à la racine avec :

```env
# Configuration Backend
JWT_SECRET=votre-secret-key-minimum-32-caracteres
FRONTEND_URL=http://localhost:3000

# Configuration Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000/api
PAWAPAY_API_KEY=votre-cle-api-pawapay
```

### 3. Lancer l'Application

```bash
docker-compose up -d
```

Cette commande va :
1. ✅ Télécharger les images Docker nécessaires
2. ✅ Construire les images de l'API et du Web
3. ✅ Démarrer PostgreSQL, l'API NestJS et le frontend Next.js
4. ✅ Exécuter les migrations de base de données

### 4. Vérifier que Tout Fonctionne

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Vérifier l'état des services
docker-compose ps
```

Vous devriez voir :
- ✅ `gestion-apparts-db` (PostgreSQL) - Port 5432
- ✅ `gestion-apparts-api` (NestJS) - Port 4000
- ✅ `gestion-apparts-web` (Next.js) - Port 3000

### 5. Accéder à l'Application

Ouvrez votre navigateur :

- **Frontend** : http://localhost:3000
- **API** : http://localhost:4000/api
- **Base de données** : localhost:5432

## 🔧 Commandes Utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres
```

### Redémarrer les services

```bash
# Tout redémarrer
docker-compose restart

# Un service spécifique
docker-compose restart api
```

### Arrêter l'application

```bash
docker-compose down
```

### Reconstruire et redémarrer

```bash
# Si vous avez modifié le code
docker-compose up -d --build
```

### Nettoyer complètement

```bash
# Arrêter et supprimer les conteneurs, volumes
docker-compose down -v

# Supprimer les images
docker-compose down -v --rmi all
```

## 🐛 Résolution de Problèmes

### Erreur : "Cannot find module '/app/dist/main'"

✅ **Résolu** dans la dernière version du Dockerfile.

**Cause** : Le build NestJS ne créait pas le fichier `dist/main.js` correctement.

**Solution** : Ajout de `nest-cli.json` et mise à jour du Dockerfile pour :
- Utiliser la version locale de Prisma (pas `npx prisma`)
- Corriger le chemin de démarrage (`node dist/main`)

Si vous avez cette erreur :
```bash
git pull origin copilot/fix-deploiyement-issue
docker-compose up -d --build
```

### Erreur : "public directory not found"

✅ **Résolu** dans la dernière version du Dockerfile.

Si vous avez cette erreur avec une ancienne version :
```bash
git pull origin copilot/fix-deploiyement-issue
docker-compose up -d --build
```

### Erreur : "Port already in use"

Un service utilise déjà le port. Solutions :

```bash
# Trouver le processus
lsof -i :3000  # ou :4000 ou :5432

# Arrêter le processus
kill -9 <PID>

# OU changer les ports dans docker-compose.yml
```

### Erreur : "Cannot connect to database"

Vérifiez que PostgreSQL est bien démarré :

```bash
docker-compose ps postgres
docker-compose logs postgres
```

Attendez quelques secondes que la base démarre complètement.

### L'API ne répond pas

```bash
# Vérifier les logs
docker-compose logs api

# Redémarrer l'API
docker-compose restart api
```

### Erreur de build

```bash
# Nettoyer et reconstruire
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## 📊 Vérification Santé

Après le démarrage, testez :

```bash
# Test PostgreSQL
docker-compose exec postgres psql -U postgres -d gestion_apparts -c "SELECT 1;"

# Test API
curl http://localhost:4000/api

# Test Frontend
curl http://localhost:3000
```

## 🔐 Sécurité

**⚠️ IMPORTANT pour la production :**

1. **Changez `JWT_SECRET`** : Utilisez une clé secrète forte
   ```bash
   # Générer une clé aléatoire
   openssl rand -base64 32
   ```

2. **Ne commitez JAMAIS le fichier `.env`** (déjà dans .gitignore)

3. **Utilisez des mots de passe forts** pour PostgreSQL en production

## 📝 Variables d'Environnement Requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `JWT_SECRET` | Clé secrète pour JWT | `my-super-secret-key-32-chars` |
| `FRONTEND_URL` | URL du frontend | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL de l'API | `http://localhost:4000/api` |
| `PAWAPAY_API_KEY` | Clé API PawaPay | `pk_test_xxxxx` |

## 🎉 C'est Tout !

Votre application est maintenant prête à l'emploi :

- ✅ Base de données PostgreSQL configurée
- ✅ API NestJS opérationnelle
- ✅ Frontend Next.js accessible
- ✅ Migrations appliquées automatiquement

Pour déployer en production, consultez [DEPLOYMENT.md](./DEPLOYMENT.md).

## 💡 Astuces

### Mode Développement

Pour un développement actif avec hot-reload :

```bash
# Terminal 1 - API
cd apps/api
npm install
npm run start:dev

# Terminal 2 - Web
cd apps/web
npm install
npm run dev
```

### Accès Base de Données

Avec un client PostgreSQL :
- **Host** : localhost
- **Port** : 5432
- **User** : postgres
- **Password** : postgres (par défaut)
- **Database** : gestion_apparts

### Seed Data

Pour ajouter des données de test :

```bash
docker-compose exec api npm run db:seed
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com)
- [Docker Compose](https://docs.docker.com/compose/)
- [Guide Déploiement Complet](./DEPLOYMENT.md)
- [Configuration API](./API_CONFIGURATION_GUIDE.md)
