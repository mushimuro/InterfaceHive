# Backend Server Setup Guide

This document explains how to set up and run the InterfaceHive backend server at `http://localhost:8000/` and access the API documentation interface.

## Table of Contents
- [Server Overview](#server-overview)
- [Prerequisites](#prerequisites)
- [Running the Backend Server](#running-the-backend-server)
- [Homepage Interface](#homepage-interface)
- [API Documentation (Swagger UI)](#api-documentation-swagger-ui)
- [Design Details](#design-details)
- [Troubleshooting](#troubleshooting)

---

## Server Overview

The InterfaceHive backend runs on **Django 5.0** with a custom homepage and integrated API documentation:

- **Homepage**: `http://localhost:8000/` - Developer landing page showing platform overview, stats, and quick links
- **Swagger UI**: `http://localhost:8000/api/docs/` - Interactive API documentation with endpoint testing
- **ReDoc**: `http://localhost:8000/api/redoc/` - Alternative API documentation (clean reading format)
- **OpenAPI Schema**: `http://localhost:8000/api/schema/` - Raw OpenAPI 3.0 schema JSON

---

## Prerequisites

Before starting the server, ensure you have:

1. **PostgreSQL 16** running (via Docker or local installation)
2. **Redis** running (for Celery tasks and caching)
3. **Python 3.12.9** with virtual environment
4. **Environment variables** configured in `backend/.env`

### Start Required Services

```bash
# Start PostgreSQL and Redis via Docker
docker-compose up -d

# Verify services are running
docker-compose ps
```

You should see both `postgres` and `redis` containers running.

---

## Running the Backend Server

### Step 1: Activate Virtual Environment

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 2: Apply Database Migrations

```bash
python manage.py migrate
```

### Step 3: Start Django Development Server

```bash
python manage.py runserver
```

**Expected output:**
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
January 21, 2026 - 10:30:00
Django version 5.0.1, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

The server is now running at **`http://localhost:8000/`**

### Step 4: (Optional) Run Celery Worker

For async tasks like email notifications and AI generation:

```bash
# In a separate terminal
cd backend
source venv/bin/activate
celery -A config worker -l info
```

---

## Homepage Interface

### Accessing the Homepage

Navigate to `http://localhost:8000/` in your browser.

### What You'll See

The homepage is a **luxury minimalist landing page** with dark/light theme support featuring:

#### **Header Section**
- **Title**: "✨ Interface HIVE Admin" with gradient styling
- **Tagline**: "Where builders meet contributors"
- **Technology Badges**: Django 5.0, PostgreSQL 16, REST API, AI-Powered, Real-time
- **Stats Grid**:
  - 10+ API Endpoints
  - 08 Core Apps
  - 10 Badges
  - 100% Coverage Goal

#### **Quick Access Cards** (4 cards in 2x2 grid)

1. **Frontend App** ⚡
   - Links to React app at `http://localhost:5173`
   - Opens the main InterfaceHive web application

2. **Documentation** 📊
   - Swagger UI link: `/api/docs/`
   - ReDoc link: `/api/redoc/`
   - Interactive API testing interface

3. **Admin Panel** ⚙️
   - Django Admin link: `/admin/`
   - Manage users, projects, contributions

4. **API Schema** 🎯
   - OpenAPI Schema link: `/api/schema/`
   - Raw JSON schema for API endpoints

#### **Core Features Section**
Lists all platform features in a grid:
- JWT Authentication with token refresh
- AI-powered project generation (Gemini)
- Multi-dimensional reputation system
- Badge system with 10 milestones
- Real-time chat via WebSocket
- Email notifications (AWS SES ready)
- Credit-based reward system
- Full-text search (PostgreSQL GIN)
- Async tasks with Celery
- i18n support (EN, KO, DE, ZH)
- GDPR compliant data management
- Moderation tools for content safety

#### **Available Endpoints Section**
Shows all API route prefixes:
- `/api/v1/auth/` - Authentication & registration
- `/api/v1/projects/` - Project CRUD operations
- `/api/v1/contributions/` - Contribution submissions
- `/api/v1/credits/` - Credit system queries
- `/api/v1/badges/` - Achievement badges
- `/api/v1/admin/` - Moderation tools
- `/api/v1/ai/` - AI-assisted features
- `/api/v1/chat/` - Real-time messaging

#### **Developer Info Section**
- Developer name: Yoonho Park
- Contact: pyh051920@gmail.com
- GitHub: github.com/mushimuro
- Technology stack showcase
- Key achievements grid

#### **Theme & Language Controls**
- **Theme Toggle** (top-right): Switch between dark 🌙 and light ☀️ modes
- **Language Dropdown** (top-right): Switch between EN, KO, DE, ZH (uses Django i18n)

---

## API Documentation (Swagger UI)

### Accessing Swagger UI

Navigate to `http://localhost:8000/api/docs/` in your browser.

### What Swagger UI Provides

**Swagger UI** is an interactive API documentation interface powered by `drf-spectacular` that allows you to:

1. **View All Endpoints**: See every API endpoint organized by app module
2. **Test APIs**: Execute API calls directly from the browser
3. **View Schemas**: Inspect request/response data structures
4. **Authentication**: Test authenticated endpoints with JWT tokens

### Swagger UI Features

#### **Endpoint Organization**
APIs are grouped by module:
- **auth** - User registration, login, token refresh, password reset
- **projects** - List, create, update, delete projects
- **contributions** - Submit, review, approve contributions
- **credits** - View credit balance, transaction history
- **badges** - View available badges, user achievements
- **admin** - Moderation actions (staff only)
- **ai** - AI-powered project generation
- **chat** - WebSocket chat endpoints

#### **Testing Endpoints**

1. **Expand an endpoint** by clicking on it (e.g., `POST /api/v1/auth/login/`)
2. **Click "Try it out"** button
3. **Fill in request body** with required parameters
4. **Click "Execute"** to send the request
5. **View response** including status code, headers, and body

#### **Authentication in Swagger**

For protected endpoints:

1. **Login first**: Use `POST /api/v1/auth/login/` to get JWT tokens
2. **Copy access token** from response
3. **Click "Authorize"** button at top of page
4. **Enter**: `Bearer <your_access_token>`
5. **Click "Authorize"** and close dialog
6. Now you can test authenticated endpoints

#### **Response Examples**

Swagger shows:
- **Request schema**: Expected input format with data types
- **Response schema**: Expected output format
- **Example values**: Sample request/response data
- **Status codes**: 200 (success), 400 (bad request), 401 (unauthorized), etc.

---

## Design Details

### Homepage Design System

The homepage uses a **luxury minimalist aesthetic** inspired by modern fintech and premium brand designs:

#### **Color Palette**

**Dark Mode (Default)**:
```css
--brand-black: #0a0a0a
--brand-accent: hsl(38, 92%, 50%)  /* Orange/Gold #F1BF42 */
--text-primary: #ffffff
--text-secondary: rgba(255, 255, 255, 0.7)
--border-subtle: rgba(255, 255, 255, 0.1)
```

**Light Mode**:
```css
--brand-black: #ffffff
--text-primary: #0a0a0a
--text-secondary: rgba(10, 10, 10, 0.7)
--border-subtle: rgba(10, 10, 10, 0.1)
```

#### **Typography**
- **Headings**: Oswald (sans-serif, uppercase, bold)
- **Body Text**: Inter (clean, modern, readable)
- **Accent Color**: Orange/gold (#F1BF42) for highlights and CTAs

#### **Layout Components**

1. **Marquee Banner** (top of page)
   - Infinite scrolling text: "AI-POWERED PLATFORM / BUILD. CONTRIBUTE. GROW."
   - Fade overlays on edges
   - Oswald font, uppercase

2. **Stats Grid**
   - 4-column layout (2 columns on mobile)
   - Oswald numbers in accent color
   - Uppercase labels

3. **Cards Grid**
   - 2-column layout (1 column on mobile)
   - Border-based design (1px subtle borders)
   - Gradient hover effects
   - Arrow appears on button hover

4. **Features Grid**
   - Auto-fit responsive columns (min 300px)
   - Left border accent on hover
   - Strong tags in accent color

### Implementation Files

The homepage is implemented across these files:

1. **URL Routing**: `backend/config/urls.py`
   ```python
   path('', home, name='home'),  # Line 15
   ```

2. **View Function**: `backend/config/views.py`
   ```python
   def home(request):
       return render(request, 'home.html')  # Line 28
   ```

3. **Template**: `backend/config/templates/home.html`
   - Complete HTML structure with embedded CSS and JavaScript
   - Django i18n template tags for translations: `{% trans "text" %}`
   - Theme toggle script with localStorage persistence
   - Language dropdown with cookie-based switching

### Swagger UI Configuration

Swagger is configured in `backend/config/settings.py` using `drf-spectacular`:

```python
# OpenAPI/Swagger Configuration
SPECTACULAR_SETTINGS = {
    'TITLE': 'InterfaceHive API',
    'DESCRIPTION': 'API for the InterfaceHive platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
```

URL configuration in `backend/config/urls.py`:
```python
from drf_spectacular.views import (
    SpectacularAPIView,        # Schema generation
    SpectacularRedocView,      # ReDoc UI
    SpectacularSwaggerView,    # Swagger UI
)

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

---

## Troubleshooting

### Server Won't Start

**Problem**: `ModuleNotFoundError` or `ImportError`
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**Problem**: `django.db.utils.OperationalError: could not connect to server`
```bash
# Solution: Ensure PostgreSQL is running
docker-compose up -d postgres
```

### Homepage Shows Error

**Problem**: `TemplateDoesNotExist: home.html`
```bash
# Solution: Verify template location
ls backend/config/templates/home.html
```

**Problem**: Static assets not loading (images, fonts)
```bash
# Solution: Collect static files
python manage.py collectstatic --noinput
```

### Swagger UI Not Loading

**Problem**: `/api/docs/` shows 404
```bash
# Solution: Ensure drf-spectacular is installed
pip install drf-spectacular

# Verify in settings.py INSTALLED_APPS:
# 'drf_spectacular',
```

**Problem**: Endpoints not appearing in Swagger
```bash
# Solution: Regenerate schema
python manage.py spectacular --file schema.yml

# Check for API errors in terminal
```

### Theme or Language Not Switching

**Problem**: Theme toggle doesn't persist
- **Solution**: Check browser localStorage - ensure JavaScript is enabled

**Problem**: Language doesn't change
- **Solution**: Clear browser cookies and try again
- Verify `LANGUAGE_CODE` in Django settings
- Check that `django.middleware.locale.LocaleMiddleware` is enabled

### Authentication Fails in Swagger

**Problem**: 401 Unauthorized when testing protected endpoints
```bash
# Solution: Get fresh token
1. POST to /api/v1/auth/login/ with credentials
2. Copy "access" token from response
3. Click "Authorize" button in Swagger
4. Enter: Bearer <token>
5. Click "Authorize"
```

**Problem**: Token expired
- **Solution**: Use refresh token endpoint `/api/v1/auth/token/refresh/`

---

## Summary

To replicate this exact setup:

1. **Start services**: `docker-compose up -d`
2. **Activate venv**: `source backend/venv/bin/activate`
3. **Run migrations**: `python manage.py migrate`
4. **Start server**: `python manage.py runserver`
5. **Access homepage**: `http://localhost:8000/`
6. **Access Swagger**: `http://localhost:8000/api/docs/`

The homepage provides a beautiful developer interface showing all available endpoints, platform features, and quick access to documentation. Swagger UI allows interactive testing of all API endpoints with request/response examples and authentication support.

---

**Design Philosophy**: Luxury minimalism with clean borders, subtle animations, and a premium dark/light theme inspired by modern fintech platforms like Stripe, Wero, and Linear.

**Key Technologies**: Django 5.0, drf-spectacular, Django Templates, PostgreSQL, Redis, Celery, Django Channels, JWT Authentication, i18n/l10n
