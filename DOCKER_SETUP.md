# Docker Setup Guide for D&D LazyDM with Authentication

This guide explains how to run the D&D LazyDM application with Docker, including the authentication system.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- Basic understanding of Docker commands

## Quick Start

### 1. Generate NextAuth Secret

First, you need to generate a secure secret for NextAuth JWT encryption:

```bash
# Using OpenSSL (Linux/Mac/WSL)
openssl rand -base64 32

# Using Node.js (Windows/Linux/Mac)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the generated string - you'll need it in the next step.

### 2. Set Environment Variables

Create a `.env` file in the project root:

```bash
# On Linux/Mac
cp .env.example .env

# On Windows
copy .env.example .env
```

Edit the `.env` file and set your NEXTAUTH_SECRET:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
```

**Important:** Replace `your-generated-secret-here` with the secret you generated in step 1.

### 3. Build and Run

```bash
# Build the Docker image
docker compose build

# Start the container
docker compose up -d

# View logs
docker compose logs -f
```

The application will be available at http://localhost:3000

### 4. Create Your First User

1. Navigate to http://localhost:3000/register
2. Fill in:
   - **Name:** Your display name
   - **Email:** Your email address
   - **Password:** At least 8 characters
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dashboard

## Data Persistence

The Docker setup includes volume mounts to persist your data:

```yaml
volumes:
  - ./src/app/campaigns:/app/src/app/campaigns  # Campaign content
  - ./public/campaigns:/app/public/campaigns    # Campaign images
  - ./src/data:/app/src/data                    # User data & VTT shares
```

### What Gets Persisted:

- **User accounts:** `src/data/users.json`
- **VTT shares:** `src/data/vtt-shares.json`
- **Campaign content:** `src/app/campaigns/[campaign-slug]/`
- **Campaign images:** `public/campaigns/[campaign-slug]/img/`

### Backup Your Data:

```bash
# Backup all user and campaign data
docker compose exec app tar -czf /tmp/backup.tar.gz /app/src/data /app/src/app/campaigns /app/public/campaigns

# Copy backup to host
docker compose cp app:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz
```

## Production Deployment

For production deployments, follow these additional steps:

### 1. Update Environment Variables

Edit your `.env` file or docker-compose.yml:

```env
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-very-long-random-secret
```

### 2. Use Docker Compose Override

Create `docker-compose.prod.yml`:

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=https://yourdomain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    # Add reverse proxy configuration
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dnd.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.dnd.tls=true"
      - "traefik.http.routers.dnd.tls.certresolver=letsencrypt"
```

Run with:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Security Checklist

- [ ] Use a strong, randomly generated NEXTAUTH_SECRET
- [ ] Set up HTTPS/SSL (use nginx, Caddy, or Traefik as reverse proxy)
- [ ] Configure firewall rules (only expose ports 80/443)
- [ ] Regular backups of `/app/src/data` directory
- [ ] Update Docker images regularly for security patches
- [ ] Consider using external Redis for rate limiting in multi-instance setups

## Troubleshooting

### Authentication Not Working

**Symptom:** Login/register buttons don't work, or you get "Unauthorized" errors.

**Solutions:**
1. Check that NEXTAUTH_SECRET is set:
   ```bash
   docker compose exec app printenv | grep NEXTAUTH
   ```

2. Verify the data directory exists and is writable:
   ```bash
   docker compose exec app ls -la /app/src/data
   ```

3. Check logs for errors:
   ```bash
   docker compose logs app | grep -i "auth\|error"
   ```

### Users.json Not Persisting

**Symptom:** Users disappear after container restart.

**Solution:** Ensure the volume mount is correct:
```bash
# Check volume mounts
docker compose exec app mount | grep /app/src/data

# Verify local directory exists
ls -la ./src/data
```

### Permission Issues

**Symptom:** "Permission denied" errors in logs.

**Solution:** Fix permissions on host:
```bash
# Linux/Mac
chmod -R 755 ./src/data

# Windows (run as Administrator)
icacls src\data /grant Users:F /T
```

### Rate Limiting Issues

**Symptom:** "Too many requests" errors immediately.

**Solution:** The rate limiter uses in-memory storage. Restarting the container clears limits:
```bash
docker compose restart app
```

## Upgrading

To upgrade to a new version:

```bash
# Pull latest code
git pull

# Rebuild image
docker compose build

# Restart container
docker compose up -d

# View logs to ensure successful startup
docker compose logs -f app
```

## Advanced Configuration

### Custom Port

Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Run on port 8080 instead of 3000
```

Update NEXTAUTH_URL:
```env
NEXTAUTH_URL=http://localhost:8080
```

### External Data Directory

Mount an external directory for data:
```yaml
volumes:
  - /path/to/external/data:/app/src/data
```

### Multi-Instance Deployment

For running multiple instances (load balancing), you need:

1. **Shared Storage:** Use NFS, S3, or similar for volumes
2. **External Redis:** Replace in-memory rate limiter with Redis
3. **Session Synchronization:** NextAuth JWT sessions work across instances

## Support

For issues or questions:
- Check the main README.md
- Review application logs: `docker compose logs -f app`
- File an issue on GitHub

## Security Notes

- **Never commit `.env` files** to version control
- **Rotate NEXTAUTH_SECRET** periodically in production
- **Use HTTPS** in production (never HTTP for auth)
- **Backup user data** regularly (users.json contains password hashes)
- **Monitor logs** for suspicious activity
