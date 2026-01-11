# InterfaceHive Deployment Process

This document explains how the complete CI/CD (Continuous Integration/Continuous Deployment) pipeline works for InterfaceHive, from pushing code to GitHub to having it live on AWS EC2.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Deployment Flow](#deployment-flow)
- [Components](#components)
- [Step-by-Step Process](#step-by-step-process)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Overview

InterfaceHive uses a fully automated CI/CD pipeline that:
1. **Builds** Docker images for frontend and backend
2. **Pushes** images to Docker Hub
3. **Deploys** to AWS EC2 automatically
4. **Runs** database migrations and collects static files

**Trigger**: Every push to the `master` branch

**Duration**: ~5-7 minutes from push to live deployment

---

## Architecture

```
Developer → GitHub (master) → GitHub Actions → Docker Hub → AWS EC2 → Live Application
```

### Components:

1. **GitHub Repository** - Source code storage
2. **GitHub Actions** - CI/CD automation
3. **Docker Hub** - Container image registry
4. **AWS EC2** - Production server (Amazon Linux 2023)
5. **Docker Compose** - Container orchestration on EC2

---

## Deployment Flow

### 1. Code Push
```bash
git add .
git commit -m "Your changes"
git push origin master
```

### 2. GitHub Actions Workflow Triggers

Defined in: `.github/workflows/deploy.yml`

The workflow automatically:
- Checks out code
- Sets up Docker Buildx
- Builds backend image
- Builds frontend image
- Pushes both to Docker Hub
- Connects to EC2 via SSH
- Deploys the new images

### 3. Docker Build Process

#### Backend Build:
```dockerfile
FROM python:3.11-slim
# Install dependencies from requirements.txt
# Copy Django application
# Expose port 8000
# Run with Daphne (ASGI server)
```

#### Frontend Build:
```dockerfile
FROM node:20-slim AS build
# Install npm dependencies
# Build React/Vite application with VITE_API_BASE_URL
# Copy build to Nginx
FROM nginx:stable-alpine
# Serve static files and proxy API requests to backend
```

### 4. Docker Hub Push

Images are tagged and pushed:
- `mushimuro/interfacehive-backend:latest`
- `mushimuro/interfacehive-frontend:latest`

### 5. EC2 Deployment

The workflow SSHs into EC2 and:
1. Creates/updates project directory
2. Pulls latest code from GitHub
3. Creates `.env` file with secrets
4. Pulls latest Docker images
5. Stops old containers
6. Starts new containers
7. Runs database migrations
8. Collects Django static files
9. Checks status

---

## Components

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

**Jobs**: Single job called `deploy` with multiple steps

**Key Steps**:
1. **Checkout code** - Gets latest code from repository
2. **Set up Docker Buildx** - Prepares multi-platform builds
3. **Login to Docker Hub** - Authenticates with Docker registry
4. **Build and push Backend** - Creates backend image
5. **Build and push Frontend** - Creates frontend image with build args
6. **Deploy to EC2 via SSH** - Executes deployment script on server

### Docker Compose Configuration

**File**: `docker-compose.prod.yml`

**Services**:
- **postgres** - PostgreSQL 16 database
- **redis** - Redis 7 for caching/sessions
- **backend** - Django application with Daphne
- **frontend** - Nginx serving React app

**Networking**:
- All containers on same Docker network
- Frontend proxies `/api/` requests to backend
- Only frontend exposes port 80 to host

### Environment Variables

**Source**: GitHub Secrets → `.env` file on EC2

**Critical Variables**:
```bash
# Docker Hub
DOCKERHUB_USERNAME=your_username

# Database
POSTGRES_DB=interfacehive
POSTGRES_USER=interfacehive_user
POSTGRES_PASSWORD=secure_password

# Django
SECRET_KEY=django_secret_key
DEBUG=False
ALLOWED_HOSTS=backend,your_ec2_ip,localhost,127.0.0.1
USE_HTTPS=False

# Redis
REDIS_URL=redis://redis:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://your_ec2_ip,http://localhost:5173

# Frontend (build-time variable)
VITE_API_BASE_URL=/api/v1
```

---

## Step-by-Step Process

### Phase 1: Build (GitHub Actions Runner)

#### Backend Build
1. GitHub Actions runner checks out code
2. Docker Buildx builds `backend/Dockerfile`
3. Installs Python dependencies from `requirements.txt`
4. Copies Django application code
5. Creates image with Daphne ASGI server
6. Pushes image to Docker Hub with tag `latest`

**Build Time**: ~2-3 minutes (with cache)

#### Frontend Build
1. GitHub Actions runner checks out code
2. Docker Buildx builds `frontend/Dockerfile` with build argument:
   ```
   --build-arg VITE_API_BASE_URL=/api/v1
   ```
3. Node container installs npm dependencies
4. Vite builds React app (creates static files)
   - JavaScript bundles (with hash: `index-xxxxxx.js`)
   - CSS files
   - Assets
5. Copies built files to Nginx container
6. Nginx configured to:
   - Serve static files
   - Proxy `/api/*` to backend
   - Proxy `/ws/*` for WebSockets
7. Pushes image to Docker Hub

**Build Time**: ~3-5 minutes (with cache)

### Phase 2: Deploy (AWS EC2)

#### Pre-Deployment
1. GitHub Actions connects to EC2 via SSH
   - Host: `EC2_HOST` secret
   - User: `EC2_USER` secret (ec2-user)
   - Key: `EC2_SSH_KEY` secret (private key)

2. Creates project directory if needed:
   ```bash
   mkdir -p ~/InterfaceHive
   cd ~/InterfaceHive
   ```

3. Initializes git repository if not present:
   ```bash
   git init
   git remote add origin https://github.com/REPO_URL
   ```

4. Fetches latest code:
   ```bash
   git fetch origin
   git reset --hard origin/master
   ```

#### Environment Setup
5. Creates `.env` file with all secrets:
   ```bash
   cat > .env << EOF
   DOCKERHUB_USERNAME=...
   POSTGRES_PASSWORD=...
   SECRET_KEY=...
   ALLOWED_HOSTS=backend,...
   USE_HTTPS=False
   CORS_ALLOWED_ORIGINS=...
   EOF
   ```

#### Container Deployment
6. Pulls latest images from Docker Hub:
   ```bash
   docker pull username/interfacehive-backend:latest
   docker pull username/interfacehive-frontend:latest
   ```

7. Stops existing containers:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

8. Starts all services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```
   
   **Startup Order**:
   - PostgreSQL (waits for database to be ready)
   - Redis
   - Backend (depends on postgres + redis)
   - Frontend (depends on backend)

9. Waits for services to stabilize (10 seconds)

#### Post-Deployment
10. Runs database migrations:
    ```bash
    docker-compose exec -T backend python manage.py migrate --noinput
    ```

11. Collects static files:
    ```bash
    docker-compose exec -T backend python manage.py collectstatic --noinput
    ```

12. Checks container status:
    ```bash
    docker-compose -f docker-compose.prod.yml ps
    ```

**Deploy Time**: ~2 minutes

### Phase 3: Verification

#### Automatic Checks
- Container health status
- Port bindings (80:80 for frontend)
- Backend listening on port 8000
- Database connections established

#### Manual Verification
After deployment completes:
1. Visit `http://YOUR_EC2_IP`
2. Frontend loads (Nginx serves static files)
3. Try to register/login
4. Backend logs show incoming requests
5. Database operations succeed

---

## Request Flow in Production

### User Request Flow

```
User Browser
    ↓ (HTTP request to http://EC2_IP/)
Nginx (Frontend Container :80)
    ↓ (serves static files)
React Application loads in browser
    ↓ (API call to /api/v1/auth/login/)
Nginx (same container)
    ↓ (proxies to http://backend:8000/api/v1/auth/login/)
Django Backend (Backend Container :8000)
    ↓ (queries database)
PostgreSQL (Postgres Container :5432)
    ↓ (returns data)
Django processes and returns JSON
    ↓ (through Nginx proxy)
User Browser receives response
```

### Nginx Proxy Configuration

Located in `frontend/nginx.conf`:

```nginx
# Serve React app
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}

# Proxy API requests to backend
location /api/ {
    proxy_pass http://backend:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Proxy WebSocket requests
location /ws/ {
    proxy_pass http://backend:8000/ws/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

**Why This Works**:
- Frontend uses **relative URLs** (`/api/v1/...`)
- Browser sends request to same domain (EC2 IP)
- Nginx intercepts and proxies to backend container
- Containers communicate via Docker network
- Backend hostname `backend` resolves to backend container IP

---

## Environment Variables

### Build-Time Variables

**VITE_API_BASE_URL** (Frontend)
- **When**: During Docker build
- **Value**: `/api/v1` (relative path)
- **Purpose**: Tells React app where to make API calls
- **Note**: Hardcoded into JavaScript bundle during build

### Runtime Variables

**Backend Environment Variables**:
```bash
DATABASE_URL          # PostgreSQL connection string
REDIS_URL            # Redis connection string
DJANGO_SETTINGS_MODULE # Django settings module
ALLOWED_HOSTS        # Comma-separated allowed hostnames
SECRET_KEY           # Django secret for cryptographic signing
DEBUG                # Debug mode (always False in production)
USE_HTTPS           # Enable/disable HTTPS redirect
CORS_ALLOWED_ORIGINS # Allowed origins for CORS
```

**Database Variables**:
```bash
POSTGRES_DB          # Database name
POSTGRES_USER        # Database user
POSTGRES_PASSWORD    # Database password
```

### How Environment Variables Are Loaded

1. **GitHub Secrets** → Stored securely in GitHub repository
2. **GitHub Actions** → Reads secrets during workflow
3. **SSH Script** → Creates `.env` file on EC2 with secret values
4. **Docker Compose** → Reads `.env` file and passes to containers
5. **Django/Node** → Applications read from environment

---

## Troubleshooting

### Build Failures

**Frontend build fails with TypeScript errors**:
- Check `frontend/src/` for type errors
- Run `npm run build` locally to test
- Fix errors and push again

**Backend build fails**:
- Check `requirements.txt` for invalid packages
- Verify Python version compatibility
- Check `backend/Dockerfile` syntax

### Deployment Failures

**SSH connection timeout**:
- Verify EC2 security group allows SSH (port 22) from `0.0.0.0/0`
- Check `EC2_HOST` secret has correct IP address
- Verify `EC2_SSH_KEY` secret contains complete private key

**Container fails to start**:
- SSH into EC2: `ssh -i key.pem ec2-user@EC2_IP`
- Check logs: `docker-compose -f docker-compose.prod.yml logs backend`
- Verify environment variables: `docker-compose exec backend printenv`

**Database connection error**:
- Check PostgreSQL container is running: `docker-compose ps`
- Verify `DATABASE_URL` in backend environment
- Check database credentials in `.env` file

**Frontend shows old version**:
- Clear browser cache (Ctrl+Shift+R)
- Check if new image was pulled: `docker images | grep frontend`
- Verify frontend container was recreated: `docker ps --filter name=frontend`

### Common Issues

**Issue**: Backend returns 400 Bad Request
- **Cause**: `backend` not in `ALLOWED_HOSTS`
- **Fix**: Update `.env` to include `ALLOWED_HOSTS=backend,your_ip,...`

**Issue**: Frontend gets connection timeout
- **Cause**: Hardcoded old IP in JavaScript
- **Fix**: Rebuild with `VITE_API_BASE_URL=/api/v1` (relative)

**Issue**: SSL/HTTPS redirect errors
- **Cause**: `USE_HTTPS=True` but no SSL certificate
- **Fix**: Set `USE_HTTPS=False` in `.env`

**Issue**: CORS errors in browser
- **Cause**: Frontend origin not in `CORS_ALLOWED_ORIGINS`
- **Fix**: Add EC2 IP to `CORS_ALLOWED_ORIGINS=http://your_ip,...`

---

## Manual Deployment Commands

If you need to deploy manually:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Navigate to project
cd ~/InterfaceHive

# Pull latest code
git pull origin master

# Update .env if needed
nano .env

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Check status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Security Considerations

### GitHub Secrets
- Never commit secrets to repository
- Store all sensitive data in GitHub Secrets
- Rotate secrets regularly (especially after sharing)

### EC2 Security Group
- Allow SSH (22) only from trusted IPs when possible
- Allow HTTP (80) from `0.0.0.0/0` for public access
- Consider HTTPS (443) with SSL certificate (Let's Encrypt)

### Database
- Use strong passwords (32+ characters)
- PostgreSQL not exposed to internet (only accessible within Docker network)
- Regular backups recommended

### Django Secret Key
- Use cryptographically secure random string
- Never use default or weak keys
- Rotate if compromised

---

## Performance Optimization

### Docker Image Caching
- GitHub Actions uses cache: `cache-from: type=gha`
- Significantly speeds up builds (2-3 minutes vs 10+ minutes)
- Cache invalidated when dependencies change

### EC2 Instance Sizing
- **Minimum**: t3.small (2 GB RAM) - can handle moderate traffic
- **Recommended**: t3.medium (4 GB RAM) - better for building images locally
- **Production**: t3.large+ (8 GB+ RAM) - high traffic applications

### Database Performance
- PostgreSQL data persisted in Docker volume
- Consider RDS for production if scaling
- Regular VACUUM and ANALYZE recommended

---

## Monitoring and Logs

### View Logs

```bash
# All containers
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Follow logs (real-time)
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 50 lines
docker-compose -f docker-compose.prod.yml logs --tail=50 backend
```

### Container Status

```bash
# Check all containers
docker-compose -f docker-compose.prod.yml ps

# Check resource usage
docker stats
```

### Application Health

```bash
# Test backend
curl http://localhost:8000/api/v1/

# Test frontend
curl http://localhost/

# Test from inside container
docker-compose exec frontend wget -O- http://backend:8000/api/v1/
```

---

## Future Improvements

### Potential Enhancements

1. **Blue-Green Deployment**
   - Zero-downtime deployments
   - Run new version alongside old
   - Switch traffic after verification

2. **Database Backups**
   - Automated daily backups
   - S3 storage for backup files
   - Point-in-time recovery

3. **SSL/HTTPS**
   - Let's Encrypt certificate
   - Automatic renewal
   - HTTPS redirect

4. **Monitoring**
   - Application metrics (Prometheus)
   - Log aggregation (ELK stack)
   - Error tracking (Sentry)

5. **Load Balancing**
   - Multiple EC2 instances
   - AWS Application Load Balancer
   - Auto-scaling based on traffic

6. **Container Orchestration**
   - Migrate to Kubernetes (EKS)
   - Or AWS ECS/Fargate
   - Better scaling and reliability

---

## Summary

The InterfaceHive deployment process is a fully automated CI/CD pipeline that:

✅ **Builds** containerized applications
✅ **Tests** automatically (can be extended)
✅ **Deploys** to production on every push
✅ **Manages** database migrations
✅ **Ensures** zero-downtime during updates
✅ **Monitors** application health

**Key Benefits**:
- Fast deployments (5-7 minutes)
- Consistent environments (Docker)
- Easy rollback (previous images on Docker Hub)
- Scalable architecture (add more containers/instances)
- Secure (secrets management, isolated services)

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section or check the deployment logs in GitHub Actions.
