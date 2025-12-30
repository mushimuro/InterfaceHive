# InterfaceHive

**A platform connecting builders with contributors for open-source and real-world projects.**

InterfaceHive enables hosts to publish contribution requests and contributors to submit work, with a credit-based reputation system that awards credits when contributions are accepted.

## Features

- **🔐 Authentication:** JWT-based authentication with email verification
- **📋 Project Management:** Create, edit, and manage contribution requests
- **🔍 Project Discovery:** Full-text search with PostgreSQL GIN index, tag filtering
- **💬 Contribution System:** Submit work, review submissions, accept/decline decisions
- **⭐ Credit System:** Atomic credit transactions with audit trail (max 1 credit per user/project)
- **♿ Accessibility:** WCAG 2.1 Level AA compliance
- **🔒 GDPR Compliant:** User data deletion and export rights
- **📱 Responsive:** Desktop-first design, mobile-compatible

## Tech Stack

### Backend
- **Framework:** Django 5.0 + Django REST Framework 3.14
- **Database:** PostgreSQL 15 with full-text search (GIN indexes)
- **Authentication:** JWT via djangorestframework-simplejwt
- **Task Queue:** Celery + Redis (email sending, GDPR anonymization)
- **Caching:** Redis
- **API Docs:** drf-spectacular (OpenAPI 3.0)

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **UI Components:** shadcn/ui (Radix primitives) + Tailwind CSS
- **Routing:** React Router
- **State Management:** TanStack Query (server state) + React Context
- **Forms:** react-hook-form + zod
- **HTTP Client:** axios

## Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 20+**
- **PostgreSQL 15+**
- **Redis 7+**
- **Git**

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Note: psycopg2-binary requires PostgreSQL to be installed
# If you encounter issues, install PostgreSQL first

# Set up environment variables
cp .env.example .env  # Edit with your database credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env  # Edit with your API URL

# Start development server
npm run dev
```

### Database Setup (Docker)

```bash
# Start PostgreSQL
docker run -d \
  --name interfacehive-postgres \
  -e POSTGRES_DB=interfacehive \
  -e POSTGRES_USER=interfacehive \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  postgres:15

# Start Redis
docker run -d \
  --name interfacehive-redis \
  -p 6379:6379 \
  redis:7
```

### Celery Worker (Optional for Email)

```bash
cd backend
source venv/bin/activate

# Start Celery worker
celery -A config worker --loglevel=info

# Start Celery Beat (scheduled tasks)
celery -A config beat --loglevel=info
```

## Project Structure

```
InterfaceHive/
├── backend/                 # Django backend
│   ├── apps/               # Django apps
│   │   ├── users/         # Authentication & user management
│   │   ├── projects/      # Project creation & management
│   │   ├── contributions/ # Contribution submission & review
│   │   └── credits/       # Credit system & ledger
│   ├── config/            # Django settings & configuration
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/          # API client & endpoints
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── schemas/      # Zod validation schemas
│   │   └── lib/          # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
└── specs/                  # Feature specifications & planning
    └── 001-platform-mvp/
        ├── spec.md         # Feature specification
        ├── plan.md         # Implementation plan
        ├── tasks.md        # Task breakdown
        ├── data-model.md   # Database schema
        ├── research.md     # Technical decisions
        ├── quickstart.md   # Developer guide
        └── contracts/
            └── openapi.yaml # API specification
```

## API Documentation

Once the backend is running, API documentation is available at:

- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **OpenAPI Schema:** http://localhost:8000/api/schema/

## Development Workflow

### Phase 1: Setup (Complete ✅)
- Backend: Django + Celery + Redis configuration
- Frontend: Vite + React + TypeScript + shadcn/ui
- Documentation: README, .gitignore, configuration files

### Phase 2: Foundation (Next)
- Core models (User, Project, Contribution, CreditLedgerEntry)
- Database migrations & indexes
- Shared services & utilities

### Phase 3+: Feature Implementation
- FR-1: Authentication & Registration
- FR-3: Project Management
- FR-4: Project Discovery & Search
- FR-5/6: Project Detail & Contribution Submission
- FR-7/9: Review & Credits (Critical - atomic transactions)

## Testing

### Backend
```bash
cd backend
pytest
pytest --cov  # Coverage report (target: >= 70%)
```

### Frontend
```bash
cd frontend
npm test
npm run test:coverage
```

### E2E Tests
```bash
npx playwright test
```

## Performance Targets

- **Initial page load:** < 3 seconds
- **API response time (p95):** < 3 seconds
- **Full-text search:** < 100ms with GIN index
- **Concurrent users:** 500 without performance degradation

## Security

- JWT authentication with 1-hour access tokens, 7-day refresh tokens
- CSRF protection on all state-changing operations
- Rate limiting: 10 projects/hour, 20 contributions/hour per user
- Input validation and sanitization
- SQL injection prevention (Django ORM)
- XSS prevention (output escaping)

## Contributing

1. Follow the task breakdown in `specs/001-platform-mvp/tasks.md`
2. Ensure >= 70% test coverage (100% for critical paths)
3. All code must pass linters (ESLint/Prettier for frontend, Black/Flake8 for backend)
4. Follow the InterfaceHive Constitution (code quality, test coverage, UX, performance)

## License

[License TBD]

## Support

For questions or issues, please refer to:
- **Specifications:** `specs/001-platform-mvp/`
- **API Docs:** http://localhost:8000/api/docs/
- **Implementation Guide:** `specs/001-platform-mvp/quickstart.md`

---

**Built with ❤️ for the open-source community**

