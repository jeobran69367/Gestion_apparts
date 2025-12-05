# Stockage des Images en Base de Données

## Vue d'ensemble

Le système de gestion des images stocke maintenant **toutes les images directement dans la base de données PostgreSQL** sous forme de chaînes Base64. Cette approche élimine complètement le besoin de stockage sur le système de fichiers.

## Pourquoi le stockage en base de données ?

### ❌ Problèmes du stockage fichier
- Volume des fichiers augmente au fur et à mesure
- Nécessite une gestion séparée des sauvegardes
- Problèmes de synchronisation entre fichiers et BDD
- Complexité de déploiement (uploads folder)
- Nettoyage manuel des fichiers orphelins

### ✅ Avantages du stockage en BDD
- **Pas de croissance du volume de code** : Tout dans PostgreSQL
- **Backup simplifié** : Une seule sauvegarde BDD suffit
- **Intégrité des données** : Transactions atomiques
- **Migration facile** : Export/import de la BDD uniquement
- **Déploiement simplifié** : Pas de dossier uploads à gérer

## Architecture technique

### Schéma de base de données

```prisma
model Studio {
  // ... autres champs
  photos        String[]  // Images encodées en Base64
  primaryPhoto  String?   // Image principale encodée en Base64
}
```

### Format de stockage

Les images sont stockées au format Data URL :
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBg...
```

**Structure** :
- `data:` - Préfixe du Data URL
- `image/jpeg` - Type MIME (jpeg, png, webp)
- `;base64,` - Encodage
- `/9j/4AAQ...` - Données Base64 de l'image

### Taille des données

**Exemple pour une image 5MB** :
- Fichier original : 5 MB
- Encodé en Base64 : ~6.7 MB (+33%)
- Acceptable pour PostgreSQL avec `text` type

## Implémentation

### Backend (NestJS)

#### 1. Endpoint d'upload

```typescript
// POST /api/uploads/studios/images
@Post('studios/images')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FilesInterceptor('images', 10, {
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Type non autorisé'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
}))
async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
  // Conversion en Base64
  const base64Images = files.map((file) => {
    const base64 = file.buffer.toString('base64');
    const mimeType = file.mimetype;
    return `data:${mimeType};base64,${base64}`;
  });

  return { base64Images };
}
```

**Réponse** :
```json
{
  "base64Images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "data:image/png;base64,iVBORw0KGgoAAAA..."
  ],
  "message": "2 image(s) uploadée(s) avec succès"
}
```

#### 2. Création de studio

```typescript
async create(createStudioDto: CreateStudioDto, ownerId: number) {
  const studioData = {
    ...createStudioDto,
    photos: createStudioDto.photos, // Tableaux de Base64
    primaryPhoto: createStudioDto.primaryPhoto || createStudioDto.photos?.[0],
  };

  return this.prisma.studio.create({
    data: { ...studioData, ownerId },
  });
}
```

#### 3. Suppression de studio

```typescript
async remove(id: number, userId: number) {
  // Validation du propriétaire
  const studio = await this.prisma.studio.findUnique({ where: { id } });
  if (studio.ownerId !== userId) {
    throw new ForbiddenException();
  }

  // Suppression simple - images supprimées automatiquement avec le studio
  return this.prisma.studio.delete({ where: { id } });
}
```

### Frontend (Next.js)

#### 1. Upload avec aperçu

```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  
  // Validation
  const validFiles = files.filter((file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
  });

  setSelectedFiles(validFiles);
  
  // Créer des previews (object URLs locaux)
  const previews = validFiles.map((file) => URL.createObjectURL(file));
  setPreviewUrls(previews);
};
```

#### 2. Envoi au serveur

```typescript
const uploadImages = async (): Promise<string[]> => {
  const formData = new FormData();
  selectedFiles.forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetch('/api/uploads/studios/images', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();
  return data.base64Images; // Retourne les images Base64
};
```

#### 3. Affichage des images

```typescript
// Les images Base64 s'affichent directement dans <img>
<img 
  src={maison.primaryPhoto || maison.photos[0]} 
  alt={maison.name}
/>

// Exemple de src:
// data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...
```

## Avantages techniques détaillés

### 1. Transactions atomiques
```typescript
// Tout ou rien - cohérence garantie
await prisma.studio.create({
  data: {
    name: "Studio Moderne",
    photos: [base64Image1, base64Image2], // Sauvegarde atomique
    primaryPhoto: base64Image1,
    // ... autres champs
  }
});
```

### 2. Backup simplifié
```bash
# Avant (stockage fichier) : 2 sauvegardes nécessaires
pg_dump mydb > backup.sql
tar -czf uploads.tar.gz uploads/

# Maintenant : 1 seule sauvegarde
pg_dump mydb > backup_complet.sql
```

### 3. Migration facilitée
```bash
# Export
pg_dump -U user -d gestion_apparts > export.sql

# Import (avec toutes les images incluses)
psql -U user -d gestion_apparts_new < export.sql
```

### 4. Pas de nettoyage manuel
```typescript
// Avant : Nettoyage fichier nécessaire
async remove(id: number) {
  const studio = await this.prisma.studio.findUnique({ where: { id } });
  
  // Supprimer chaque fichier
  studio.photos.forEach(url => {
    const filename = extractFilename(url);
    fs.unlinkSync(`uploads/studios/${filename}`);
  });
  
  await this.prisma.studio.delete({ where: { id } });
}

// Maintenant : Suppression simple
async remove(id: number) {
  await this.prisma.studio.delete({ where: { id } });
  // Images supprimées automatiquement !
}
```

## Performance

### Considérations

**Taille de stockage** :
- Image 1MB → Base64 ~1.33MB (+33%)
- Acceptable pour PostgreSQL (text type illimité pratiquement)

**Vitesse d'affichage** :
- Pas de requête HTTP séparée pour chaque image
- Images chargées avec les données du studio
- Réduction du nombre de requêtes réseau

**Cache navigateur** :
- Les Data URLs sont mis en cache par le navigateur
- Même comportement qu'avec des URLs classiques

### Optimisations possibles

1. **Compression** : Compresser les images avant Base64
2. **Lazy loading** : Charger les images secondaires à la demande
3. **Thumbnails** : Stocker des miniatures séparées
4. **CDN** : Exporter les images vers CDN si nécessaire

## Comparaison : Fichier vs Base64

| Critère | Stockage Fichier | Base64 en BDD |
|---------|------------------|---------------|
| **Volume code** | ❌ Croissance continue | ✅ Stable |
| **Backup** | ❌ 2 sources (BDD + fichiers) | ✅ 1 source unique |
| **Synchronisation** | ❌ Risque d'incohérence | ✅ Toujours cohérent |
| **Migration** | ❌ Complexe (BDD + fichiers) | ✅ Simple (BDD only) |
| **Déploiement** | ❌ Gérer uploads folder | ✅ Aucune config fichier |
| **Nettoyage** | ❌ Manuel/automatisé | ✅ Automatique |
| **Taille** | ✅ Optimale | ⚠️ +33% |
| **Transactions** | ❌ Risque d'orphelins | ✅ Atomique |

## Migration depuis fichiers

Si vous avez déjà des images en fichiers, voici le script de migration :

```typescript
async function migrateToBase64() {
  const studios = await prisma.studio.findMany();
  
  for (const studio of studios) {
    const base64Photos: string[] = [];
    
    for (const photoUrl of studio.photos) {
      const filename = extractFilename(photoUrl);
      const filePath = `uploads/studios/${filename}`;
      
      // Lire le fichier
      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = mime.lookup(filePath);
      
      // Convertir en Base64
      const base64 = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      base64Photos.push(dataUrl);
    }
    
    // Mettre à jour le studio
    await prisma.studio.update({
      where: { id: studio.id },
      data: {
        photos: base64Photos,
        primaryPhoto: base64Photos[0],
      },
    });
  }
  
  console.log('Migration terminée !');
}
```

## Limites PostgreSQL

**Taille maximale** :
- Type `text` : ~1GB par valeur
- Type `String[]` : Pas de limite pratique pour le nombre d'éléments

**Recommandations** :
- Maximum 10 images par studio (déjà implémenté)
- Maximum 5MB par image (déjà implémenté)
- Total ~67MB Base64 par studio (largement gérable)

## Conclusion

Le stockage en base de données avec Base64 est **optimal pour cette application** car :

✅ **Pas de croissance du volume de fichiers**
✅ **Architecture simplifiée**
✅ **Intégrité des données garantie**
✅ **Backup et migration facilitées**
✅ **Déploiement simplifié**

Le surcoût de +33% en taille est **largement compensé** par les avantages en termes de maintenance, fiabilité et simplicité.

## Support

Pour toute question sur le stockage des images :
- Consulter les logs API pour les erreurs d'upload
- Vérifier la taille des images (max 5MB)
- S'assurer que PostgreSQL a suffisamment d'espace
- Les images s'affichent directement via les Data URLs
