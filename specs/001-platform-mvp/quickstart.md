# InterfaceHive MVP - Developer Quickstart Guide

**Feature:** 001-platform-mvp
**Last Updated:** 2025-12-29
**Target Audience:** Developers implementing the InterfaceHive platform

## Overview

This quickstart guide provides everything you need to implement the InterfaceHive MVP from scratch. Follow these steps in order to set up the development environment, implement features, and deploy to production.

**Estimated Time:** 4-6 weeks for full implementation with 2-3 developers

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Verification Checklist](#verification-checklist)

---

## Prerequisites

### Required Software

- **Python 3.11+** (Django backend)
- **Node.js 20+ & npm** (React frontend)
- **PostgreSQL 15+** (Database)
- **Redis 7+** (Cache & message broker)
- **Git** (Version control)

### Recommended Tools

- **Docker & Docker Compose** (Local development)
- **VS Code** or similar IDE
- **Postman** or **Bruno** (API testing)
- **pgAdmin** or **DBeaver** (Database management)

### Required Accounts

- **GitHub** account (code hosting)
- **Email service** (SendGrid, Mailgun, or AWS SES)
- **Hosting** (Render, Fly.io, or Railway for backend; Vercel/Netlify for frontend)

---

## Project Setup

### 1. Initialize Repository

```bash
# Create project root
mkdir interfacehive && cd interfacehive
git init

# Create directory structure
mkdir -p backend/apps/{users,projects,contributions,credits}
mkdir -p frontend/src/{components,pages,hooks,api,utils}
mkdir -p specs/001-platform-mvp
```

### 2. Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install django==5.0 \
  djangorestframework==3.14 \
  djangorestframework-simplejwt==5.3 \
  django-cors-headers==4.3 \
  django-filter==23.5 \
  drf-spectacular==0.27 \
  psycopg2-binary==2.9 \
  celery==5.3 \
  redis==5.0 \
  django-ratelimit==4.1

# Save dependencies
pip freeze > requirements.txt

# Create Django project
django-admin startproject config .

# Create Django apps
python manage.py startapp users
python manage.py startapp projects
python manage.py startapp contributions
python manage.py startapp credits
```

### 3. Frontend Setup (React + Vite)

```bash
cd ../frontend

# Create Vite project with React + TypeScript
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install react-router-dom \
  @tanstack/react-query \
  react-hook-form \
  @hookform/resolvers \
  zod \
  axios

# Install shadcn/ui
npx shadcn-ui@latest init

# Install shadcn components (common ones)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add skeleton
```

### 4. Database Setup

```bash
# Start PostgreSQL (Docker)
docker run -d \
  --name interfacehive-postgres \
  -e POSTGRES_DB=interfacehive \
  -e POSTGRES_USER=interfacehive \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  postgres:15

# Start Redis (Docker)
docker run -d \
  --name interfacehive-redis \
  -p 6379:6379 \
  redis:7
```

### 5. Environment Configuration

**Backend `.env`:**
```bash
# backend/.env
DEBUG=True
SECRET_KEY=your-secret-key-generate-with-django-secret-key-generator
DATABASE_URL=postgresql://interfacehive:dev_password@localhost:5432/interfacehive
REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Email (development - console backend)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@interfacehive.local
```

**Frontend `.env`:**
```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Backend Implementation

### Phase 1: Core Models (Week 1)

**File:** `backend/users/models.py`

1. Implement `User` model extending `AbstractUser`
2. Add email verification fields
3. Add GDPR compliance fields
4. Create custom user manager

**File:** `backend/projects/models.py`

1. Implement `Project` model
2. Implement `ProjectTag` and `ProjectTagMap` models
3. Add full-text search vector field
4. Create model methods

**File:** `backend/contributions/models.py`

1. Implement `Contribution` model
2. Add status fields and constraints
3. Create decision tracking

**File:** `backend/credits/models.py`

1. Implement `CreditLedgerEntry` model
2. Add unique constraint for awards
3. Override `save()` and `delete()` for immutability

**Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

### Phase 2: Authentication & Authorization (Week 1-2)

**File:** `backend/users/serializers.py`

```python
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'display_name']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['email'].split('@')[0],  # Generate username
            password=validated_data['password'],
            display_name=validated_data['display_name'],
        )
        # Send verification email (async via Celery)
        from .tasks import send_verification_email
        send_verification_email.delay(user.id)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    total_credits = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'display_name', 'bio', 'skills', 
                  'github_url', 'portfolio_url', 'email_verified', 
                  'total_credits', 'created_at']
        read_only_fields = ['email', 'email_verified', 'total_credits']
```

**File:** `backend/users/views.py`

```python
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    def get_object(self):
        return self.request.user

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    token = request.data.get('token')
    try:
        user = User.objects.get(email_verification_token=token)
        user.email_verified = True
        user.email_verified_at = timezone.now()
        user.email_verification_token = None
        user.save()
        return Response({'message': 'Email verified successfully'})
    except User.DoesNotExist:
        return Response({'error': 'Invalid token'}, status=400)
```

**File:** `backend/users/tasks.py`

```python
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import uuid

@shared_task(bind=True, max_retries=5)
def send_verification_email(self, user_id):
    from .models import User
    try:
        user = User.objects.get(id=user_id)
        token = str(uuid.uuid4())
        user.email_verification_token = token
        user.save()
        
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        send_mail(
            subject='Verify your InterfaceHive account',
            message=f'Click here to verify: {verification_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (5 ** self.request.retries))
```

### Phase 3: Projects API (Week 2)

Implement project CRUD operations following patterns from `contracts/openapi.yaml`:

1. `ProjectListView` - GET /api/v1/projects
2. `ProjectCreateView` - POST /api/v1/projects
3. `ProjectDetailView` - GET /api/v1/projects/{id}
4. `ProjectUpdateView` - PATCH /api/v1/projects/{id}
5. `ProjectCloseView` - POST /api/v1/projects/{id}/close

**Key Features:**
- Full-text search using PostgreSQL GIN index
- Tag filtering with many-to-many relationship
- Pagination with 20 items per page
- Permission checks (only host can update/close)

### Phase 4: Contributions API (Week 2-3)

Implement contribution workflow:

1. `ContributionCreateView` - POST /api/v1/projects/{id}/contributions
2. `ContributionListView` - GET /api/v1/projects/{id}/contributions
3. `ContributionAcceptView` - PATCH /api/v1/contributions/{id}/accept
4. `ContributionDeclineView` - PATCH /api/v1/contributions/{id}/decline

**Critical: Atomic Accept Transaction**

```python
from django.db import transaction, IntegrityError

@transaction.atomic
def accept_contribution(contribution, host_user):
    # Lock contribution
    contribution = Contribution.objects.select_for_update().get(id=contribution.id)
    
    # Validate
    if contribution.status != 'pending':
        raise ValidationError("Contribution already decided")
    if contribution.project.host != host_user:
        raise PermissionDenied()
    
    # Update contribution
    contribution.status = 'accepted'
    contribution.decided_by = host_user
    contribution.decided_at = timezone.now()
    contribution.save()
    
    # Award credit (may fail if duplicate)
    credit_awarded = False
    try:
        CreditLedgerEntry.objects.create(
            to_user=contribution.contributor,
            project=contribution.project,
            contribution=contribution,
            created_by_user=host_user,
            amount=1,
            entry_type='award'
        )
        credit_awarded = True
    except IntegrityError:
        # User already has credit for this project
        pass
    
    return contribution, credit_awarded
```

### Phase 5: Credits API (Week 3)

Implement credit tracking:

1. `CreditBalanceView` - GET /api/v1/me/credits/balance
2. `CreditLedgerView` - GET /api/v1/me/credits/ledger

**Credit Balance Calculation:**
```python
from django.db.models import Count

def get_user_credit_balance(user):
    return CreditLedgerEntry.objects.filter(
        to_user=user,
        entry_type='award'
    ).count()
```

### Phase 6: Rate Limiting & Security (Week 3)

**File:** `backend/config/settings.py`

```python
# Rate limiting
RATELIMIT_USE_CACHE = 'default'
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': env('REDIS_URL'),
    }
}

# CORS
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = True

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

Apply rate limiting to views:

```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='user', rate='10/h', method='POST', block=True)
def create_project(request):
    pass

@ratelimit(key='user', rate='20/h', method='POST', block=True)
def create_contribution(request):
    pass
```

---

## Frontend Implementation

### Phase 1: Setup & Routing (Week 3)

**File:** `frontend/src/main.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProjectFeed />} />
          <Route path="/projects/new" element={<CreateProject />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/:id" element={<PublicProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### Phase 2: API Client (Week 3)

**File:** `frontend/src/api/client.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 by refreshing token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Phase 3: React Query Hooks (Week 4)

**File:** `frontend/src/hooks/useProjects.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

export const useProjects = (filters: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/projects', { params: filters });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: ProjectCreate) => {
      const { data } = await apiClient.post('/projects', project);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
```

### Phase 4: Key Components (Week 4-5)

1. **ProjectCard** - Display project summary in feed
2. **ProjectDetail** - Full project view with contributions
3. **ContributionForm** - Submit contributions
4. **ContributionList** - View contributions with status badges
5. **AcceptDeclineButtons** - Host actions with optimistic updates

**File:** `frontend/src/components/ProjectCard.tsx`

```typescript
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const ProjectCard = ({ project }: { project: ProjectSummary }) => {
  return (
    <Card className="p-6 hover:shadow-lg transition">
      <Link to={`/projects/${project.id}`}>
        <h2 className="text-xl font-bold mb-2">{project.title}</h2>
        <p className="text-gray-600 mb-4">{project.description.slice(0, 150)}...</p>
        <div className="flex gap-2 mb-4">
          {project.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>By {project.host.displayName}</span>
          <span>{project.acceptedContributorsCount} contributors</span>
        </div>
      </Link>
    </Card>
  );
};
```

### Phase 5: Forms with Validation (Week 5)

**File:** `frontend/src/schemas/projectSchema.ts`

```typescript
import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  whatItDoes: z.string().min(20).max(2000),
  desiredOutputs: z.string().min(20).max(2000),
  inputsDependencies: z.string().max(2000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  difficulty: z.enum(['easy', 'intermediate', 'advanced']).optional(),
  estimatedTime: z.string().max(50).optional(),
  githubUrl: z.string().url().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
```

---

## Testing

### Backend Tests (Week 5-6)

**Run tests:**
```bash
cd backend
python manage.py test --parallel
coverage run --source='.' manage.py test
coverage report  # Should show >= 70%
```

**Critical test suites:**
1. `tests/test_auth.py` - Registration, login, verification
2. `tests/test_projects.py` - CRUD, search, permissions
3. `tests/test_contributions.py` - Submit, accept, decline
4. `tests/test_credits.py` - Award, balance, ledger integrity
5. `tests/test_acceptance.py` - Atomic transaction test

### Frontend Tests (Week 6)

```bash
cd frontend
npm test
npm run test:coverage
```

### E2E Tests (Week 6)

```bash
npx playwright test
```

---

## Deployment

### Backend Deployment (Render/Fly.io)

1. Create `Procfile`:
```
web: gunicorn config.wsgi --workers 4
worker: celery -A config worker --loglevel=info
beat: celery -A config beat --loglevel=info
```

2. Create `runtime.txt`:
```
python-3.11.7
```

3. Set environment variables in hosting dashboard

4. Run migrations:
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Frontend Deployment (Vercel/Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_BASE_URL` environment variable

---

## Verification Checklist

### Authentication & Users
- [ ] User can register with email and password
- [ ] Verification email sent on registration
- [ ] User can verify email via link
- [ ] User can log in after verification
- [ ] Unverified users blocked from login
- [ ] User can update profile
- [ ] JWT tokens refresh correctly

### Projects
- [ ] User can create project
- [ ] Projects appear in feed
- [ ] Search by keyword works
- [ ] Filter by tags works
- [ ] Sort by newest/oldest works
- [ ] Project detail page displays correctly
- [ ] Only host can edit project
- [ ] Only host can close project
- [ ] Rate limiting enforced (10 projects/hour)

### Contributions
- [ ] User can submit contribution to open project
- [ ] Host cannot submit to own project
- [ ] Host sees all contributions
- [ ] Public sees accepted only
- [ ] Contributor sees accepted + own
- [ ] Host can accept contribution
- [ ] Credit awarded on first acceptance
- [ ] No duplicate credits for same user/project
- [ ] Host can decline contribution
- [ ] Declined contributions not in accepted list
- [ ] Rate limiting enforced (20 contributions/hour)

### Credits
- [ ] Credit balance displays correctly
- [ ] Ledger shows transaction history
- [ ] Credit balance updates after acceptance
- [ ] Ledger entries are immutable

### Performance
- [ ] Pages load within 3 seconds
- [ ] API responses < 3 seconds (p95)
- [ ] Database queries optimized
- [ ] Full-text search < 100ms

### Security
- [ ] CSRF protection enabled
- [ ] XSS prevention working
- [ ] SQL injection prevented (ORM only)
- [ ] Rate limiting enforced
- [ ] Authorization checks on all endpoints

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus indicators visible
- [ ] No axe-core violations

---

## Next Steps

After MVP deployment:

1. **Monitor Performance:** Set up APM (New Relic, DataDog)
2. **Analytics:** Add posthog or Mixpanel
3. **User Feedback:** Add feedback widget
4. **Iterate:** Review constitution compliance, gather metrics

---

## Support

- **Documentation:** See `specs/001-platform-mvp/` for detailed specs
- **API Reference:** See `contracts/openapi.yaml`
- **Data Model:** See `data-model.md`
- **Research:** See `research.md` for technical decisions

---

**Happy Building! 🚀**
