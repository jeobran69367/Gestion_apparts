# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build
# Use the locally installed prisma version from node_modules
RUN npm run prisma:generate
RUN npm run build

# Debug: List what was created
RUN echo "=== Build completed, checking dist folder ===" && \
    ls -la && \
    if [ -d dist ]; then \
      echo "dist folder exists:" && ls -laR dist/; \
    else \
      echo "ERROR: dist folder does not exist!"; \
    fi

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma client in production stage
RUN npm run prisma:generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Debug: Verify files were copied
RUN echo "=== Checking copied dist folder ===" && \
    if [ -d dist ]; then \
      echo "dist folder exists in runner:" && ls -laR dist/ | head -20; \
    else \
      echo "ERROR: dist folder was not copied!"; \
    fi

# Expose port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]
