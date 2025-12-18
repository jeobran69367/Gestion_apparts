# 🏠 Gestion Apparts

Application complète de gestion de réservations de studios avec paiements intégrés.

## 🌟 Fonctionnalités

- 🔐 Authentification JWT
- 🏢 Gestion de studios (propriétaires)
- 📅 Système de réservations
- 💳 Intégration paiements (PawaPay)
- 📧 Notifications email
- 📱 Interface responsive
- 🖼️ Upload d'images

## 🏗️ Architecture

```
Gestion_apparts/
├── apps/
│   ├── api/          # Backend NestJS + Prisma
│   └── web/          # Frontend Next.js + React
├── railway.toml      # Configuration Railway
├── vercel.json       # Configuration Vercel
└── docs/             # Documentation
```

## 🚀 Déploiement

### Production

- **Backend (API)**: Railway → [Guide complet](./GUIDE_DEPLOIEMENT_COMPLET.md)
- **Frontend (Web)**: Vercel → [Guide complet](./GUIDE_DEPLOIEMENT_COMPLET.md)

📚 **Ressources de déploiement**:
- [📖 Guide de Déploiement Complet](./GUIDE_DEPLOIEMENT_COMPLET.md) - Documentation détaillée
- [⌨️ Commandes de Déploiement](./COMMANDES_DEPLOIEMENT.md) - Référence rapide
- [✅ Checklist de Déploiement](./CHECKLIST_DEPLOIEMENT.md) - Liste de vérification

### Développement Local

#### Prérequis

- Node.js 18+
- PostgreSQL
- npm ou yarn

#### Backend (API)

```bash
# Installation
cd apps/api
npm install

# Configuration
cp .env.example .env
# Éditez .env avec vos valeurs

# Base de données
npx prisma generate
npx prisma migrate dev

# Démarrage
npm run start:dev
# API disponible sur http://localhost:4000
```

#### Frontend (Web)

```bash
# Installation
cd apps/web
npm install

# Configuration
cp .env.example .env
# Éditez .env avec vos valeurs

# Démarrage
npm run dev
# App disponible sur http://localhost:3000
```

## 🔧 Technologies

### Backend
- **Framework**: NestJS
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (Passport)
- **Email**: Nodemailer
- **Upload**: Multer

### Frontend
- **Framework**: Next.js 15
- **UI**: React 19
- **Styling**: Tailwind CSS
- **TypeScript**: 5.x

## 📝 Scripts Disponibles

### Backend (apps/api)

```bash
npm run start:dev    # Développement avec hot-reload
npm run build        # Build pour production
npm run start:prod   # Démarrer en production
npm test             # Lancer les tests
npm run lint         # Linter le code
```

### Frontend (apps/web)

```bash
npm run dev          # Développement
npm run build        # Build pour production
npm start            # Démarrer en production
npm run lint         # Linter le code
```

## 🔐 Variables d'Environnement

### Backend (.env)

Voir [apps/api/.env.example](./apps/api/.env.example) pour la liste complète:

- `DATABASE_URL` - URL PostgreSQL
- `JWT_SECRET` - Secret pour JWT
- `EMAIL_*` - Configuration email
- `PAWAPAY_API_KEY` - Clé API paiements
- `FRONTEND_URL` - URL du frontend

### Frontend (.env)

Voir [apps/web/.env.example](./apps/web/.env.example) pour la liste complète:

- `NEXT_PUBLIC_API_URL` - URL de l'API backend
- `PAWAPAY_API_KEY` - Clé API paiements

## 📚 Documentation

- [Guide de Déploiement Complet](./GUIDE_DEPLOIEMENT_COMPLET.md)
- [Commandes de Déploiement](./COMMANDES_DEPLOIEMENT.md)
- [Checklist de Déploiement](./CHECKLIST_DEPLOIEMENT.md)
- [Guide de Gestion des Images](./IMAGE_MANAGEMENT_GUIDE.md)
- [Guide de Tests](./TESTING_GUIDE.md)
- [Résumé de Sécurité](./SECURITY_SUMMARY.md)

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est privé et propriétaire.

## 👤 Auteur

**Jeobran Kombou**
- GitHub: [@jeobran69367](https://github.com/jeobran69367)
- Projet: Gestion Apparts

## 🆘 Support

Pour obtenir de l'aide:
1. Consultez la [documentation](./GUIDE_DEPLOIEMENT_COMPLET.md)
2. Vérifiez les [issues existantes](https://github.com/jeobran69367/Gestion_apparts/issues)
3. Créez une nouvelle issue si nécessaire

---

**Fait avec ❤️ par Jeobran Kombou**
