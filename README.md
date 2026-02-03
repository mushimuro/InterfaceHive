# InterfaceHive

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

**A Premium Collective Intelligence Hub connecting project visionaries with elite contributors.**

InterfaceHive is a state-of-the-art platform where project specifications meet elite execution. Deploy contribution requests, earn reputation credits, and architect the future through merit-based collaboration, all within a high-performance "Hive" ecosystem.

## Live Deploy🔗

- [**Frontend Application**](http://52.15.96.127/)
- [**Backend API**](http://52.15.96.127:8000/)
- [**API Documentation (Swagger)**](http://52.15.96.127:8000/api/docs/)


[Documentation](./docs) | [Report Bug](https://github.com/mushimuro/InterfaceHive/issues) | [Request Feature](https://github.com/mushimuro/InterfaceHive/issues)

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About

### The Problem

In the modern development landscape, brilliant project ideas often struggle to find skilled contributors, while talented developers search for meaningful projects to showcase their abilities. Traditional platforms lack:
- Merit-based reputation systems
- AI-assisted project specification generation
- Real-time collaboration tools
- Fair credit attribution

### The Solution

InterfaceHive bridges this gap by creating a premium ecosystem where:
- **Project Hosts** can deploy detailed specifications and AI-generated project templates
- **Contributors** can discover opportunities matching their skills and earn reputation credits
- **Collaboration** happens seamlessly through integrated real-time chat and project management
- **Merit** is tracked and rewarded through a transparent credit system

### Why I Built This

InterfaceHive was born from the need to create a professional-grade platform that combines modern web technologies with AI capabilities, demonstrating full-stack development excellence while solving real collaboration challenges.

## Features

### Core Functionality
-  **AI-Powered Project Generation:** Generate complete project specifications from ideas or GitHub repositories using Google Gemini AI
-  **Project Templates:** Browse AI-generated project templates for inspiration
-  **Contribution Requests:** Submit and manage contribution requests with acceptance/rejection workflows
-  **Credit System:** Earn reputation credits for accepted contributions
-  **Real-Time Chat:** WebSocket-powered chat rooms for project collaboration
-  **Full-Text Search:** PostgreSQL GIN-indexed search across projects
-  **Tag System:** Categorize and filter projects by skills and technologies

### Premium User Experience
-  **Glassmorphic Design:** High-end UI with frosted glass effects and smooth gradients
-  **GSAP Animations:** Fluid, staggered animations for professional polish
-  **i18n Support:** Full internationalization with English and Japanese
-  **Responsive Design:** Optimized for desktop, tablet, and mobile
-  **Email Verification:** Secure account activation with token-based verification
-  **User Profiles:** Public and private profile management

### Developer Features
-  **RESTful API:** Comprehensive Django REST Framework API
-  **JWT Authentication:** Secure token-based authentication
-  **Admin Dashboard:** Django admin interface for project management
-  **Type Safety:** Full TypeScript implementation on frontend
-  **Form Validation:** react-hook-form + Zod schemas

##  Tech Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS + Custom Glassmorphism Design System
- **UI Components:** shadcn/ui (Radix Primitives)
- **State Management:** TanStack Query v5
- **Forms:** react-hook-form + Zod validation
- **Animation:** GSAP (GreenSock)
- **Icons:** Lucide React
- **i18n:** react-i18next

### Backend
- **Framework:** Django 5.0 + Django REST Framework
- **Database:** PostgreSQL 16 (with full-text search)
- **Cache:** Redis 7
- **Real-time:** Django Channels + Daphne (WebSockets)
- **Task Queue:** Celery 5.3
- **Authentication:** SimpleJWT
- **AI Integration:** Google Generative AI (Gemini 2.5 Flash)
- **Email:** SMTP configuration

### DevOps & Infrastructure
- **Containerization:** Docker + Docker Compose
- **Database:** PostgreSQL with GIN indexes
- **Caching:** Redis for sessions and Celery
- **CORS:** django-cors-headers

##  Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 16+
- **Redis** 7+ (optional for full features)
- **Docker** (optional, but recommended)

### Installation

#### Option 1: Docker (Recommended for Services)

```bash
# Clone the repository
git clone https://github.com/mushimuro/InterfaceHive.git
cd InterfaceHive

# Start PostgreSQL and Redis with Docker Compose
docker compose up -d

# Services will be available:
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

#### Option 2: Local Development (Full Setup)

**1. Clone and setup:**
```bash
git clone https://github.com/mushimuro/InterfaceHive.git
cd InterfaceHive
```

**2. Backend setup:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Configuration section)
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

**3. Frontend setup (in new terminal):**
```bash
cd frontend

# Install dependencies
npm install

# Create .env file (see Configuration section)
# Add your configuration

# Start development server
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/v1
- **API Documentation:** http://localhost:8000/api/docs
- **Admin Panel:** http://localhost:8000/admin

### Configuration

#### Environment Variables

**Backend (.env):**
```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://interfacehive_user:interfacehive_dev_password@localhost:5432/interfacehive

# Redis
REDIS_URL=redis://localhost:6379/0

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@interfacehive.com

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
GEMINI_API_KEY=your-gemini-api-key
```

#### Getting API Keys

**Google Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to both backend and frontend `.env` files

##  Usage

### For Project Hosts

**1. Create a Project:**
- Navigate to "Create Project"
- Fill in project details manually, or use AI assistance:
  - Generate from GitHub repository URL
  - Generate from project idea description
  - Generate random project template

**2. Manage Contributions:**
- View contribution requests on your project page
- Accept or decline contributions
- Chat with accepted contributors in real-time
- Share resources and notes in the Implementation tab

### For Contributors

**1. Discover Projects:**
- Browse projects on the main Projects page
- Filter by difficulty, status, tags, or search
- Explore AI-generated templates for inspiration

**2. Request to Join:**
- Click on a project
- Go to "Request to Join" tab
- Submit your contribution request with details
- Wait for host approval

**3. Collaborate:**
- Once accepted, access project chat
- View shared resources and implementation notes
- Earn credits when your work is recognized

### AI Features

**Generate from GitHub Repository:**
```
1. Go to "Create Project"
2. Enter GitHub repository URL
3. AI analyzes README and generates project specification
```

**Generate from Idea:**
```
1. Go to "Create Project"
2. Describe your project idea
3. AI creates detailed specification
```

**Generate Random Template:**
```
1. Navigate to "Generate AI Project"
2. Click "Generate Random Project"
3. AI creates unique project idea
4. View in "Templates" section
```

##  API Documentation

### Authentication

All protected API requests require JWT authentication:

```bash
# Register
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "display_name": "John Doe"
}

# Login
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

# Use token in requests
GET /api/v1/projects/
Authorization: Bearer <your-access-token>
```

### Main Endpoints

#### Projects
```
GET    /api/v1/projects/              - List all projects (paginated)
POST   /api/v1/projects/              - Create project (auth required)
GET    /api/v1/projects/:id/          - Get project details
PATCH  /api/v1/projects/:id/          - Update project (host only)
DELETE /api/v1/projects/:id/          - Delete project (host only)
GET    /api/v1/projects/my-projects/  - Get user's projects
```

#### Contributions
```
GET    /api/v1/contributions/projects/:id/  - List project contributions
POST   /api/v1/contributions/projects/:id/  - Submit contribution request
PATCH  /api/v1/contributions/:id/           - Update contribution
DELETE /api/v1/contributions/:id/           - Delete contribution
POST   /api/v1/contributions/:id/accept/    - Accept contribution (host)
POST   /api/v1/contributions/:id/decline/   - Decline contribution (host)
```

#### AI Generation
```
POST /api/v1/ai/generate-from-repo/    - Generate from GitHub URL
POST /api/v1/ai/generate-from-idea/    - Generate from idea
POST /api/v1/ai/generate-random/       - Generate random project
```

**Full API documentation:**
- **Local:** http://localhost:8000/api/docs/
- **Production:** http://52.15.96.127:8000/api/docs/

##  Architecture

### System Architecture

```
┌─────────────────────┐
│   React SPA         │
│   (Frontend)        │
│   - Vite + React    │
│   - TanStack Query  │
│   - GSAP Animations │
└──────────┬──────────┘
           │
           │ HTTP/REST + WebSocket
           │
┌──────────▼──────────┐
│   Django API        │
│   (Backend)         │
│   - DRF             │
│   - Channels        │
│   - Celery          │
└──────────┬──────────┘
           │
           ├─────► PostgreSQL (Primary Database)
           ├─────► Redis (Cache + WebSocket)
           └─────► Google Gemini AI (Project Generation)
```

### Database Schema

**Core Models:**
- **User:** Custom user model with email verification
- **Project:** Project specifications with full-text search
- **Contribution:** Contribution requests and status tracking
- **CreditLedgerEntry:** Transaction log for reputation credits
- **ProjectTag:** Skill and technology tags
- **ChatMessage:** Real-time chat messages

### Key Design Decisions

**Why Django + React?**
- Django provides robust ORM, admin interface, and security features
- React offers component-based architecture and excellent performance
- Clear separation of concerns between backend logic and frontend presentation

**Why PostgreSQL over MySQL?**
- Superior full-text search capabilities with GIN indexes
- Better JSON field support for flexible data structures
- Advanced indexing options for complex queries

**Why TanStack Query?**
- Intelligent caching and background refetching
- Automatic request deduplication
- Optimistic updates for better UX

**Why GSAP over CSS animations?**
- More precise control over complex animations
- Better performance for staggered animations
- Timeline-based animation sequences

## Testing

### Running Tests

**Backend:**
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov

# Run specific test module
pytest apps/users/tests/
```

**Frontend:**
```bash
cd frontend

# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Structure

```
backend/apps/
├── users/tests/
├── projects/tests/
└── contributions/tests/

frontend/src/
├── components/__tests__/
└── pages/__tests__/
```

##  Deployment

### Production Checklist

**Backend:**
```bash
# Set production environment variables
DEBUG=False
ALLOWED_HOSTS=your-domain.com
SECRET_KEY=<strong-random-key>

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Use production-grade server
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

**Frontend:**
```bash
# Build for production
npm run build

# Output in dist/ folder
# Deploy to hosting service (Vercel, Netlify, AWS S3, etc.)
```

### Deployment Options

- **Backend:** AWS EC2, DigitalOcean, Heroku, Railway
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Database:** AWS RDS, DigitalOcean Managed Databases
- **Full Stack:** Docker deployment on cloud VPS

##  Contact

**Project Link:** [https://github.com/mushimuro/InterfaceHive](https://github.com/mushimuro/InterfaceHive)

**Issue Tracker:** [GitHub Issues](https://github.com/mushimuro/InterfaceHive/issues)

##  Acknowledgments

Built with amazing technologies:
- [Django](https://www.djangoproject.com/) - The web framework for perfectionists
- [React](https://react.dev/) - A JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [GSAP](https://greensock.com/) - Professional-grade animation library
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Google Gemini](https://ai.google.dev/) - Advanced AI capabilities
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization

---

<div align="center">

Made with ❤️ by the InterfaceHive Community

If you found this project helpful, please consider giving it a ⭐!

[⬆ Back to Top](#interfacehive)

</div>
