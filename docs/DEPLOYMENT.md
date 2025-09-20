# 🚀 Guide de Déploiement - Mon-Appart

## Table des Matières
- [🏗️ Stratégies de Déploiement](#️-stratégies-de-déploiement)
- [🐳 Docker en Production](#-docker-en-production)
- [☁️ Déploiement Cloud](#️-déploiement-cloud)
- [🔄 CI/CD Pipelines](#-cicd-pipelines)
- [🌍 Variables d'Environnement](#-variables-denvironnement)
- [🛡️ Sécurité Production](#️-sécurité-production)
- [📊 Monitoring](#-monitoring)
- [🔄 Rolling Updates](#-rolling-updates)
- [💾 Backup Stratégie](#-backup-stratégie)
- [🚨 Disaster Recovery](#-disaster-recovery)

## 🏗️ Stratégies de Déploiement

### Environnements

```
Développement → Test → Staging → Production
     ↓            ↓       ↓          ↓
   Local       CI/CD   Pre-prod   Live Site
```

### Architecture Production

```mermaid
graph TB
    LB[Load Balancer]
    LB --> W1[Web Server 1]
    LB --> W2[Web Server 2]
    W1 --> API1[API Server 1]
    W2 --> API2[API Server 2]
    API1 --> DB[(PostgreSQL Master)]
    API2 --> DB
    DB --> DBR[(PostgreSQL Replica)]
    
    subgraph "Monitoring"
        M[Prometheus]
        G[Grafana]
        L[Logs Aggregator]
    end
    
    subgraph "Cache"
        R[Redis]
    end
    
    API1 --> R
    API2 --> R
```

## 🐳 Docker en Production

### 1. Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Base de données
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # API Backend
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 4000
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # Frontend Web
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: ${API_URL}
    depends_on:
      - api
    networks:
      - app-network
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  # Reverse Proxy
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/ssl/certs
      - web_static:/usr/share/nginx/html/static
    depends_on:
      - web
      - api
    networks:
      - app-network

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - app-network

  grafana:
    image: grafana/grafana:latest
    restart: always
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - app-network

volumes:
  postgres_data:
  prometheus_data:
  grafana_data:
  web_static:

networks:
  app-network:
    driver: bridge
```

### 2. Dockerfile Optimisé pour Production

#### API Dockerfile

```dockerfile
# apps/api/Dockerfile.prod
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production=false

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN yarn build

# Remove dev dependencies
RUN yarn install --production --ignore-scripts --prefer-offline

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install production dependencies
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Install Prisma CLI for migrations
RUN npm install -g prisma

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

USER nestjs

EXPOSE 4000

# Startup script
COPY --chown=nestjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]
```

#### Script d'Entrée

```bash
#!/bin/sh
# apps/api/docker-entrypoint.sh

set -e

echo "🚀 Starting Mon-Appart API..."

# Wait for database
echo "⏳ Waiting for database..."
until npx prisma db ping; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (if needed)
echo "⚙️ Generating Prisma client..."
npx prisma generate

# Start application
echo "🎉 Starting application..."
exec node dist/main.js
```

#### Frontend Dockerfile

```dockerfile
# apps/web/Dockerfile.prod
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build application
RUN yarn build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 3. Configuration Nginx

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api_backend {
        server api:4000;
    }

    upstream web_backend {
        server web:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=web:10m rate=5r/s;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            limit_req zone=web burst=10 nodelay;
            proxy_pass http://web_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /_next/static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://web_backend;
        }
    }
}
```

## ☁️ Déploiement Cloud

### 1. AWS ECS avec Fargate

```yaml
# aws/task-definition.json
{
  "family": "mon-appart",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "YOUR_ECR_REPO/mon-appart-api:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:mon-appart/db"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:mon-appart/jwt"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mon-appart",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "api"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:4000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### 2. Terraform Infrastructure

```hcl
# terraform/main.tf
provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "mon-appart-vpc"
  }
}

# Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "mon-appart-private-${count.index + 1}"
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 101}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "mon-appart-public-${count.index + 1}"
  }
}

# RDS
resource "aws_db_instance" "postgres" {
  identifier     = "mon-appart-db"
  engine         = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "appdb"
  username = "postgres"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "mon-appart-final-snapshot"
  
  tags = {
    Name = "mon-appart-db"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "mon-appart"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "mon-appart-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "mon-appart-alb"
  }
}
```

### 3. Kubernetes Deployment

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mon-appart

---
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: mon-appart
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: mon-appart/api:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/api-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: mon-appart
spec:
  selector:
    app: api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 4000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mon-appart-ingress
  namespace: mon-appart
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    - yourdomain.com
    secretName: mon-appart-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

## 🔄 CI/CD Pipelines

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'yarn'

    - name: Install dependencies
      run: |
        cd apps/api && yarn install
        cd ../web && yarn install

    - name: Run API tests
      run: |
        cd apps/api
        cp .env.example .env.test
        echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/testdb" >> .env.test
        npx prisma migrate deploy
        yarn test
        yarn test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb

    - name: Run Web tests
      run: |
        cd apps/web
        yarn test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        service: [api, web]

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: ./apps/${{ matrix.service }}
        file: ./apps/${{ matrix.service }}/Dockerfile.prod
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /opt/mon-appart
          
          # Pull latest images
          docker compose -f docker-compose.prod.yml pull
          
          # Rolling update
          docker compose -f docker-compose.prod.yml up -d --no-deps api
          docker compose -f docker-compose.prod.yml up -d --no-deps web
          
          # Run migrations
          docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
          
          # Cleanup old images
          docker image prune -f

  notify:
    needs: [test, build-and-push, deploy]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### 2. GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

services:
  - docker:20.10.16-dind
  - postgres:15

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

test:api:
  stage: test
  image: node:20-alpine
  variables:
    DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/testdb"
    POSTGRES_DB: testdb
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  before_script:
    - cd apps/api
    - yarn install
    - npx prisma migrate deploy
  script:
    - yarn test
    - yarn test:e2e
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: apps/api/coverage/cobertura-coverage.xml

build:api:
  stage: build
  image: docker:20.10.16
  script:
    - docker build -f apps/api/Dockerfile.prod -t $CI_REGISTRY_IMAGE/api:$CI_COMMIT_SHA ./apps/api
    - docker push $CI_REGISTRY_IMAGE/api:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE/api:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE/api:latest
    - docker push $CI_REGISTRY_IMAGE/api:latest
  only:
    - main

deploy:production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        cd /opt/mon-appart &&
        docker compose -f docker-compose.prod.yml pull &&
        docker compose -f docker-compose.prod.yml up -d &&
        docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
      "
  only:
    - main
  when: manual
```

## 🌍 Variables d'Environnement

### 1. Structure des Variables

```bash
# .env.production
# Application
NODE_ENV=production
APP_NAME="Mon-Appart"
APP_VERSION=1.0.0
APP_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://username:password@host:5432/database
DATABASE_POOL_SIZE=10
DATABASE_SSL=true

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION=30d

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_BUCKET_NAME=mon-appart-uploads
AWS_REGION=us-east-1

# Email
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@mg.yourdomain.com
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
NEW_RELIC_LICENSE_KEY=your-new-relic-key

# Redis (for sessions/cache)
REDIS_URL=redis://username:password@host:6379

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_PAYMENTS=true
MAINTENANCE_MODE=false
```

### 2. Gestion des Secrets

#### AWS Secrets Manager

```bash
# Créer les secrets
aws secretsmanager create-secret \
  --name "mon-appart/database" \
  --description "Database credentials" \
  --secret-string '{"url":"postgresql://...","user":"...","password":"..."}'

aws secretsmanager create-secret \
  --name "mon-appart/jwt" \
  --description "JWT secret" \
  --secret-string '{"secret":"your-jwt-secret"}'
```

#### Kubernetes Secrets

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: mon-appart
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  jwt-secret: <base64-encoded-jwt-secret>
  smtp-password: <base64-encoded-smtp-password>
```

#### Docker Secrets

```yaml
# docker-compose.prod.yml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt

services:
  api:
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
```

## 🛡️ Sécurité Production

### 1. Configuration Sécurisée

#### API Security Headers

```typescript
// apps/api/src/main.ts
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }))

  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  }))

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })

  await app.listen(4000)
}
```

#### Database Security

```sql
-- Create read-only user for monitoring
CREATE USER monitoring WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE appdb TO monitoring;
GRANT USAGE ON SCHEMA public TO monitoring;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring;

-- Create application user with limited privileges
CREATE USER app_user WITH PASSWORD 'secure_app_password';
GRANT CONNECT ON DATABASE appdb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_isolation ON users FOR ALL TO app_user
USING (id = current_setting('app.user_id')::int);
```

### 2. SSL/TLS Configuration

#### Let's Encrypt avec Certbot

```bash
#!/bin/bash
# scripts/setup-ssl.sh

# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### SSL Configuration Nginx

```nginx
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# Security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "no-referrer-when-downgrade";
```

## 📊 Monitoring

### 1. Application Monitoring

#### Health Checks

```typescript
// apps/api/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  @Get()
  async check(): Promise<HealthCheckResult> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.APP_VERSION
    }
  }

  @Get('db')
  async checkDatabase(): Promise<HealthCheckResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'ok', service: 'database' }
    } catch (error) {
      throw new ServiceUnavailableException('Database unavailable')
    }
  }

  @Get('redis')
  async checkRedis(): Promise<HealthCheckResult> {
    try {
      await this.redis.ping()
      return { status: 'ok', service: 'redis' }
    } catch (error) {
      throw new ServiceUnavailableException('Redis unavailable')
    }
  }
}
```

#### Prometheus Metrics

```typescript
// apps/api/src/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common'
import { register, Counter, Histogram } from 'prom-client'

@Injectable()
export class MetricsService {
  private readonly httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status']
  })

  private readonly httpDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route']
  })

  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequests.inc({ method, route, status })
    this.httpDuration.observe({ method, route }, duration / 1000)
  }

  getMetrics() {
    return register.metrics()
  }
}
```

### 2. Infrastructure Monitoring

#### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:4000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

#### Alert Rules

```yaml
# monitoring/alert_rules.yml
groups:
  - name: mon-appart-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"

      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 > 512
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}MB"
```

## 💾 Backup Stratégie

### 1. Backup Automatique

```bash
#!/bin/bash
# scripts/backup-production.sh

set -e

BACKUP_DIR="/backups/$(date +%Y/%m/%d)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="mon-appart-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "🗄️ Creating database backup..."
docker compose exec -T postgres pg_dump -U postgres appdb | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Files backup (uploads)
echo "📁 Creating files backup..."
tar -czf "$BACKUP_DIR/files_$TIMESTAMP.tar.gz" /opt/mon-appart/uploads/

# Upload to S3
echo "☁️ Uploading to S3..."
aws s3 cp "$BACKUP_DIR/" "s3://$S3_BUCKET/$(date +%Y/%m/%d)/" --recursive

# Cleanup local backups (keep 7 days)
find /backups -name "*.gz" -mtime +7 -delete

# Cleanup S3 backups (keep 30 days)
aws s3api list-objects-v2 \
  --bucket $S3_BUCKET \
  --query 'Contents[?LastModified<=`'$(date -d '30 days ago' --iso-8601)'`].[Key]' \
  --output text | xargs -I {} aws s3 rm s3://$S3_BUCKET/{}

echo "✅ Backup completed successfully"
```

### 2. Point-in-Time Recovery

```bash
#!/bin/bash
# scripts/restore-pit.sh

RESTORE_TIME=$1
BACKUP_FILE=$2

if [ -z "$RESTORE_TIME" ] || [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <restore_time> <backup_file>"
  echo "Example: $0 '2024-01-15 14:30:00' /backups/db_20240115_120000.sql.gz"
  exit 1
fi

echo "⚠️ Point-in-time restore to $RESTORE_TIME"
echo "⚠️ This will DESTROY current data!"
read -p "Continue? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Stop application
  docker compose stop api web
  
  # Restore database
  gunzip -c $BACKUP_FILE | docker compose exec -T postgres psql -U postgres -d appdb
  
  # Apply WAL files up to restore point (if using WAL archiving)
  # This requires WAL archiving to be configured
  
  # Restart application
  docker compose start api web
  
  echo "✅ Point-in-time restore completed"
fi
```

## 🚨 Disaster Recovery

### 1. Runbook

```markdown
# 🚨 Incident Response Runbook

## Severity Levels

### P0 - Critical (Complete Outage)
- **Response Time**: Immediate
- **Actions**: 
  1. Acknowledge incident
  2. Start war room
  3. Implement immediate mitigation
  4. Communicate to stakeholders

### P1 - High (Partial Outage)
- **Response Time**: 15 minutes
- **Actions**:
  1. Investigate root cause
  2. Implement fix
  3. Monitor for resolution

### P2 - Medium (Performance Degradation)
- **Response Time**: 1 hour
- **Actions**:
  1. Schedule fix
  2. Monitor metrics

## Common Scenarios

### Database Connection Issues
```bash
# Check database status
docker compose logs postgres

# Check connections
docker compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Restart database (last resort)
docker compose restart postgres
```

### High Memory Usage
```bash
# Check memory usage
docker stats

# Check for memory leaks
docker compose exec api node --inspect=0.0.0.0:9229 dist/main.js

# Scale up
docker compose up -d --scale api=3
```

### SSL Certificate Expiry
```bash
# Check certificate expiry
openssl x509 -in /etc/ssl/certs/fullchain.pem -text -noout | grep "Not After"

# Renew certificate
sudo certbot renew

# Reload nginx
docker compose exec nginx nginx -s reload
```
```

### 2. Failover Procedures

#### Database Failover

```bash
#!/bin/bash
# scripts/failover-db.sh

PRIMARY_HOST="db-primary.internal"
REPLICA_HOST="db-replica.internal"

echo "🚨 Starting database failover procedure"

# Check primary status
if ! pg_isready -h $PRIMARY_HOST; then
  echo "❌ Primary database is down, promoting replica"
  
  # Promote replica to primary
  ssh db-replica "sudo -u postgres /usr/pgsql-15/bin/pg_promote"
  
  # Update application configuration
  kubectl patch secret app-secrets -p='{"data":{"database-url":"'$(echo -n "postgresql://user:pass@$REPLICA_HOST:5432/appdb" | base64)'"}}'
  
  # Restart application pods
  kubectl rollout restart deployment/api
  
  echo "✅ Failover completed"
else
  echo "✅ Primary database is healthy, no action needed"
fi
```

#### Application Rollback

```bash
#!/bin/bash
# scripts/rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: $0 <previous_version>"
  exit 1
fi

echo "🔄 Rolling back to version $PREVIOUS_VERSION"

# Rollback containers
docker compose down
docker tag mon-appart-api:$PREVIOUS_VERSION mon-appart-api:latest
docker tag mon-appart-web:$PREVIOUS_VERSION mon-appart-web:latest
docker compose up -d

# Rollback database migrations (if needed)
# CAUTION: This may cause data loss
read -p "Rollback database migrations? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker compose exec api npx prisma migrate reset --force
fi

echo "✅ Rollback completed"
```

---

Cette documentation de déploiement couvre tous les aspects essentiels pour mettre en production votre application Mon-Appart de manière professionnelle et sécurisée.
