# Project Structure

This guide helps you navigate the InterfaceHive codebase efficiently.

## Repository Overview

```
InterfaceHive/
├── backend/                 # Django backend
├── frontend/                # React frontend
├── docs/                    # Documentation
├── specs/                   # Specification documents
├── dev-history/             # Development history
├── docker-compose.yml       # Docker services configuration
├── CLAUDE.md               # Quick reference guide
├── README.md               # Main project README
└── prd.md                  # Product Requirements Document
```

## Backend Structure

```
backend/
├── apps/                    # Django applications
│   ├── users/              # User management and authentication
│   ├── projects/           # Project CRUD and search
│   ├── contributions/      # Contribution workflow
│   ├── credits/            # Credit ledger system
│   ├── badges/             # Badge achievement system
│   ├── moderation/         # Content moderation
│   ├── chat/               # Real-time chat (WebSocket)
│   └── ai_agent/           # AI project generation
├── config/                  # Django project configuration
│   ├── settings.py         # Django settings
│   ├── urls.py             # Root URL configuration
│   ├── asgi.py             # ASGI application (WebSocket)
│   ├── wsgi.py             # WSGI application (HTTP)
│   └── celery.py           # Celery configuration
├── core/                    # Shared utilities
│   ├── utils.py            # Common helper functions
│   ├── permissions.py      # Custom DRF permissions
│   └── exceptions.py       # Custom exception handlers
├── manage.py               # Django management script
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variables template
└── pytest.ini              # Pytest configuration
```

### Django App Structure

Each Django app follows a consistent structure:

```
apps/[app_name]/
├── __init__.py
├── models.py               # Database models
├── serializers.py          # DRF serializers (JSON ↔ Model)
├── views.py                # API views (request handlers)
├── services.py             # Business logic layer
├── tasks.py                # Celery async tasks
├── admin.py                # Django admin configuration
├── urls.py                 # App-specific URL routing
├── signals.py              # Django signal handlers
├── migrations/             # Database migrations
│   ├── 0001_initial.py
│   └── ...
└── tests/                  # Unit and integration tests
    ├── test_models.py
    ├── test_views.py
    └── test_services.py
```

### Key Backend Files

#### Core Apps

**apps/users/** - User Management
```
users/
├── models.py               # User model with UUID, reputation, GDPR fields
├── serializers.py          # UserSerializer, RegisterSerializer, LoginSerializer
├── views.py                # RegisterView, LoginView, ProfileView
├── services.py             # calculate_reputation(), update_xp()
├── tasks.py                # send_verification_email(), anonymize_user_data()
└── admin.py                # Custom user admin with reputation display
```

Key features:
- Custom User model with UUID primary key
- Email verification system
- Reputation calculation (XP, level, badges)
- GDPR-compliant soft delete

**apps/projects/** - Project Management
```
projects/
├── models.py               # Project, ProjectTag, ProjectTagMap, ProjectResource
├── serializers.py          # ProjectSerializer, ProjectCreateSerializer
├── views.py                # ProjectListCreateView, ProjectDetailView
├── services.py             # create_project(), update_search_vector()
└── admin.py                # Project admin with search and filters
```

Key features:
- Full-text search with PostgreSQL GIN indexes
- Tag normalization and management
- Project lifecycle (draft → open → closed)
- AI-generated project support

**apps/contributions/** - Contribution Workflow
```
contributions/
├── models.py               # Contribution model with status state machine
├── serializers.py          # ContributionSerializer, ContributionDecisionSerializer
├── views.py                # SubmitContributionView, AcceptContributionView
├── services.py             # accept_contribution(), decline_contribution()
├── tasks.py                # send_contribution_notification()
└── signals.py              # post_save signal for notifications
```

Key features:
- State machine: pending → accepted/declined
- Atomic transactions (contribution + credit award)
- Duplicate prevention (DB constraint)
- Notification system

**apps/credits/** - Credit System
```
credits/
├── models.py               # CreditLedgerEntry (immutable)
├── serializers.py          # CreditSerializer, LedgerEntrySerializer
├── views.py                # CreditBalanceView, LedgerHistoryView
├── services.py             # award_credit(), reverse_credit()
└── admin.py                # Read-only ledger admin
```

Key features:
- Immutable ledger (entries never deleted or modified)
- Entry types: award, reversal, adjustment
- XP calculation and leveling
- Integrity validation

**apps/badges/** - Badge System
```
badges/
├── models.py               # Badge, UserBadge
├── serializers.py          # BadgeSerializer, UserBadgeSerializer
├── views.py                # BadgeListView, UserBadgesView
├── services.py             # check_badge_unlock(), update_badge_progress()
└── management/commands/
    └── seed_badges.py      # Seed initial badges
```

Key features:
- Milestone badges (5, 10, 25, 50, 100 contributions)
- Tier system (bronze, silver, gold, platinum)
- Progress tracking
- Secret badges

**apps/ai_agent/** - AI Integration
```
ai_agent/
├── services.py             # generate_project_template(), call_gemini_api()
├── views.py                # GenerateProjectView
├── prompts.py              # AI prompt templates
└── validators.py           # Validate AI-generated content
```

Key features:
- Google Gemini API integration
- Project template generation
- Structured output parsing
- Error handling and retries

#### Configuration

**config/settings.py** - Main Django Settings
```python
# Key sections:
- INSTALLED_APPS          # Enabled Django apps
- MIDDLEWARE              # Request/response processing
- DATABASES               # PostgreSQL configuration
- REST_FRAMEWORK          # DRF settings
- SIMPLE_JWT              # JWT authentication
- CELERY_*                # Celery configuration
- CHANNEL_LAYERS          # Django Channels (WebSocket)
- CORS_*                  # CORS settings for frontend
```

**config/urls.py** - Root URL Configuration
```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.users.urls')),
    path('api/v1/', include('apps.projects.urls')),
    path('api/v1/', include('apps.contributions.urls')),
    # ... other apps
    path('api/docs/', SpectacularSwaggerView.as_view()),
    path('api/schema/', SpectacularAPIView.as_view()),
]
```

**config/celery.py** - Celery Configuration
```python
app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

## Frontend Structure

```
frontend/
├── public/                  # Static assets
│   └── logo.svg
├── src/                     # Source code
│   ├── api/                # API client and endpoints
│   │   ├── client.ts       # Axios instance with interceptors
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── projects.ts     # Project endpoints
│   │   ├── contributions.ts
│   │   ├── credits.ts
│   │   └── ai.ts
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Navbar.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ContributionForm.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── pages/              # Route components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ProjectList.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── CreateProject.tsx
│   │   ├── MyProjects.tsx
│   │   ├── MyContributions.tsx
│   │   └── Profile.tsx
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   └── useContributions.ts
│   ├── schemas/            # Zod validation schemas
│   │   ├── authSchemas.ts
│   │   ├── projectSchemas.ts
│   │   └── contributionSchemas.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── api.ts          # API response types
│   │   ├── models.ts       # Model types
│   │   └── index.ts
│   ├── utils/              # Helper functions
│   │   ├── formatters.ts   # Date, number formatting
│   │   └── validators.ts   # Custom validators
│   ├── i18n.ts             # i18next configuration
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles (Tailwind)
├── locales/                # Translation files
│   ├── en/
│   ├── ko/
│   ├── ja/
│   └── zh/
├── package.json            # Node dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── .env.example            # Environment variables template
```

### Key Frontend Files

#### API Layer

**src/api/client.ts** - Axios Client with Interceptors
```typescript
// Features:
- Base URL configuration
- JWT token attachment (Authorization header)
- Automatic token refresh on 401
- Error handling and retry logic
- Request/response logging (dev mode)
```

**src/api/auth.ts** - Authentication API
```typescript
export const authApi = {
  login: (credentials) => POST /auth/login/
  register: (data) => POST /auth/register/
  refresh: (token) => POST /auth/refresh/
  verifyEmail: (token) => POST /auth/verify-email/
  logout: () => POST /auth/logout/
}
```

**src/api/projects.ts** - Project API
```typescript
export const projectsApi = {
  getProjects: (params) => GET /projects/
  getProject: (id) => GET /projects/:id/
  createProject: (data) => POST /projects/create/
  updateProject: (id, data) => PUT /projects/:id/
  deleteProject: (id) => DELETE /projects/:id/
}
```

#### Components

**src/components/ui/** - shadcn/ui Components

These are copied from shadcn/ui and customized:
- `button.tsx` - Button component
- `input.tsx` - Input component
- `dialog.tsx` - Modal dialog
- `dropdown-menu.tsx` - Dropdown menu
- `card.tsx` - Card component
- `toast.tsx` - Toast notifications
- `form.tsx` - Form components

**src/components/Navbar.tsx** - Navigation Bar
```typescript
// Features:
- Logo and branding
- Navigation links (Home, Projects, My Contributions)
- User menu (Profile, Settings, Logout)
- Language switcher
- Authentication state handling
```

**src/components/ProjectCard.tsx** - Project List Item
```typescript
// Features:
- Project title, description
- Host user information
- Tags display
- Difficulty badge
- Status indicator
- Contribution button
```

#### Pages

**src/pages/ProjectList.tsx** - Project Listing
```typescript
// Features:
- Search and filtering (TanStack Query)
- Tag filtering
- Difficulty filtering
- Pagination
- Loading states
- Empty states
```

**src/pages/ProjectDetail.tsx** - Project Details
```typescript
// Features:
- Project information display
- Contribution submission form
- Contribution list
- Edit/delete (for host)
- Real-time updates (WebSocket)
```

**src/pages/MyContributions.tsx** - User Contributions
```typescript
// Features:
- Filter by status (pending, accepted, declined)
- Sort by date
- Contribution details
- Project navigation
```

#### Hooks

**src/hooks/useAuth.ts** - Authentication Hook
```typescript
export function useAuth() {
  return {
    user: User | null,
    login: (credentials) => Promise,
    register: (data) => Promise,
    logout: () => void,
    isAuthenticated: boolean,
    isLoading: boolean
  }
}
```

**src/hooks/useProjects.ts** - Projects Hook
```typescript
export function useProjects(params) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.getProjects(params)
  })
}

export function useCreateProject() {
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => invalidate(['projects'])
  })
}
```

#### Configuration

**vite.config.ts** - Vite Configuration
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // @ alias for imports
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'  // Proxy API requests
    }
  }
})
```

**tsconfig.json** - TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]  // @ alias
    }
  }
}
```

## Directory Navigation Tips

### Finding Files Quickly

**By Feature:**
```bash
# Authentication
backend/apps/users/         # Backend user management
frontend/src/api/auth.ts    # Frontend auth API
frontend/src/pages/Login.tsx  # Login page

# Projects
backend/apps/projects/      # Backend project logic
frontend/src/api/projects.ts  # Frontend project API
frontend/src/pages/ProjectList.tsx  # Project list page

# Contributions
backend/apps/contributions/  # Backend contribution workflow
frontend/src/api/contributions.ts  # Frontend contribution API
frontend/src/pages/MyContributions.tsx  # User contributions page
```

**By Type:**
```bash
# Models (Database)
backend/apps/*/models.py

# API Views (Endpoints)
backend/apps/*/views.py

# Business Logic
backend/apps/*/services.py

# Frontend Components
frontend/src/components/

# Frontend Pages
frontend/src/pages/

# Type Definitions
frontend/src/types/
```

### Common Tasks

**Adding a new API endpoint:**
1. Backend: `apps/[app]/views.py` - Add view
2. Backend: `apps/[app]/urls.py` - Add URL pattern
3. Backend: `apps/[app]/serializers.py` - Add serializer (if needed)
4. Frontend: `src/api/[module].ts` - Add API function
5. Frontend: `src/hooks/use[Feature].ts` - Add hook (if needed)

**Adding a new page:**
1. Frontend: `src/pages/NewPage.tsx` - Create page component
2. Frontend: `src/App.tsx` - Add route
3. Frontend: `src/components/Navbar.tsx` - Add navigation link (if needed)

**Adding a new model:**
1. Backend: `apps/[app]/models.py` - Define model
2. Backend: `python manage.py makemigrations` - Generate migration
3. Backend: `python manage.py migrate` - Apply migration
4. Backend: `apps/[app]/serializers.py` - Add serializer
5. Backend: `apps/[app]/admin.py` - Register in admin
6. Frontend: `src/types/models.ts` - Add TypeScript type

**Adding a Celery task:**
1. Backend: `apps/[app]/tasks.py` - Define task
2. Backend: `apps/[app]/services.py` - Call task with `.delay()`
3. Test: Start Celery worker and verify execution

## File Naming Conventions

### Backend (Python)

- **Files**: `snake_case.py` (e.g., `user_models.py`)
- **Classes**: `PascalCase` (e.g., `UserProfile`)
- **Functions**: `snake_case` (e.g., `calculate_reputation`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)

### Frontend (TypeScript)

- **Files**: `PascalCase.tsx` for components (e.g., `ProjectCard.tsx`)
- **Files**: `camelCase.ts` for utilities (e.g., `formatDate.ts`)
- **Components**: `PascalCase` (e.g., `function ProjectCard()`)
- **Functions**: `camelCase` (e.g., `function formatDate()`)
- **Types**: `PascalCase` (e.g., `type Project = {}`)
- **Interfaces**: `PascalCase` (e.g., `interface User {}`)

## Import Conventions

### Backend

```python
# Standard library
from datetime import datetime
import os

# Django
from django.db import models
from django.contrib.auth import get_user_model

# Third-party
from rest_framework import serializers
from celery import shared_task

# Local
from apps.users.models import User
from apps.credits.services import award_credit
from .models import Project
```

### Frontend

```typescript
// React
import { useState, useEffect } from 'react';

// Third-party
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// API
import { projectsApi } from '@/api/projects';

// Components
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/ProjectCard';

// Hooks
import { useAuth } from '@/hooks/useAuth';

// Types
import type { Project } from '@/types/models';

// Utils
import { formatDate } from '@/utils/formatters';
```

## Next Steps

Now that you understand the project structure:

1. [Architecture Overview](../02-architecture/overview.md) - See how components interact
2. [Authentication System](../03-core-features/authentication.md) - Deep dive into auth flow
3. [Contribution Workflow](../03-core-features/contribution-workflow.md) - Understand the core feature

## Quick Commands for Navigation

```bash
# Find all models
fd -e py models.py backend/apps/

# Find all views
fd -e py views.py backend/apps/

# Find all pages
fd -e tsx . frontend/src/pages/

# Find all API files
fd . frontend/src/api/

# Search for specific functionality
rg "def calculate_reputation" backend/
rg "useAuth" frontend/src/
```

---

Happy coding!
