# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code  
COPY . .

# Build the application (this also generates Prisma client)
RUN npm run build

# Verify build output - FAIL if dist doesn't exist or is empty
RUN if [ ! -d "dist" ]; then \
      echo "ERROR: dist directory was not created!"; \
      echo "Listing current directory:"; \
      ls -la; \
      exit 1; \
    fi && \
    if [ ! -f "dist/main.js" ]; then \
      echo "ERROR: dist/main.js was not created!"; \
      echo "Contents of dist directory:"; \
      ls -laR dist/; \
      exit 1; \
    fi && \
    echo "✅ Build successful: dist/main.js created" && \
    ls -la dist/

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Generate Prisma client in production (needed for runtime)
RUN npx prisma generate

# Verify dist structure
RUN ls -la dist/ && echo "Dist folder copied to runner"

# Expose port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]
