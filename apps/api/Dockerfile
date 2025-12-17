# Use Node.js 20 LTS as base image
FROM node:20-alpine AS base

# Install necessary dependencies including OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --include=dev

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma Client
RUN npx prisma generate

# Copy built application from build stage
COPY --from=base /app/dist ./dist

# Expose port (Railway will provide this via PORT env var)
EXPOSE 3000

# Start command - run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
