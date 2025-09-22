# Gestion Apparts - Studio Rental Platform

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Project Overview

This is a modern studio rental platform ("StudioRent") built as a monorepo with:
- **Next.js 15** web application (port 3000) for the frontend 
- **NestJS** REST API (port 4000) for the backend
- **PostgreSQL** database with **Prisma ORM**
- **TailwindCSS** for styling

## Working Effectively

### Bootstrap and Dependencies
Install dependencies for all parts of the monorepo:
- `npm install` (root dependencies)
- `cd apps/web && npm install` (web app dependencies) 
- `cd apps/api && npm install` (API dependencies)

### Database Setup
The application requires PostgreSQL. For development:
- `docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=gestion_apparts -p 5432:5432 -d postgres:15`
- Create `apps/api/.env` with: `DATABASE_URL="postgresql://postgres:password@localhost:5432/gestion_apparts?schema=public"`
- `cd apps/api && npm run prisma:generate` (generates Prisma client)
- `cd apps/api && npm run db:push` (pushes schema to database)
- `cd apps/api && npm run db:seed` (seeds test data)

**IMPORTANT**: Prisma requires internet access to download engines. In offline environments, database operations will fail.

### Build Commands
- **Web App**: `cd apps/web && npm run build` -- takes ~20 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
- **API**: `cd apps/api && npm run build` -- takes ~3 seconds. NEVER CANCEL. Set timeout to 30+ seconds.

### Development Servers
- **Web**: `cd apps/web && npm run dev` (starts on http://localhost:3000)
- **API**: `cd apps/api && npm run start:dev` (starts on http://localhost:4000)
- **Database UI**: Prisma Studio on http://localhost:5555 (if available)

### Testing
- **API Tests**: `cd apps/api && npm run test` -- takes ~1 second. Basic NestJS tests available.
- **Linting**: ESLint configurations are missing/outdated. Linting currently fails due to configuration issues.

## Configuration Fixes Applied

### TailwindCSS Configuration
- Updated `apps/web/postcss.config.js` to use `@tailwindcss/postcss` instead of `tailwindcss`
- This resolves PostCSS plugin compatibility issues with TailwindCSS v4

### Font Loading for Offline Environments
- Removed Google Fonts imports from `apps/web/src/app/layout.tsx` 
- Modified to use system fonts instead of external font loading
- This prevents build failures in network-restricted environments

## Validation Scenarios

### Manual Testing Workflows
1. **Homepage Validation**: Navigate to http://localhost:3000 and verify the StudioRent landing page loads with hero section, testimonials, and features
2. **Component Testing**: Visit http://localhost:3000/test-simple and http://localhost:3000/test-card to see studio card components in various states
3. **API Integration**: The properties page (http://localhost:3000/properties) will show connection errors if the API is not running
4. **Database Dependency**: Most dynamic features require database connectivity via Prisma

### Expected Behavior
- **WITH API + Database**: Full functionality including property listings, user authentication, bookings
- **WITHOUT API**: Static pages work (homepage, test pages), but properties/auth pages show connection errors
- **Image Loading**: External Unsplash images may fail to load in restricted environments

## Project Structure

### Key Directories
- `apps/web/` - Next.js 15 frontend application
- `apps/api/` - NestJS backend API with authentication and studios modules  
- `apps/api/prisma/` - Database schema, migrations, and seed data
- `apps/web/src/app/` - Next.js App Router pages and layouts
- `apps/web/src/components/` - Reusable React components

### Main Features Implemented
- Studio listing and browsing with rich property cards
- User authentication system (JWT-based)
- Property management for owners
- Booking system with payments integration
- Responsive design with modern UI/UX

## Development Notes

### Network Dependencies
- **Google Fonts**: Removed due to network restrictions
- **Unsplash Images**: May fail to load in restricted environments  
- **Prisma Engines**: Require internet access for initial download
- **Package Installs**: Work normally with npm registry access

### Known Limitations in Restricted Environments
- Database operations fail without Prisma engine downloads
- Some external images don't load
- ESLint configuration needs updating for v9 compatibility

### Build Performance
- Web build: ~20 seconds (includes TypeScript compilation, optimization)
- API build: ~3 seconds (NestJS compilation)
- Tests: ~1 second (minimal test suite currently)

### Ports and Services
- **3000**: Next.js development server
- **4000**: NestJS API server
- **5432**: PostgreSQL database
- **5555**: Prisma Studio (database UI)

## Common Commands Reference

```bash
# Full development setup
npm install
cd apps/web && npm install && cd ../api && npm install && cd ../..

# Start services
cd apps/web && npm run dev &
cd apps/api && npm run start:dev &

# Build everything 
cd apps/web && npm run build
cd apps/api && npm run build

# Run tests
cd apps/api && npm run test

# Database operations (requires network)
cd apps/api && npm run prisma:generate
cd apps/api && npm run db:push  
cd apps/api && npm run db:seed
```

Always ensure PostgreSQL is running before starting the API. In environments with network restrictions, focus on frontend development and testing with static data.