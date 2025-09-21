# Dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY yarn.lock* ./
RUN yarn install --frozen-lockfile

# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
RUN npx prisma generate
RUN yarn build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install Prisma CLI globally for migrations
RUN npm install -g prisma

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

EXPOSE 4000

# Script to run migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
