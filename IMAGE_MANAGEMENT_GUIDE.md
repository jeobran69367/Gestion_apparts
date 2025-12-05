# Gestion des Images pour les Studios

## Vue d'ensemble

Ce système de gestion d'images professionnel permet de stocker et récupérer les images des studios de manière stable et sécurisée dans la base de données PostgreSQL existante.

## Architecture

### Backend (NestJS)

#### 1. Module Uploads (`apps/api/src/uploads/`)

Le module Uploads gère toutes les opérations liées aux images :

- **UploadsService** : Service principal pour la validation et la gestion des images
- **UploadsController** : Endpoints REST pour l'upload, la récupération et la suppression d'images
- **UploadsModule** : Module NestJS qui encapsule la fonctionnalité

#### 2. Endpoints API

##### Upload d'images
```
POST /api/uploads/studios/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: FormData avec 'images' (jusqu'à 10 fichiers)
```

**Validation :**
- Formats acceptés : JPEG, JPG, PNG, WEBP
- Taille maximale : 5MB par fichier
- Nombre maximum : 10 images par requête

**Réponse :**
```json
{
  "urls": [
    "http://localhost:4000/api/uploads/studios/studio-1234567890-123456789.jpg",
    "http://localhost:4000/api/uploads/studios/studio-1234567890-987654321.jpg"
  ],
  "message": "2 image(s) uploadée(s) avec succès"
}
```

##### Récupération d'image
```
GET /api/uploads/studios/:filename
```

Retourne directement le fichier image.

##### Suppression d'images
```
DELETE /api/uploads/studios/images
Authorization: Bearer <token>
Content-Type: application/json

Body: {
  "urls": [
    "http://localhost:4000/api/uploads/studios/studio-1234567890-123456789.jpg"
  ]
}
```

#### 3. Stockage des Fichiers

Les images sont stockées dans le système de fichiers :
- Chemin : `apps/api/uploads/studios/`
- Nom de fichier : `studio-{timestamp}-{random}.{ext}`
- Le répertoire est créé automatiquement si nécessaire
- Ajouté au `.gitignore` pour éviter de versionner les fichiers uploadés

#### 4. Intégration avec le Module Studios

Le service `StudiosService` a été mis à jour pour :
- Supprimer automatiquement les images du système de fichiers lorsqu'un studio est supprimé
- Utiliser le `UploadsService` pour extraire les noms de fichiers des URLs

### Frontend (Next.js)

#### 1. Page de Création de Studio (`apps/web/src/app/studios/create/page.tsx`)

**Fonctionnalités :**
- Sélection de plusieurs fichiers image
- Preview des images avant upload
- Validation côté client (type et taille)
- Possibilité de supprimer des images de la preview
- Upload des images vers le backend avant création du studio
- Indicateur de progression pendant l'upload

**Workflow :**
1. Utilisateur sélectionne des fichiers
2. Validation et affichage des previews
3. Lors de la soumission du formulaire :
   - Upload des images vers `/api/uploads/studios/images`
   - Récupération des URLs des images
   - Création du studio avec les URLs des images

#### 2. Page d'Édition de Studio (`apps/web/src/app/studios/edit/[id]/page.tsx`)

**Fonctionnalités :**
- Affichage des images existantes
- Possibilité de supprimer des images existantes
- Ajout de nouvelles images avec preview
- Différenciation visuelle entre images existantes et nouvelles
- Upload des nouvelles images lors de la sauvegarde

**Workflow :**
1. Chargement des données du studio avec les images existantes
2. Utilisateur peut supprimer des images existantes ou en ajouter
3. Lors de la soumission :
   - Upload des nouvelles images
   - Combinaison des URLs existantes et nouvelles
   - Mise à jour du studio

## Base de Données

Les URLs des images sont stockées dans le champ `photos` du modèle `Studio` :

```prisma
model Studio {
  // ... autres champs
  photos        String[] // URLs des photos
  // ...
}
```

## Sécurité

### Validation des Fichiers

1. **Type de fichier** : Seuls JPEG, JPG, PNG et WEBP sont acceptés
2. **Taille** : Maximum 5MB par fichier
3. **Quantité** : Maximum 10 fichiers par upload

### Authentification

- Tous les endpoints d'upload et de suppression requièrent un token JWT valide
- Seul le propriétaire d'un studio peut supprimer ses images

### Nettoyage

- Suppression automatique des fichiers physiques lors de la suppression d'un studio
- Gestion des erreurs pour éviter les crashs si un fichier n'existe pas

## Installation et Configuration

### Prérequis

- Node.js 18+
- PostgreSQL
- npm ou yarn

### Installation

1. **Backend :**
```bash
cd apps/api
npm install
```

2. **Frontend :**
```bash
cd apps/web
npm install
```

### Configuration

Aucune configuration supplémentaire n'est requise. Le répertoire `uploads/studios` sera créé automatiquement.

## Utilisation

### Pour créer un studio avec des images :

1. Connectez-vous en tant qu'administrateur
2. Accédez à `/studios/create`
3. Remplissez le formulaire
4. Dans la section "Photos", cliquez sur le champ de sélection de fichiers
5. Sélectionnez jusqu'à 10 images (JPEG, PNG ou WEBP, max 5MB chacune)
6. Les previews apparaissent automatiquement
7. Vous pouvez supprimer des images avec le bouton "×"
8. Soumettez le formulaire - les images seront uploadées automatiquement

### Pour modifier les images d'un studio :

1. Accédez à `/studios/edit/[id]`
2. Les images actuelles sont affichées en premier
3. Vous pouvez supprimer des images existantes avec le bouton "×"
4. Pour ajouter de nouvelles images, utilisez le champ de sélection
5. Les nouvelles images apparaissent avec une bordure bleue
6. Sauvegardez - les nouvelles images seront uploadées et combinées avec les existantes

## Tests

### Test manuel complet :

1. **Création :**
   - Créer un studio avec 3 images
   - Vérifier que les images apparaissent dans la liste des studios
   - Vérifier que les images sont dans `apps/api/uploads/studios/`

2. **Édition :**
   - Éditer le studio créé
   - Supprimer 1 image existante
   - Ajouter 2 nouvelles images
   - Sauvegarder et vérifier

3. **Suppression :**
   - Supprimer le studio
   - Vérifier que les fichiers images ont été supprimés du système de fichiers

## Améliorations Futures Possibles

1. **Stockage Cloud** : Intégration avec AWS S3, Azure Blob Storage ou Google Cloud Storage
2. **Optimisation d'images** : Redimensionnement et compression automatiques
3. **CDN** : Utilisation d'un CDN pour la distribution des images
4. **Images responsives** : Génération de plusieurs tailles d'images
5. **Métadonnées** : Extraction des métadonnées EXIF
6. **Watermarking** : Ajout automatique de watermarks
7. **Lazy loading** : Optimisation du chargement des images
8. **Gestion de quota** : Limitation du stockage par utilisateur

## Dépannage

### Les images ne s'uploadent pas
- Vérifier que le serveur backend est démarré
- Vérifier les permissions du répertoire `uploads/studios`
- Vérifier les logs du serveur pour les erreurs

### Les images ne s'affichent pas
- Vérifier que le CORS est correctement configuré
- Vérifier que les URLs sont correctement formées
- Vérifier que le fichier existe dans `uploads/studios`

### Erreur "File too large"
- Vérifier que les fichiers font moins de 5MB
- Compresser les images si nécessaire

## Support

Pour toute question ou problème, consulter :
- Les logs du serveur : `apps/api/`
- Les logs du navigateur (console)
- Le code source dans `apps/api/src/uploads/`
