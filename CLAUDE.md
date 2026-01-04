# CLAUDE.md - InterfaceHive Project Guide

## Project Overview

InterfaceHive is a **contribution marketplace platform** that connects project hosts with contributors. Hosts publish "calls for contribution" and contributors submit work, with an integrated credit-based reputation system.

**Current Status:** MVP Implementation (Branch: `001-platform-mvp`)

## Tech Stack

### Backend
- **Framework:** Django 5.0 + Django REST Framework 3.14
- **Database:** PostgreSQL 16 with full-text search (GIN indexes)
- **Auth:** JWT via djangorestframework-simplejwt
- **Task Queue:** Celery 5.3 + Redis 7
- **Real-time:** Django Channels 4.0 + Daphne (WebSocket)
- **Python:** 3.11+

### Frontend
- **Framework:** React 19 + TypeScript 5.9
- **Build:** Vite 7.2
- **UI:** shadcn/ui (Radix) + Tailwind CSS 3.4
- **State:** TanStack React Query 5.90
- **Forms:** react-hook-form + zod validation

## Project Structure

```
InterfaceHive/
├── backend/
│   ├── apps/
│   │   ├── users/          # Auth & user management
│   │   ├── projects/       # Project CRUD & search
│   │   ├── contributions/  # Submission & review workflow
│   │   ├── credits/        # Credit ledger system
│   │   ├── moderation/     # Admin tools & audit logs
│   │   ├── chat/           # WebSocket messaging
│   │   └── ai_agent/       # AI-assisted features
│   ├── config/             # Django settings, URLs, Celery
│   ├── core/               # Shared utilities (pagination, responses)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client & endpoint modules
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route page components
│   │   ├── contexts/       # React Context (AuthContext)
│   │   ├── hooks/          # Custom hooks
│   │   └── schemas/        # Zod validation schemas
│   └── package.json
├── specs/                  # Feature specifications & docs
└── docker-compose.yml      # PostgreSQL + Redis
```

## Common Commands

### Backend
```bash
cd backend
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver    # http://localhost:8000
celery -A config worker -l info  # Task worker (separate terminal)
pytest                        # Run tests
pytest --cov                  # Coverage report
```

### Frontend
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
npm run build                 # Production build
npm run lint                  # ESLint check
```

### Docker (Database)
```bash
docker-compose up -d          # Start PostgreSQL + Redis
# Postgres: localhost:5432 (interfacehive_user / interfacehive_dev_password)
# Redis: localhost:6379
```

## API Structure

Base URL: `/api/v1/`

| Resource | Endpoints |
|----------|-----------|
| `/auth/` | register, login, refresh, logout, profile |
| `/projects/` | CRUD, search, close |
| `/contributions/` | create, accept, decline |
| `/credits/` | balance, ledger |
| `/admin/` | moderation tools |
| `/chat/` | WebSocket messaging |

**Auth:** JWT Bearer token in `Authorization: Bearer <token>` header

## Key Models

1. **User** - UUID PK, email-based auth, profile fields, GDPR compliance
2. **Project** - Host's contribution request with full-text search
3. **Contribution** - Submissions with status (pending/accepted/declined)
4. **CreditLedgerEntry** - Immutable append-only credit transactions
5. **ModerationLog** - Immutable audit trail for admin actions
6. **ChatMessage** - Project-level real-time messages

## Critical Constraints

1. **Credit Ledger is Immutable** - Entries cannot be updated/deleted, only reversals
2. **One Credit Per Project Per User** - Unique constraint prevents double-crediting
3. **Contribution Decisions are Final** - pending → accepted/declined is one-way
4. **Email Verification Required** - Before creating projects or contributing
5. **GDPR 30-Day Retention** - Soft delete with anonymization after 30 days
6. **No Hard Deletes** - All deletions are soft for audit trail preservation

## Code Style

### Backend
- **Formatter:** Black (line length 100)
- **Imports:** isort (black-compatible)
- **Linting:** Flake8
- Config in `pyproject.toml`

### Frontend
- **Linting:** ESLint 9 + typescript-eslint
- **Formatting:** Prettier
- **TypeScript:** Strict mode enabled

## Testing

### Backend
```bash
pytest                        # All tests
pytest -v apps/projects/      # Specific app
pytest --cov                  # With coverage
```

### Frontend
```bash
npm test                      # When configured
```

## Environment Variables

### Backend (.env)
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Cache/Celery broker
- `CORS_ALLOWED_ORIGINS` - Frontend URLs

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)

## Documentation

| Document | Location |
|----------|----------|
| PRD | `/prd.md` |
| System Architecture | `/system_architecture.md` |
| Feature Spec | `/specs/001-platform-mvp/spec.md` |
| Data Model | `/specs/001-platform-mvp/data-model.md` |
| API Contract | `/specs/001-platform-mvp/contracts/openapi.yaml` |
| Quick Start | `/specs/001-platform-mvp/quickstart.md` |
