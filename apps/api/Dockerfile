# Build stage
FROM node:20-alpine AS build

# Install necessary system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and configuration
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/ && test -f dist/main.js && echo "✓ Build successful: dist/main.js exists" || (echo "✗ Build failed: dist/main.js not found" && exit 1)

# Production stage
FROM node:20-alpine AS production

# Install necessary system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Verify dist directory in production
RUN ls -la dist/ && test -f dist/main.js && echo "✓ Production stage: dist/main.js exists" || (echo "✗ Production stage: dist/main.js not found" && exit 1)

# Expose application port
EXPOSE 3000

# Start command: run migrations then start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]