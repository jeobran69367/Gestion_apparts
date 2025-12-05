# Deployment Checklist

## ✅ Pre-Deployment Checklist

### Environment Variables Setup

#### API (.env in apps/api/)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Secret key for JWT tokens (generate a secure random string)
- [ ] `FRONTEND_URL` - Frontend URL for CORS (e.g., https://yourapp.vercel.app)
- [ ] `PORT` - API port (default: 4000)
- [ ] `NODE_ENV` - Set to "production"

#### Web (.env in apps/web/)
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., https://your-api.railway.app/api)
- [ ] `PAWAPAY_API_KEY` - PawaPay API key for payments

### Code Preparation
- [ ] All environment variables are using `.env.example` templates
- [ ] CORS is configured to accept production frontend URL
- [ ] Database migrations are ready
- [ ] All dependencies are listed in package.json

## 🚀 Deployment Options

### Option 1: Docker Compose (Local/VPS)
1. [ ] Install Docker and Docker Compose
2. [ ] Clone repository
3. [ ] Create .env files from .env.example
4. [ ] Run: `docker-compose up -d`
5. [ ] Check logs: `docker-compose logs -f`
6. [ ] Access: http://localhost:3000

### Option 2: Railway (API + Database)
1. [ ] Create Railway account
2. [ ] Create new project
3. [ ] Add PostgreSQL from marketplace
4. [ ] Deploy API service from GitHub
5. [ ] Select `apps/api` directory
6. [ ] Configure environment variables
7. [ ] Note the API URL (e.g., https://xxx.railway.app)

### Option 3: Render (Full Stack)
1. [ ] Create Render account
2. [ ] Import repository
3. [ ] Render will use render.yaml for configuration
4. [ ] Or manually create:
   - [ ] PostgreSQL database
   - [ ] Web service for API
   - [ ] Web service for frontend (optional)
5. [ ] Configure environment variables
6. [ ] Deploy

### Option 4: Vercel (Frontend Only)
1. [ ] Create Vercel account
2. [ ] Import project from GitHub
3. [ ] Set root directory to `apps/web`
4. [ ] Configure environment variables:
   - [ ] `NEXT_PUBLIC_API_URL`
   - [ ] `PAWAPAY_API_KEY`
5. [ ] Deploy
6. [ ] Update API's `FRONTEND_URL` with Vercel URL

## 🔄 Post-Deployment

### API (Backend)
- [ ] Verify API is running: `https://your-api-url.com/api`
- [ ] Check database connection
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Test authentication endpoints
- [ ] Verify CORS is working

### Web (Frontend)
- [ ] Verify frontend loads
- [ ] Test API connectivity
- [ ] Check console for errors
- [ ] Test payment flow
- [ ] Verify images load correctly

### Database
- [ ] Migrations applied successfully
- [ ] Seed data loaded (if needed)
- [ ] Backup strategy in place

## 🔍 Testing

- [ ] Test user registration
- [ ] Test user login
- [ ] Test studio creation
- [ ] Test reservation flow
- [ ] Test payment processing
- [ ] Test email notifications (if configured)

## 📝 Documentation Updates

- [ ] Update frontend URL in API environment
- [ ] Update API URL in frontend environment
- [ ] Document production URLs
- [ ] Share credentials securely with team

## 🆘 Troubleshooting

### Common Issues

**API not starting:**
- Check DATABASE_URL is correct
- Verify JWT_SECRET is set
- Check logs for migration errors

**CORS errors:**
- Verify FRONTEND_URL matches exactly
- Include protocol (http:// or https://)
- No trailing slash in URLs

**Database connection fails:**
- Check DATABASE_URL format
- Verify database service is running
- Check network/firewall rules

**Frontend can't reach API:**
- Verify NEXT_PUBLIC_API_URL is correct
- Check API is publicly accessible
- Verify API CORS settings

## 🎉 Deployment Complete!

Once all items are checked:
1. Monitor logs for first few hours
2. Set up monitoring/alerting
3. Configure automated backups
4. Document any custom configurations
5. Share access with team members
