# Production Deployment Guide

## ⚠️ CRITICAL: Security Requirements

**DO NOT deploy this application to production without implementing the security measures outlined in `PRODUCTION_AUDIT.md`.**

The current codebase has **17 critical security vulnerabilities** that MUST be addressed first.

---

## Prerequisites

Before deploying, you MUST:

1. ✅ Implement authentication (NextAuth.js recommended)
2. ✅ Add input validation to all API endpoints
3. ✅ Sanitize all file paths (use `src/lib/utils/sanitize.ts`)
4. ✅ Add rate limiting
5. ✅ Configure environment variables securely
6. ✅ Set up error tracking (Sentry recommended)
7. ✅ Configure HTTPS/SSL
8. ✅ Review and fix all items in `PRODUCTION_AUDIT.md`

---

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Authentication (NextAuth.js - REQUIRED before production!)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# D&D Beyond Integration (Optional)
DNDBEYOND_COBALT_SESSION=<your-cobalt-session-cookie>

# Error Tracking (Recommended)
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>

# Rate Limiting (Recommended - Upstash Redis)
UPSTASH_REDIS_REST_URL=<your-upstash-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
```

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate strong passwords
openssl rand -hex 32
```

---

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Pros:**
- Zero configuration for Next.js
- Automatic HTTPS
- Global CDN
- Built-in analytics
- Easy rollbacks

**Cons:**
- Requires implementing authentication
- No built-in rate limiting (need external service)

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.production`
   - Mark sensitive variables as "Sensitive"

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Custom Domain** (Optional)
   - Vercel dashboard → Domains
   - Add your domain
   - Update DNS records

---

### Option 2: Docker + VPS (DigitalOcean, AWS, etc.)

**Pros:**
- Full control over infrastructure
- Can run on any cloud provider
- Portable deployment

**Cons:**
- Manual HTTPS configuration required
- More maintenance
- Need to set up monitoring

#### Steps:

1. **Update Docker Configuration**

   Edit `Dockerfile` to include health checks:
   ```dockerfile
   # Add after EXPOSE 3000
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
   ```

2. **Build Docker Image**
   ```bash
   docker build -t dnd-lazydm:latest .
   ```

3. **Run with Docker Compose**

   Create `docker-compose.prod.yml`:
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - NEXTAUTH_URL=${NEXTAUTH_URL}
         - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
       env_file:
         - .env.production
       restart: unless-stopped
       healthcheck:
         test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
         interval: 30s
         timeout: 3s
         retries: 3
       volumes:
         - ./src/app/campaigns:/app/src/app/campaigns
         - ./public/campaigns:/app/public/campaigns

     # Nginx reverse proxy (for HTTPS)
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./ssl:/etc/nginx/ssl
       depends_on:
         - app
       restart: unless-stopped
   ```

4. **Configure Nginx** (for HTTPS)

   Create `nginx.conf`:
   ```nginx
   events {
     worker_connections 1024;
   }

   http {
     upstream app {
       server app:3000;
     }

     server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
     }

     server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/nginx/ssl/cert.pem;
       ssl_certificate_key /etc/nginx/ssl/key.pem;

       location / {
         proxy_pass http://app;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
       }
     }
   }
   ```

5. **Get SSL Certificate**
   ```bash
   # Using Let's Encrypt (free)
   sudo apt-get install certbot
   sudo certbot certonly --standalone -d yourdomain.com
   ```

6. **Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

### Option 3: Railway / Render

Similar to Vercel, these platforms offer easy Next.js deployment:

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Render:**
- Connect GitHub repository
- Set environment variables in dashboard
- Auto-deploys on push to main

---

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled and forced
- [ ] Authentication implemented and tested
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Secrets rotated (database passwords, API keys)
- [ ] .env files not committed to git

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Log aggregation (Logtail, Papertrail)
- [ ] Performance monitoring (Vercel Analytics, New Relic)

### Performance
- [ ] Images optimized
- [ ] CDN configured
- [ ] Database indexes created
- [ ] Caching configured (Redis recommended)

### Backups
- [ ] Campaign data backed up regularly
- [ ] Database backups automated
- [ ] Backup restoration tested

### DNS & Domain
- [ ] Domain configured
- [ ] DNS propagated
- [ ] Email forwarding configured (if needed)

---

## Health Checks

Your application includes a health check endpoint:

```bash
curl https://yourdomain.com/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-19T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

Use this endpoint for:
- Load balancer health checks
- Uptime monitoring
- Deployment verification

---

## Monitoring & Alerts

### Set up Sentry (Error Tracking)

1. Install Sentry:
   ```bash
   npm install @sentry/nextjs
   ```

2. Initialize:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. Configure in `.env.production`:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
   ```

### Set up Uptime Monitoring

**Free Options:**
- UptimeRobot (free tier: 50 monitors)
- Pingdom (free tier available)
- Better Uptime

Configure to ping `/api/health` every 5 minutes.

---

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Docker
```bash
# Stop current deployment
docker-compose down

# Start previous version
docker-compose up -d dnd-lazydm:previous-tag
```

---

## Scaling Considerations

When you start getting traffic:

1. **Database**: Move from file-based storage to PostgreSQL
2. **Caching**: Add Redis for session storage
3. **CDN**: Use Cloudflare or Vercel's CDN
4. **Load Balancer**: Add for multiple instances
5. **Queue System**: For background jobs (PDF processing)

---

## Common Issues

### Issue: Port 3000 already in use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Issue: Docker build fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t dnd-lazydm:latest .
```

### Issue: Environment variables not loading
- Check `.env.production` exists
- Verify no typos in variable names
- Restart the application
- Check quotes around values with special characters

---

## Support

If you encounter issues:

1. Check the health endpoint: `/api/health`
2. Review application logs
3. Check error tracking (Sentry)
4. Review `PRODUCTION_AUDIT.md` for security issues
5. Create an issue on GitHub

---

## Next Steps After Deployment

1. Set up continuous integration (GitHub Actions)
2. Implement automated tests
3. Configure staging environment
4. Set up database migrations
5. Create runbook for common operations

---

**Remember: Do not skip the security measures outlined in `PRODUCTION_AUDIT.md`. Your users' data depends on it!**
