# InterfaceHive MVP - Developer Quickstart

**Last Updated:** 2025-12-22
**Branch:** `001-platform-mvp`

## Overview

This guide will get you up and running with InterfaceHive platform in < 10 minutes. You'll set up the full stack (React frontend + Django backend + PostgreSQL + Redis) using Docker Compose.

## Prerequisites

- **Docker Desktop** (or Docker + Docker Compose)
  - [Download for Windows/Mac](https://www.docker.com/products/docker-desktop/)
  - Linux: `sudo apt install docker.io docker-compose`
- **Git**
- **Text Editor/IDE** (VS Code recommended)

##Quick Start (5 Minutes)

### 1. Clone & Enter Project Directory

```bash
git clone https://github.com/your-org/interfacehive.git
cd interfacehive
git checkout 001-platform-mvp
```

### 2. Copy Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

**Edit `backend/.env`** (if needed):
```env
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=postgresql://postgres:postgres@db:5432/interfacehive
REDIS_URL=redis://redis:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Edit `frontend/.env`** (if needed):
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Start All Services

```bash
docker-compose up -d
```

This will start:
- **Frontend:** React dev server on `http://localhost:3000`
- **Backend:** Django API on `http://localhost:8000`
- **PostgreSQL:** Database on port `5432`
- **Redis:** Cache/queue on port `6379`

### 4. Run Database Migrations

```bash
docker-compose exec backend python manage.py migrate
```

### 5. Create Admin User

```bash
docker-compose exec backend python manage.py createsuperuser
```

Follow prompts to set username, email, password.

### 6. Open Application

- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/api/v1/docs
- **Django Admin:** http://localhost:8000/admin

**Default Test User:**
- Email: admin@example.com
- Password: (what you set in step 5)

---

## Development Workflow

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Running Backend Commands

```bash
# Django shell
docker-compose exec backend python manage.py shell

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Run tests
docker-compose exec backend pytest

# Check coverage
docker-compose exec backend pytest --cov=apps --cov-report=html
```

### Running Frontend Commands

```bash
# Install new package
docker-compose exec frontend npm install <package-name>

# Run tests
docker-compose exec frontend npm test

# Build for production
docker-compose exec frontend npm run build
```

### Stopping Services

```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, and delete volumes (fresh start)
docker-compose down -v
```

---

## Project Structure

```
interfacehive/
├── backend/                    # Django backend
│   ├── apps/
│   │   ├── users/              # User authentication & profiles
│   │   ├── projects/           # Project management
│   │   ├── contributions/      # Contribution workflow
│   │   └── credits/            # Credit ledger system
│   ├── config/                 # Django settings
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities & API client
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
│
├── specs/                      # Feature specifications
│   └── 001-platform-mvp/
│       ├── spec.md             # Feature spec
│       ├── plan.md             # Implementation plan
│       ├── data-model.md       # Database schema
│       ├── research.md         # Technical decisions
│       └── contracts/          # API contracts
│
├── docker-compose.yml
└── README.md
```

---

## Key Technologies

### Backend
- **Django 5.x:** Web framework
- **Django REST Framework:** API framework
- **PostgreSQL 15+:** Primary database
- **Redis:** Cache & message broker
- **Celery:** Async task queue
- **pytest:** Testing framework

### Frontend
- **React 18:** UI library
- **TypeScript:** Type safety
- **shadcn/ui:** Accessible components
- **TanStack Query:** Data fetching/caching
- **React Router:** Client-side routing
- **Vite:** Build tool

---

## Common Tasks

### Add a New Django App

```bash
docker-compose exec backend python manage.py startapp <app_name> apps/<app_name>
```

### Add a New API Endpoint

1. **Define Serializer** (`apps/<app>/serializers.py`):
```python
from rest_framework import serializers

class MyModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyModel
        fields = ['id', 'name', 'created_at']
```

2. **Create ViewSet** (`apps/<app>/views.py`):
```python
from rest_framework import viewsets

class MyModelViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MyModelSerializer
    permission_classes = [IsAuthenticated]
```

3. **Register Routes** (`apps/<app>/urls.py`):
```python
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('mymodels', MyModelViewSet)

urlpatterns = router.urls
```

### Add a New React Page

1. **Create Page Component** (`src/pages/MyPage.tsx`):
```typescript
export function MyPage() {
  return (
    <div>
      <h1>My New Page</h1>
    </div>
  );
}
```

2. **Add Route** (`src/App.tsx`):
```typescript
import { MyPage } from './pages/MyPage';

<Route path="/my-page" element={<MyPage />} />
```

### Run Backend Tests

```bash
# All tests
docker-compose exec backend pytest

# With coverage
docker-compose exec backend pytest --cov

# Specific test file
docker-compose exec backend pytest apps/users/tests/test_models.py

# Specific test
docker-compose exec backend pytest apps/users/tests/test_models.py::test_user_creation
```

### Run Frontend Tests

```bash
# All tests
docker-compose exec frontend npm test

# Watch mode
docker-compose exec frontend npm test -- --watch

# Coverage
docker-compose exec frontend npm test -- --coverage
```

---

## Debugging

### Backend Debugging (with pdb)

1. Add breakpoint in code:
```python
import pdb; pdb.set_trace()
```

2. Attach to container:
```bash
docker-compose exec backend python manage.py runserver 0.0.0.0:8000
```

### Frontend Debugging

- Use browser DevTools (F12)
- React DevTools extension
- Console logs with `console.log()`

### Database Access

```bash
# psql shell
docker-compose exec db psql -U postgres -d interfacehive

# Common queries
SELECT * FROM users LIMIT 10;
SELECT * FROM projects WHERE status='open';
SELECT * FROM credit_ledger_entries WHERE to_user_id='...';
```

---

## API Testing

### Using cURL

```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","display_name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get projects (with token)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8000/api/v1/projects
```

### Using Swagger UI

1. Navigate to http://localhost:8000/api/v1/docs
2. Click "Authorize" button
3. Enter JWT token: `Bearer YOUR_TOKEN_HERE`
4. Test endpoints interactively

---

## Troubleshooting

### "Port already in use" Error

```bash
# Find process using port 3000 (frontend)
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml:
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker-compose ps db

# Restart database
docker-compose restart db

# Reset database (deletes all data!)
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

### "Module not found" Errors (Backend)

```bash
# Rebuild backend image
docker-compose build backend

# Or install package
docker-compose exec backend pip install <package-name>

# Add to requirements.txt
echo "<package-name>==<version>" >> backend/requirements.txt
```

### "Module not found" Errors (Frontend)

```bash
# Rebuild frontend image
docker-compose build frontend

# Or install package
docker-compose exec frontend npm install <package-name>
```

### Migrations Out of Sync

```bash
# Reset migrations (development only!)
docker-compose exec backend python manage.py migrate <app> zero
docker-compose exec backend find apps -path "*/migrations/*.py" -not -name "__init__.py" -delete
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

---

## Performance Tips

### Speed Up Docker Builds

Add to `.dockerignore` (if not present):
```
node_modules/
__pycache__/
*.pyc
.git/
.env
```

### Reduce Hot Reload Latency

**Frontend** (`vite.config.ts`):
```typescript
export default defineConfig({
  server: {
    watch: {
      usePolling: true,  // For Docker
    },
  },
});
```

**Backend** (already configured in Django settings)

---

## Next Steps

1. **Read the Spec:** `specs/001-platform-mvp/spec.md`
2. **Explore Data Models:** `specs/001-platform-mvp/data-model.md`
3. **Check API Docs:** http://localhost:8000/api/v1/docs
4. **Run Tests:** Ensure all tests pass before making changes
5. **Pick a Task:** See `specs/001-platform-mvp/tasks.md` (coming soon)

---

## Useful Commands Reference

| Task | Command |
|------|---------|
| Start all services | `docker-compose up -d` |
| Stop all services | `docker-compose stop` |
| View logs | `docker-compose logs -f` |
| Run migrations | `docker-compose exec backend python manage.py migrate` |
| Django shell | `docker-compose exec backend python manage.py shell` |
| Backend tests | `docker-compose exec backend pytest` |
| Frontend tests | `docker-compose exec frontend npm test` |
| Database shell | `docker-compose exec db psql -U postgres -d interfacehive` |
| Fresh start | `docker-compose down -v && docker-compose up -d` |

---

## Getting Help

- **Spec Questions:** Check `specs/001-platform-mvp/spec.md`
- **API Documentation:** http://localhost:8000/api/v1/docs
- **Django Docs:** https://docs.djangoproject.com/
- **React Docs:** https://react.dev/
- **Team Chat:** [Your team chat link]

---

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Run linters: `npm run lint` (frontend), `flake8` (backend)
4. Run tests: `npm test` (frontend), `pytest` (backend)
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Open Pull Request on GitHub

---

**Happy coding! 🚀**

