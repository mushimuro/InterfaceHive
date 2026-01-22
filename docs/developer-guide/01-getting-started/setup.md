# Setup Guide

This guide will walk you through setting up the InterfaceHive development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.12.9** - Backend runtime
- **Node.js 18+** and **npm** - Frontend package manager
- **Docker** and **Docker Compose** - For PostgreSQL and Redis
- **Git** - Version control

### Version Check

```bash
python --version  # Should be 3.12.9
node --version    # Should be v18.x or higher
npm --version     # Should be 9.x or higher
docker --version  # Should be 20.x or higher
git --version     # Should be 2.x or higher
```

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd InterfaceHive
```

### 2. Start Docker Services

Start PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL 16** on port 5432
- **Redis 7** on port 6379

**Verify services are running:**

```bash
docker-compose ps
```

Expected output:
```
NAME                  COMMAND                  SERVICE             STATUS
interfacehive-db-1    "docker-entrypoint.s…"   db                  running
interfacehive-redis-1 "docker-entrypoint.s…"   redis               running
```

**Wait for PostgreSQL to initialize:**

PostgreSQL may take 10-30 seconds to fully initialize on first run. Check logs:

```bash
docker-compose logs db
```

Look for: `database system is ready to accept connections`

### 3. Backend Setup

#### Create Virtual Environment

```bash
cd backend
python -m venv venv
```

#### Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

#### Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs:
- Django 5.0.1
- Django REST Framework 3.14
- djangorestframework-simplejwt (JWT auth)
- psycopg2-binary (PostgreSQL adapter)
- celery 5.3 (async tasks)
- redis 7 (cache and broker)
- channels 4.0 (WebSocket)
- daphne (ASGI server)
- And many more...

**Common Installation Issues:**

| Issue | Solution |
|-------|----------|
| `psycopg2` build fails | Install PostgreSQL dev headers: `brew install postgresql` (macOS) or `apt-get install libpq-dev` (Ubuntu) |
| `pip` command not found | Ensure virtual environment is activated |
| Permission denied | Don't use `sudo` with pip inside virtualenv |

#### Create Environment File

```bash
cp .env.example .env
```

**Edit `.env` with your configuration:**

```env
# Core Settings
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (matches docker-compose.yml)
DATABASE_URL=postgresql://interfacehive_user:interfacehive_dev_password@localhost:5432/interfacehive

# Redis (matches docker-compose.yml)
REDIS_URL=redis://localhost:6379/0

# CORS (Frontend URL)
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Email (Development - console backend)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@interfacehive.local

# AI Integration (Optional - for AI project generation)
GOOGLE_API_KEY=your-google-gemini-api-key

# Security (Development only)
CSRF_TRUSTED_ORIGINS=http://localhost:5173
```

**Important Notes:**

- `SECRET_KEY`: Generate a new one using `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `DATABASE_URL`: Must match credentials in `docker-compose.yml`
- `GOOGLE_API_KEY`: Optional for now, needed only for AI features
- `EMAIL_BACKEND`: Uses console for development, no SMTP needed

#### Run Database Migrations

```bash
python manage.py migrate
```

This creates all necessary database tables. Expected output:
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying users.0001_initial... OK
  Applying projects.0001_initial... OK
  ...
```

**If migrations fail:**

1. Check Docker services are running
2. Verify `DATABASE_URL` in `.env` matches `docker-compose.yml`
3. Test database connection: `python manage.py dbshell`

#### Create Superuser

```bash
python manage.py createsuperuser
```

Enter:
- Username: `admin`
- Email: `admin@interfacehive.local`
- Password: Choose a secure password

This account lets you access the Django admin panel at http://localhost:8000/admin/

#### Seed Initial Data

```bash
# Seed badge system (10 milestone badges)
python manage.py seed_badges
```

#### Start Development Server

```bash
python manage.py runserver
```

Backend is now running at: **http://localhost:8000**

Test it: http://localhost:8000/api/v1/

Expected response:
```json
{
  "message": "InterfaceHive API v1"
}
```

### 4. Frontend Setup

**Open a new terminal** (keep backend running).

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

This installs:
- React 19
- TypeScript 5.9
- Vite 7.2
- TanStack Query 5.90
- React Router v7
- shadcn/ui components
- And many more...

**Common Installation Issues:**

| Issue | Solution |
|-------|----------|
| `npm` command not found | Install Node.js from https://nodejs.org/ |
| `EACCES` permission error | Don't use `sudo` with npm. Fix: `sudo chown -R $USER ~/.npm` |
| Package conflicts | Delete `node_modules` and `package-lock.json`, then `npm install` again |

#### Create Environment File

```bash
cp .env.example .env
```

**Edit `.env`:**

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

This tells the frontend where to find the backend API.

#### Start Development Server

```bash
npm run dev
```

Frontend is now running at: **http://localhost:5173**

Open in browser: http://localhost:5173

You should see the InterfaceHive landing page.

### 5. Start Celery Worker (Optional for Async Tasks)

**Open a new terminal:**

```bash
cd backend
source venv/bin/activate  # Activate virtualenv
celery -A config worker -l info
```

Celery handles:
- Email sending
- Notification processing
- Badge progress updates

**For development, you can skip this step** if you're not testing emails or notifications.

### 6. Create Test Data

#### Option A: Django Shell (Recommended)

```bash
python manage.py shell
```

```python
from apps.users.models import User
from apps.projects.models import Project

# Create test contributor
contributor = User.objects.create_user(
    username='contributor',
    email='contributor@test.com',
    display_name='Test Contributor',
    password='testpass123',
    email_verified=True  # Skip email verification
)

# Create test host
host = User.objects.create_user(
    username='host',
    email='host@test.com',
    display_name='Test Host',
    password='testpass123',
    email_verified=True
)

# Create test project
project = Project.objects.create(
    title='Build a React Component Library',
    description='Need help building reusable React components with TypeScript.',
    what_it_does='A collection of accessible UI components',
    desired_outputs='Documented components with Storybook examples',
    tags=['react', 'typescript', 'ui'],
    difficulty='intermediate',
    estimated_hours=20,
    usage_type='practice',
    host_user=host,
    status='open'
)

print(f"✅ Created users and project")
print(f"Contributor: {contributor.email} / testpass123")
print(f"Host: {host.email} / testpass123")
print(f"Project: {project.title}")
```

#### Option B: Admin Panel

1. Go to http://localhost:8000/admin/
2. Login with superuser credentials
3. Create users in **Users** section
4. Create projects in **Projects** section

### 7. Verify Everything Works

#### Backend Health Check

**API Root:**
```bash
curl http://localhost:8000/api/v1/
```

**API Docs:**
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- OpenAPI Schema: http://localhost:8000/api/schema/

#### Frontend Health Check

1. Open http://localhost:5173
2. Click "Login"
3. Enter: `contributor@test.com` / `testpass123`
4. Should redirect to homepage with user menu

#### Database Connection Test

```bash
python manage.py dbshell
```

```sql
\dt  -- List tables (PostgreSQL)
SELECT COUNT(*) FROM users_user;  -- Should show 2+ users
\q   -- Quit
```

#### Redis Connection Test

```bash
redis-cli
> PING
PONG
> exit
```

## Development Workflow

### Typical Development Session

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Celery (optional)
cd backend
source venv/bin/activate
celery -A config worker -l info

# Terminal 4: Commands and Git
cd InterfaceHive
git status
```

### Making Database Changes

When you modify models:

```bash
# Generate migration files
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Review migration SQL (optional)
python manage.py sqlmigrate <app_name> <migration_number>
```

### Running Tests

**Backend:**
```bash
pytest
pytest apps/projects/ --cov  # With coverage
pytest -k "test_contribution"  # Specific test
```

**Frontend:**
```bash
npm run test
npm run test:coverage
```

### Code Quality Checks

**Backend:**
```bash
black .         # Format code
isort .         # Sort imports
flake8          # Lint
mypy .          # Type check (if configured)
```

**Frontend:**
```bash
npm run lint    # ESLint
npm run format  # Prettier
npm run type-check  # TypeScript
```

## Common Issues and Solutions

### PostgreSQL Connection Failed

**Symptom:** `django.db.utils.OperationalError: could not connect to server`

**Solutions:**
1. Check Docker: `docker-compose ps` (both containers should be "running")
2. Check port 5432: `lsof -i :5432` or `netstat -an | grep 5432`
3. Restart Docker: `docker-compose restart db`
4. Check logs: `docker-compose logs db`
5. Verify `.env` credentials match `docker-compose.yml`

### Redis Connection Failed

**Symptom:** `redis.exceptions.ConnectionError: Error connecting to Redis`

**Solutions:**
1. Check Docker: `docker-compose ps`
2. Check port 6379: `lsof -i :6379`
3. Restart Redis: `docker-compose restart redis`
4. Test manually: `redis-cli PING` (should return "PONG")

### Frontend Can't Connect to Backend

**Symptom:** Network errors in browser console, API calls fail

**Solutions:**
1. Check backend is running: `curl http://localhost:8000/api/v1/`
2. Verify `VITE_API_BASE_URL` in `frontend/.env`
3. Check CORS settings in `backend/.env`: `CORS_ALLOWED_ORIGINS=http://localhost:5173`
4. Check browser console for specific error messages
5. Clear browser cache and localStorage

### Port Already in Use

**Symptom:** `Address already in use` error

**Solutions:**

**Backend (port 8000):**
```bash
# Find process using port
lsof -i :8000
# Kill process
kill -9 <PID>
```

**Frontend (port 5173):**
```bash
lsof -i :5173
kill -9 <PID>
```

**PostgreSQL (port 5432):**
```bash
# Check if system PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux
# Stop system PostgreSQL or change Docker port in docker-compose.yml
```

### Migration Conflicts

**Symptom:** `django.db.migrations.exceptions.InconsistentMigrationHistory`

**Solutions:**
1. **Reset database** (development only):
```bash
docker-compose down -v  # Delete volumes
docker-compose up -d
python manage.py migrate
```

2. **Squash migrations** (if many migrations):
```bash
python manage.py squashmigrations <app_name> <start> <end>
```

### Virtual Environment Issues

**Symptom:** Packages not found, wrong Python version

**Solutions:**
1. Ensure virtualenv is activated: `which python` should show path to `venv/bin/python`
2. Recreate virtualenv:
```bash
deactivate
rm -rf venv
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Next Steps

Now that your environment is set up:

1. Read [Tech Stack Overview](tech-stack.md) to understand the technologies
2. Explore [Project Structure](project-structure.md) to navigate the codebase
3. Review [Architecture Overview](../02-architecture/overview.md) to understand system design
4. Try making a simple change and see it reflected in the app

## Quick Reference

### Essential Commands

```bash
# Backend
python manage.py runserver       # Start dev server
python manage.py makemigrations  # Generate migrations
python manage.py migrate         # Apply migrations
python manage.py shell           # Django shell
python manage.py createsuperuser # Create admin user
pytest                           # Run tests

# Frontend
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Lint code
npm run test       # Run tests

# Docker
docker-compose up -d      # Start services
docker-compose down       # Stop services
docker-compose down -v    # Stop and remove volumes
docker-compose logs db    # View database logs
docker-compose ps         # Check service status

# Database
python manage.py dbshell  # PostgreSQL shell
redis-cli                 # Redis shell
```

### Environment URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1/
- **API Docs**: http://localhost:8000/api/docs/
- **Django Admin**: http://localhost:8000/admin/

### Test Credentials

After creating test data:
- **Contributor**: `contributor@test.com` / `testpass123`
- **Host**: `host@test.com` / `testpass123`
- **Admin**: `admin@interfacehive.local` / (your password)

---

**Having issues?** Check the [Common Issues](#common-issues-and-solutions) section or ask the team!
