# Stage 1: Build
FROM node:20-alpine AS build
RUN apk add --no-cache openssl libc6-compat bash
WORKDIR /app
COPY package*.json tsconfig.json prisma ./ 
RUN npm ci --include=dev
COPY src ./src
RUN npx prisma generate
RUN npm run build
RUN ls -R dist  # vérifier le contenu

# Stage 2: Production
FROM node:20-alpine AS production
RUN apk add --no-cache openssl libc6-compat bash
WORKDIR /app
COPY package*.json prisma ./
RUN npm ci --omit=dev
RUN npx prisma generate
COPY --from=build /app/dist ./dist
RUN test -f dist/main.js && echo "main.js OK"
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
