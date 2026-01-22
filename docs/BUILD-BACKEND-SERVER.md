# Build Backend Server & API Documentation - Implementation Guide

This guide provides step-by-step instructions for creating a Django backend server with a luxury minimalist homepage and interactive Swagger API documentation.

**Target**: Create a server at `http://localhost:8000/` with a beautiful landing page and API docs at `http://localhost:8000/api/docs/`

---

## Table of Contents

1. [Prerequisites Setup](#step-1-prerequisites-setup)
2. [Django Project Setup](#step-2-django-project-setup)
3. [Install API Documentation Package](#step-3-install-api-documentation-package)
4. [Create Homepage Template](#step-4-create-homepage-template)
5. [Create View Functions](#step-5-create-view-functions)
6. [Configure URLs](#step-6-configure-urls)
7. [Configure Swagger Settings](#step-7-configure-swagger-settings)
8. [Test the Server](#step-8-test-the-server)
9. [Customization Options](#step-9-customization-options)

---

## Step 1: Prerequisites Setup

### 1.1 Ensure Services are Running

```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d

# Verify they're running
docker-compose ps
```

You should see `postgres` and `redis` containers with status "Up".

### 1.2 Activate Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# On Unix/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 1.3 Apply Migrations

```bash
# Apply database migrations
python manage.py migrate
```

---

## Step 2: Django Project Setup

Your Django project should have this structure:
```
backend/
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── views.py       # We'll create this
│   └── templates/     # We'll create this
│       └── home.html  # We'll create this
├── apps/
│   ├── users/
│   ├── projects/
│   └── ... (other apps)
└── manage.py
```

If `config/views.py` doesn't exist, we'll create it in Step 5.

---

## Step 3: Install API Documentation Package

### 3.1 Install drf-spectacular

```bash
pip install drf-spectacular
```

### 3.2 Add to requirements.txt

Add this line to `backend/requirements.txt`:
```txt
drf-spectacular==0.27.0
```

---

## Step 4: Create Homepage Template

### 4.1 Create Templates Directory

```bash
# Create templates directory in config/
mkdir -p config/templates
```

### 4.2 Create home.html Template

Create the file `backend/config/templates/home.html` with the following content:

```html
{% load i18n %}
{% get_current_language as LANGUAGE_CODE %}
<!DOCTYPE html>
<html lang="{{ LANGUAGE_CODE }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% trans "InterfaceHive API - Developer Platform" %}</title>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            /* Dark mode - Luxury minimalist palette */
            --brand-black: #0a0a0a;
            --brand-accent: hsl(38, 92%, 50%);
            --brand-accent-dark: hsl(32, 95%, 44%);
            --brand-accent-light: hsl(43, 96%, 56%);
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.7);
            --border-subtle: rgba(255, 255, 255, 0.1);
            --border-hover: rgba(255, 255, 255, 0.2);
            --bg-primary: #0a0a0a;
            --bg-secondary: rgba(255, 255, 255, 0.02);
            --bg-card: #0a0a0a;
        }

        [data-theme="light"] {
            /* Light mode palette */
            --brand-black: #ffffff;
            --text-primary: #0a0a0a;
            --text-secondary: rgba(10, 10, 10, 0.7);
            --border-subtle: rgba(10, 10, 10, 0.1);
            --border-hover: rgba(10, 10, 10, 0.2);
            --bg-primary: #ffffff;
            --bg-secondary: rgba(10, 10, 10, 0.02);
            --bg-card: #ffffff;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            min-height: 100vh;
            color: var(--text-primary);
            overflow-x: hidden;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Theme switcher */
        .theme-toggle {
            position: fixed;
            top: 1.5rem;
            right: 1.5rem;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            padding: 0.5rem 0.75rem;
            background: var(--bg-card);
            backdrop-filter: blur(12px);
            border: 1px solid var(--border-subtle);
            color: var(--text-secondary);
            cursor: pointer;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .theme-toggle:hover {
            border-color: var(--brand-accent);
            color: var(--brand-accent);
        }

        /* Marquee banner */
        .marquee-wrapper {
            border-top: 1px solid var(--border-subtle);
            border-bottom: 1px solid var(--border-subtle);
            overflow: hidden;
            position: relative;
            padding: 1.5rem 0;
            background: var(--bg-secondary);
        }

        .marquee {
            display: flex;
            white-space: nowrap;
            animation: marquee 40s linear infinite;
        }

        .marquee-content {
            font-family: 'Oswald', sans-serif;
            font-size: 2rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0 2rem;
            color: var(--text-secondary);
        }

        .marquee-content .highlight {
            color: var(--brand-accent);
        }

        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        .marquee-wrapper::before,
        .marquee-wrapper::after {
            content: '';
            position: absolute;
            top: 0;
            width: 200px;
            height: 100%;
            z-index: 2;
            pointer-events: none;
        }

        .marquee-wrapper::before {
            left: 0;
            background: linear-gradient(to right, var(--bg-primary), transparent);
        }

        .marquee-wrapper::after {
            right: 0;
            background: linear-gradient(to left, var(--bg-primary), transparent);
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }

        /* Header */
        header {
            text-align: center;
            padding: 4rem 0 3rem;
        }

        header h1 {
            font-family: 'Oswald', sans-serif;
            font-size: 5rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand-accent) 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        header .tagline {
            font-family: 'Inter', sans-serif;
            font-size: 1.1rem;
            font-weight: 300;
            font-style: italic;
            color: var(--text-secondary);
            margin-bottom: 2rem;
        }

        .badges {
            display: flex;
            justify-content: center;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-bottom: 3rem;
        }

        .badge {
            font-family: 'Inter', sans-serif;
            padding: 0.5rem 1rem;
            border: 1px solid var(--border-subtle);
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.3s ease;
            color: var(--text-secondary);
        }

        .badge:hover {
            border-color: var(--brand-accent);
            color: var(--brand-accent);
        }

        /* Stats grid */
        .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1px;
            background: var(--border-subtle);
            border: 1px solid var(--border-subtle);
            margin-bottom: 4rem;
        }

        .stat {
            background: var(--bg-card);
            padding: 2rem;
            text-align: center;
            transition: all 0.3s ease;
        }

        .stat:hover {
            background: var(--bg-secondary);
        }

        .stat-number {
            font-family: 'Oswald', sans-serif;
            font-size: 3rem;
            font-weight: 700;
            color: var(--brand-accent);
            display: block;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-family: 'Inter', sans-serif;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-secondary);
            font-weight: 500;
        }

        /* Cards */
        .cards {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1px;
            background: var(--border-subtle);
            border: 1px solid var(--border-subtle);
            margin-bottom: 4rem;
        }

        .card {
            background: var(--bg-card);
            padding: 3rem;
            transition: all 0.5s ease;
            position: relative;
            overflow: hidden;
        }

        .card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%);
            opacity: 0;
            transition: opacity 0.5s ease;
        }

        .card:hover {
            background: var(--bg-secondary);
        }

        .card:hover::before {
            opacity: 1;
        }

        .card-icon {
            font-size: 3rem;
            margin-bottom: 1.5rem;
            display: block;
        }

        .card h2 {
            font-family: 'Oswald', sans-serif;
            font-size: 1.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .card p {
            font-family: 'Inter', sans-serif;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 2rem;
            font-size: 0.95rem;
        }

        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 1px solid var(--border-subtle);
            background: transparent;
            color: var(--text-primary);
            text-decoration: none;
            transition: all 0.3s ease;
            position: relative;
        }

        .btn::after {
            content: '→';
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.3s ease;
        }

        .btn:hover {
            border-color: var(--brand-accent);
            color: var(--brand-accent);
        }

        .btn:hover::after {
            opacity: 1;
            transform: translateX(0);
        }

        .btn-primary {
            background: var(--brand-accent);
            border-color: var(--brand-accent);
            color: var(--brand-black);
        }

        .btn-primary:hover {
            background: var(--brand-accent-light);
            border-color: var(--brand-accent-light);
        }

        .btn-secondary {
            margin-left: 0.75rem;
        }

        /* Features section */
        .features {
            border-top: 1px solid var(--border-subtle);
            border-bottom: 1px solid var(--border-subtle);
            padding: 4rem 0;
            margin-bottom: 4rem;
        }

        .features h2 {
            font-family: 'Oswald', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            margin-bottom: 2rem;
            color: var(--text-primary);
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1px;
            background: var(--border-subtle);
            border: 1px solid var(--border-subtle);
        }

        .feature-item {
            background: var(--bg-card);
            padding: 1.5rem;
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
            color: var(--text-secondary);
            transition: all 0.3s ease;
            border-left: 2px solid transparent;
        }

        .feature-item:hover {
            background: var(--bg-secondary);
            border-left-color: var(--brand-accent);
            color: var(--text-primary);
        }

        .feature-item strong {
            color: var(--brand-accent);
        }

        /* Footer */
        footer {
            border-top: 1px solid var(--border-subtle);
            padding: 3rem 0;
            text-align: center;
            font-family: 'Inter', sans-serif;
            color: var(--text-secondary);
            font-size: 0.875rem;
        }

        footer a {
            color: var(--brand-accent);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        footer a:hover {
            color: var(--brand-accent-light);
        }

        footer p {
            margin: 0.5rem 0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
            .cards {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            header h1 {
                font-size: 3rem;
            }
            .stats {
                grid-template-columns: repeat(2, 1fr);
            }
            .marquee-content {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <!-- Theme switcher -->
    <button class="theme-toggle" id="themeToggle" title="Toggle theme">
        <span id="themeIcon">🌙</span>
    </button>

    <!-- Marquee banner -->
    <div class="marquee-wrapper">
        <div class="marquee">
            <span class="marquee-content">AI-POWERED PLATFORM / <span class="highlight">BUILD. CONTRIBUTE. GROW.</span> / LEARNING-FIRST MARKETPLACE / <span class="highlight">JUST EXECUTION</span> / </span>
            <span class="marquee-content">AI-POWERED PLATFORM / <span class="highlight">BUILD. CONTRIBUTE. GROW.</span> / LEARNING-FIRST MARKETPLACE / <span class="highlight">JUST EXECUTION</span> / </span>
        </div>
    </div>

    <div class="container">
        <header>
            <h1>✨ YOUR PROJECT NAME</h1>
            <p class="tagline">Your project tagline here</p>

            <div class="badges">
                <span class="badge">Django 5.0</span>
                <span class="badge">PostgreSQL 16</span>
                <span class="badge">REST API</span>
                <span class="badge">AI-Powered</span>
                <span class="badge">Real-time</span>
            </div>

            <div class="stats">
                <div class="stat">
                    <span class="stat-number">10+</span>
                    <span class="stat-label">API Endpoints</span>
                </div>
                <div class="stat">
                    <span class="stat-number">08</span>
                    <span class="stat-label">Core Apps</span>
                </div>
                <div class="stat">
                    <span class="stat-number">10</span>
                    <span class="stat-label">Badges</span>
                </div>
                <div class="stat">
                    <span class="stat-number">100%</span>
                    <span class="stat-label">Coverage Goal</span>
                </div>
            </div>
        </header>

        <div class="cards">
            <div class="card">
                <span class="card-icon">⚡</span>
                <h2>Frontend App</h2>
                <p>Visit the web application to explore projects, contribute to the community, and build your developer portfolio.</p>
                <a href="http://localhost:5173" target="_blank" class="btn btn-primary">Open App</a>
            </div>

            <div class="card">
                <span class="card-icon">📊</span>
                <h2>Documentation</h2>
                <p>Comprehensive API documentation with interactive examples, real-time testing, and detailed endpoint specifications.</p>
                <a href="/api/docs/" class="btn btn-primary">Swagger UI</a>
                <a href="/api/redoc/" class="btn btn-secondary">ReDoc</a>
            </div>

            <div class="card">
                <span class="card-icon">⚙️</span>
                <h2>Admin Panel</h2>
                <p>Manage users, projects, contributions, and moderate content through the comprehensive Django admin interface.</p>
                <a href="/admin/" class="btn btn-primary">Django Admin</a>
            </div>

            <div class="card">
                <span class="card-icon">🎯</span>
                <h2>API Schema</h2>
                <p>Access the complete OpenAPI 3.0 schema specification for all RESTful API endpoints and data models.</p>
                <a href="/api/schema/" class="btn btn-primary">OpenAPI Schema</a>
            </div>
        </div>

        <div class="features">
            <h2>Core Features</h2>
            <div class="features-grid">
                <div class="feature-item"><strong>JWT Authentication</strong> with token refresh</div>
                <div class="feature-item"><strong>AI-powered</strong> project generation</div>
                <div class="feature-item"><strong>Multi-dimensional</strong> reputation system</div>
                <div class="feature-item"><strong>Badge system</strong> with milestones</div>
                <div class="feature-item"><strong>Real-time chat</strong> via WebSocket</div>
                <div class="feature-item"><strong>Email notifications</strong> ready</div>
                <div class="feature-item"><strong>Credit-based</strong> reward system</div>
                <div class="feature-item"><strong>Full-text search</strong> (PostgreSQL GIN)</div>
                <div class="feature-item"><strong>Async tasks</strong> with Celery</div>
                <div class="feature-item"><strong>i18n support</strong> multi-language</div>
                <div class="feature-item"><strong>GDPR compliant</strong> data management</div>
                <div class="feature-item"><strong>Moderation tools</strong> for content safety</div>
            </div>
        </div>

        <div class="features">
            <h2>Available Endpoints</h2>
            <div class="features-grid">
                <div class="feature-item"><strong>/api/v1/auth/</strong> - Authentication & registration</div>
                <div class="feature-item"><strong>/api/v1/projects/</strong> - Project CRUD operations</div>
                <div class="feature-item"><strong>/api/v1/contributions/</strong> - Contribution submissions</div>
                <div class="feature-item"><strong>/api/v1/credits/</strong> - Credit system queries</div>
                <div class="feature-item"><strong>/api/v1/badges/</strong> - Achievement badges</div>
                <div class="feature-item"><strong>/api/v1/admin/</strong> - Moderation tools</div>
                <div class="feature-item"><strong>/api/v1/ai/</strong> - AI-assisted features</div>
                <div class="feature-item"><strong>/api/v1/chat/</strong> - Real-time messaging</div>
            </div>
        </div>

        <footer>
            <p>&copy; 2026 Your Project | Built with Django & PostgreSQL</p>
            <p>
                <a href="http://localhost:5173" target="_blank">Frontend App</a> |
                <a href="/api/docs/">API Docs</a> |
                <a href="/admin/">Admin</a> |
                <a href="/api/schema/">Schema</a>
            </p>
        </footer>
    </div>

    <script>
        // Theme toggle functionality
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        const html = document.documentElement;

        // Check for saved theme preference or default to dark mode
        const currentTheme = localStorage.getItem('theme') || 'dark';

        // Apply saved theme on page load
        if (currentTheme === 'light') {
            html.setAttribute('data-theme', 'light');
            themeIcon.textContent = '☀️';
        } else {
            html.removeAttribute('data-theme');
            themeIcon.textContent = '🌙';
        }

        // Toggle theme on button click
        themeToggle.addEventListener('click', () => {
            const isDark = !html.hasAttribute('data-theme') || html.getAttribute('data-theme') === 'dark';

            if (isDark) {
                html.setAttribute('data-theme', 'light');
                themeIcon.textContent = '☀️';
                localStorage.setItem('theme', 'light');
            } else {
                html.removeAttribute('data-theme');
                themeIcon.textContent = '🌙';
                localStorage.setItem('theme', 'dark');
            }
        });
    </script>
</body>
</html>
```

**Customization**: Replace "YOUR PROJECT NAME" and other placeholder text with your actual project information.

---

## Step 5: Create View Functions

### 5.1 Create or Edit config/views.py

Create the file `backend/config/views.py` with this content:

```python
"""
Configuration Views

Views for the main configuration app, including the homepage.
"""
from django.shortcuts import render


def home(request):
    """
    Homepage view displaying system information and links.

    Renders the main landing page with:
    - System introduction
    - API documentation links (Swagger UI, ReDoc)
    - Django admin link
    - Developer information
    - Technology stack
    """
    return render(request, 'home.html')
```

---

## Step 6: Configure URLs

### 6.1 Edit config/urls.py

Open `backend/config/urls.py` and update it to include these routes:

```python
"""
URL configuration for your Django project.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from config.views import home  # Import the home view


urlpatterns = [
    # Homepage
    path('', home, name='home'),

    # Django Admin
    path('admin/', admin.site.urls),

    # API Documentation (OpenAPI/Swagger)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1 endpoints (adjust these paths to match your apps)
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    # Add other API routes as needed...
]
```

**Note**: Adjust the `path('api/v1/...')` lines to match your actual Django apps and URL configurations.

---

## Step 7: Configure Swagger Settings

### 7.1 Edit config/settings.py

Open `backend/config/settings.py` and add these configurations:

#### Add drf-spectacular to INSTALLED_APPS

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'drf_spectacular',  # ADD THIS LINE
    'corsheaders',
    # ... other third-party apps

    # Your apps
    'apps.users',
    'apps.projects',
    # ... other apps
]
```

#### Configure Django REST Framework to use drf-spectacular

Add or update the `REST_FRAMEWORK` setting:

```python
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',  # ADD THIS
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    # ... other settings
}
```

#### Add Spectacular Settings

Add this configuration block anywhere in `settings.py`:

```python
# OpenAPI/Swagger Configuration (drf-spectacular)
SPECTACULAR_SETTINGS = {
    'TITLE': 'Your Project API',
    'DESCRIPTION': 'API documentation for your Django project',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': r'/api/v1',
}
```

#### Configure Templates Directory

Ensure the `TEMPLATES` setting includes your templates directory:

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'config' / 'templates',  # ADD THIS LINE
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

---

## Step 8: Test the Server

### 8.1 Run the Development Server

```bash
# Make sure you're in the backend directory with venv activated
python manage.py runserver
```

Expected output:
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
January 22, 2026 - 10:00:00
Django version 5.0.1, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### 8.2 Test the Homepage

Open your browser and navigate to:
```
http://localhost:8000/
```

You should see:
- Luxury minimalist dark theme homepage
- Marquee banner scrolling at the top
- Stats grid with numbers
- 4 cards (Frontend App, Documentation, Admin Panel, API Schema)
- Features grid
- Available endpoints grid
- Theme toggle button (top-right) to switch between dark/light mode

### 8.3 Test Swagger UI

Navigate to:
```
http://localhost:8000/api/docs/
```

You should see:
- Swagger UI interface with all your API endpoints
- Endpoints organized by tags/modules
- "Authorize" button at the top for JWT authentication
- Expandable endpoint documentation with schemas

### 8.4 Test ReDoc

Navigate to:
```
http://localhost:8000/api/redoc/
```

You should see:
- Clean, readable API documentation
- Left sidebar with endpoint navigation
- Request/response schemas
- Example values

### 8.5 Test API Schema

Navigate to:
```
http://localhost:8000/api/schema/
```

You should see:
- Raw OpenAPI 3.0 schema in JSON/YAML format
- Can be downloaded and imported into other tools (Postman, Insomnia, etc.)

---

## Step 9: Customization Options

### 9.1 Change Brand Colors

Edit `home.html` and modify the CSS variables in the `:root` section:

```css
:root {
    --brand-accent: hsl(38, 92%, 50%);  /* Change this to your brand color */
}
```

Popular alternatives:
- Blue: `hsl(220, 90%, 56%)`
- Purple: `hsl(280, 90%, 56%)`
- Green: `hsl(140, 90%, 45%)`
- Red: `hsl(0, 90%, 56%)`

### 9.2 Update Project Information

In `home.html`, replace these placeholders:
- `✨ YOUR PROJECT NAME` → Your actual project name
- `Your project tagline here` → Your tagline
- Update the stats numbers to match your project
- Update the features list to match your actual features
- Update the endpoints list to match your API routes

### 9.3 Change Fonts

Replace the Google Fonts link in `home.html`:

```html
<!-- Current fonts: Oswald + Inter -->
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- Example alternatives: -->
<!-- Roboto + Open Sans -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Then update the CSS:
```css
/* Change Oswald to your heading font */
font-family: 'Roboto', sans-serif;

/* Change Inter to your body font */
font-family: 'Open Sans', sans-serif;
```

### 9.4 Add More API Endpoints to Swagger

To add more endpoints to Swagger UI, simply create views using Django REST Framework:

```python
# Example: apps/projects/views.py
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view

@extend_schema_view(
    list=extend_schema(description="List all projects"),
    create=extend_schema(description="Create a new project"),
)
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
```

### 9.5 Add Authentication to Swagger

To test authenticated endpoints in Swagger:

1. Add JWT configuration in `settings.py`:
```python
SPECTACULAR_SETTINGS = {
    # ... existing settings
    'SWAGGER_UI_SETTINGS': {
        'persistAuthorization': True,  # Keep auth between page refreshes
    },
    'APPEND_COMPONENTS': {
        'securitySchemes': {
            'bearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
            }
        }
    },
    'SECURITY': [{'bearerAuth': []}],
}
```

2. In Swagger UI, click "Authorize" and enter: `Bearer <your_token>`

### 9.6 Add Custom Admin Dashboard

Create `backend/config/templates/admin/dashboard.html` for a custom admin stats page (optional).

---

## Verification Checklist

After completing all steps, verify:

- [ ] `http://localhost:8000/` shows the homepage
- [ ] Homepage displays in dark mode by default
- [ ] Theme toggle button switches between dark/light modes
- [ ] Marquee banner scrolls continuously
- [ ] All 4 cards are visible and clickable
- [ ] `http://localhost:8000/api/docs/` shows Swagger UI
- [ ] Swagger UI displays your API endpoints
- [ ] `http://localhost:8000/api/redoc/` shows ReDoc interface
- [ ] `http://localhost:8000/api/schema/` returns JSON schema
- [ ] No console errors in browser developer tools
- [ ] No errors in Django server terminal

---

## Troubleshooting

### Homepage shows "TemplateDoesNotExist: home.html"

**Solution**: Verify the template path in `TEMPLATES['DIRS']` in `settings.py`:
```python
'DIRS': [BASE_DIR / 'config' / 'templates'],
```

### Swagger UI shows 404 error

**Solution**: Check that `drf_spectacular` is in `INSTALLED_APPS` and `DEFAULT_SCHEMA_CLASS` is set in `REST_FRAMEWORK`.

### No endpoints appear in Swagger UI

**Solution**: Ensure your API views are using Django REST Framework's `ViewSet`, `APIView`, or generic views. Regular Django views won't appear.

### Theme toggle doesn't work

**Solution**: Check browser console for JavaScript errors. Ensure the script tag is present at the bottom of `home.html`.

### Styles don't load

**Solution**: The styles are embedded in the HTML template. If they're not loading, check that the `<style>` tag is present in the `<head>` section.

---

## Final Result

After following this guide, you will have:

1. ✅ A beautiful, responsive homepage at `http://localhost:8000/`
2. ✅ Dark/light theme toggle with localStorage persistence
3. ✅ Interactive Swagger UI at `http://localhost:8000/api/docs/`
4. ✅ Clean ReDoc interface at `http://localhost:8000/api/redoc/`
5. ✅ Downloadable OpenAPI schema at `http://localhost:8000/api/schema/`
6. ✅ Luxury minimalist design inspired by modern fintech platforms
7. ✅ Fully functional Django backend server on port 8000

**Design Philosophy**: Clean borders, subtle animations, premium dark/light themes, minimalist luxury aesthetic.

**Next Steps**: Customize the homepage content, add your API endpoints, configure JWT authentication, and deploy to production!
