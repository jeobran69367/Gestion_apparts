# -----------------------------
# Stage 1: Build
# -----------------------------
FROM node:20-alpine AS build

# Installer les dépendances système nécessaires
RUN apk add --no-cache openssl libc6-compat bash

WORKDIR /app

# Copier les fichiers de configuration et package.json
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Installer toutes les dépendances (dev + prod)
RUN npm ci --include=dev

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY src ./src

# Compiler le TypeScript
RUN npm run build

# Vérification du build
RUN echo "=== Contenu de dist ===" && ls -la dist && \
    test -f dist/main.js && echo "main.js trouvé!" || (echo "ERROR: main.js manquant!" && exit 1)

# -----------------------------
# Stage 2: Production
# -----------------------------
FROM node:20-alpine AS production

RUN apk add --no-cache openssl libc6-compat bash

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY package*.json ./
COPY prisma ./prisma/

# Installer seulement les dépendances prod
RUN npm ci --omit=dev

# Générer le client Prisma pour prod
RUN npx prisma generate

# Copier le build du stage précédent
COPY --from=build /app/dist ./dist

# Vérification finale
RUN test -f dist/main.js && echo "main.js OK en prod" || (echo "ERROR: main.js manquant en prod!" && exit 1)

# Exposer le port (Railway utilise PORT env var)
EXPOSE 3000

# Commande de démarrage : appliquer les migrations puis lancer l'API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
