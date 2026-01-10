# InterfaceHive Deployment Guide

This guide explains how to deploy InterfaceHive to AWS EC2 using GitHub Actions.

## Prerequisites

1. **AWS EC2 Instance** (Amazon Linux 2 or Ubuntu)
   - Docker and Docker Compose installed
   - Port 80 (HTTP) open in security groups
   - SSH access configured

2. **Docker Hub Account**
   - Create a Docker Hub account at https://hub.docker.com
   - Create an access token for GitHub Actions

3. **GitHub Repository**
   - This repository with GitHub Actions enabled

## Required GitHub Secrets

Navigate to your repository → Settings → Secrets and variables → Actions, and add the following secrets:

### Docker Hub Configuration
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token (create at Docker Hub → Account Settings → Security)

### EC2 Server Configuration
- `EC2_HOST`: Public IP or domain of your EC2 instance (e.g., `54.123.45.67`)
- `EC2_SSH_KEY`: Private SSH key for EC2 access (entire content of your `.pem` file)

### Database Configuration
- `POSTGRES_PASSWORD`: Strong password for PostgreSQL database (generate a secure random password)

### Django Configuration
- `SECRET_KEY`: Django secret key (generate using Python: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts (e.g., `your-domain.com,www.your-domain.com,54.123.45.67`)

### Frontend Configuration
- `VITE_API_BASE_URL`: Backend API URL for the frontend (e.g., `http://your-domain.com` or `http://54.123.45.67`)

## EC2 Server Setup

### 1. Connect to your EC2 instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 2. Install Docker

```bash
# For Amazon Linux 2
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# For Ubuntu
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

### 3. Install Docker Compose

```bash
# Download latest version
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 4. Log out and log back in
This is necessary for group permissions to take effect.

```bash
exit
ssh -i your-key.pem ec2-user@your-ec2-ip
```

## Deployment Process

### Automatic Deployment (Recommended)

1. **Set up all GitHub Secrets** as described above
2. **Push to master branch**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin master
   ```
3. **Monitor deployment**:
   - Go to GitHub → Actions tab
   - Watch the deployment workflow progress
   - Check for any errors

### Manual Deployment (If needed)

If you need to deploy manually or troubleshoot:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Navigate to project directory
cd ~/InterfaceHive

# Pull latest code
git pull origin master

# Create .env file with your secrets
nano .env
# Add all the environment variables

# Pull latest Docker images
docker pull your-dockerhub-username/interfacehive-backend:latest
docker pull your-dockerhub-username/interfacehive-frontend:latest

# Stop and restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Check status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### Build Errors

If the Docker build fails:
1. Check GitHub Actions logs for specific error messages
2. Ensure all required files are committed (especially config files)
3. Verify Docker Hub credentials are correct

### Deployment Errors

If deployment to EC2 fails:
1. **Check SSH connection**: Ensure `EC2_SSH_KEY` secret is correct and complete
2. **Check file paths**: The `docker-compose.prod.yml` must exist in the repository
3. **Check branch name**: Ensure you're pushing to the `master` branch
4. **Check Docker installation**: SSH into EC2 and verify Docker is running: `docker ps`

### Container Issues

```bash
# View all containers
docker-compose -f docker-compose.prod.yml ps

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend

# Restart a specific service
docker-compose -f docker-compose.prod.yml restart backend

# Rebuild and restart everything
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Database Issues

```bash
# Access PostgreSQL directly
docker-compose -f docker-compose.prod.yml exec postgres psql -U interfacehive_user -d interfacehive

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U interfacehive_user interfacehive > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U interfacehive_user interfacehive < backup.sql
```

## Security Considerations

1. **Use strong passwords**: Generate secure random passwords for all credentials
2. **Limit SSH access**: Configure EC2 security groups to only allow SSH from trusted IPs
3. **Use HTTPS**: Set up SSL/TLS certificates (use Let's Encrypt with Nginx)
4. **Regular updates**: Keep Docker images and packages updated
5. **Monitor logs**: Regularly check application and system logs for issues
6. **Backup data**: Set up automated database backups

## Setting Up SSL/HTTPS (Recommended)

1. **Install Certbot on EC2**:
   ```bash
   sudo yum install -y certbot python3-certbot-nginx
   ```

2. **Get SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Update Nginx configuration** in `frontend/nginx.conf` to handle SSL

4. **Update `ALLOWED_HOSTS`** and `VITE_API_BASE_URL` to use HTTPS

## Monitoring

### View Real-time Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Check Resource Usage
```bash
docker stats
```

### Health Checks
The application should be accessible at:
- Frontend: `http://your-domain.com` or `http://your-ec2-ip`
- Backend API: `http://your-domain.com/api/` or `http://your-ec2-ip/api/`

## Support

If you encounter issues:
1. Check GitHub Actions logs for build/deployment errors
2. Check Docker logs on EC2 for runtime errors
3. Verify all GitHub Secrets are set correctly
4. Ensure EC2 security groups allow inbound traffic on port 80 (and 443 for HTTPS)

## Updates

To update the application:
1. Make code changes locally
2. Commit and push to `master` branch
3. GitHub Actions will automatically build and deploy

The deployment process includes:
- Building new Docker images
- Pushing to Docker Hub
- Pulling on EC2
- Running migrations
- Collecting static files
- Restarting services

