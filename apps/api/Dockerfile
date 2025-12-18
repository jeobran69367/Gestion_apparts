# Build stage
FROM node:20-alpine AS build

# Install necessary system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files and Prisma schema for dependency installation
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code, TypeScript configurations, and NestJS CLI configuration
COPY src ./src
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

# Build the application using explicit npx command
RUN npx nest build

# Verify build output exists - show what's in dist
RUN echo "=== Checking build output ===" && \
    ls -la && \
    echo "=== Contents of dist directory ===" && \
    ls -laR dist/ && \
    echo "=== Verifying dist/main.js ===" && \
    test -f dist/main.js && echo "✓ Build successful: dist/main.js exists" || (echo "✗ Build failed: dist/main.js not found" && exit 1)

# Production stage
FROM node:20-alpine AS production

# Install necessary system dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files and Prisma schema (needed for postinstall script)
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
# Note: postinstall script runs "npx prisma generate" which needs prisma directory
RUN npm ci --omit=dev

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Verify dist directory in production
RUN ls -la dist/ && test -f dist/main.js && echo "✓ Production stage: dist/main.js exists" || (echo "✗ Production stage: dist/main.js not found" && exit 1)

# Expose application port
EXPOSE 3000

# Start command: run migrations then start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
