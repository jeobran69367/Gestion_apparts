# --- STAGE 1: Build ---
FROM node:20-alpine AS build
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# On installe TOUTES les dépendances pour compiler le TypeScript
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# --- STAGE 2: Production ---
FROM node:20-alpine AS production
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Copie uniquement les fichiers nécessaires pour l'exécution
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma/
COPY --from=build /app/node_modules ./node_modules
# /!\ BIEN VÉRIFIER LE CHEMIN CI-DESSOUS /!\
COPY --from=build /app/dist ./dist

EXPOSE 3000

# Utilisation de npx prisma migrate deploy pour la prod
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]