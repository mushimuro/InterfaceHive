# InterfaceHive Backend Architecture

## Overview
A robust Django-based REST API with real-time capabilities, designed for a contribution marketplace platform connecting project hosts with contributors.

---

## Technology Stack

### Core Framework
- **Django 5.0** - High-level Python web framework
- **Django REST Framework 3.14** - Powerful REST API toolkit
- **Python 3.11+** - Modern Python with performance improvements

### Database & Caching
- **PostgreSQL 16** - Advanced relational database
- **Redis 7** - In-memory cache and message broker
- **psycopg2** - PostgreSQL adapter

### Asynchronous Processing
- **Celery 5.3** - Distributed task queue
- **Django Channels 4.0** - WebSocket support for real-time features
- **Daphne** - ASGI server for Channels

### Authentication
- **djangorestframework-simplejwt** - JWT authentication
- **Email Verification** - Custom implementation

### Additional Tools
- **django-cors-headers** - CORS handling
- **Pillow** - Image processing
- **pytest** - Testing framework

---

## Project Structure

```
backend/
├── apps/                       # Django Applications
│   ├── users/                  # User Management
│   │   ├── models.py           # Custom User model
│   │   ├── serializers.py      # User serialization
│   │   ├── views.py            # Auth endpoints
│   │   └── services.py         # Business logic
│   │
│   ├── projects/               # Project Management
│   │   ├── models.py           # Project model
│   │   ├── serializers.py      # Project serialization
│   │   ├── views.py            # CRUD + search endpoints
│   │   ├── filters.py          # Search/filter logic
│   │   └── services.py         # Business logic
│   │
│   ├── contributions/          # Contribution Workflow
│   │   ├── models.py           # Contribution model
│   │   ├── serializers.py      # Contribution serialization
│   │   ├── views.py            # Submit/review endpoints
│   │   ├── signals.py          # Auto-credit on accept
│   │   └── services.py         # Business logic
│   │
│   ├── credits/                # Credit System
│   │   ├── models.py           # CreditLedgerEntry (immutable)
│   │   ├── serializers.py      # Credit serialization
│   │   ├── views.py            # Balance/ledger endpoints
│   │   └── services.py         # Credit operations
│   │
│   ├── moderation/             # Admin & Moderation
│   │   ├── models.py           # ModerationLog (immutable)
│   │   ├── views.py            # Admin tools
│   │   └── services.py         # Moderation actions
│   │
│   ├── chat/                   # Real-time Chat
│   │   ├── models.py           # ChatMessage model
│   │   ├── consumers.py        # WebSocket consumers
│   │   ├── routing.py          # WebSocket routing
│   │   └── serializers.py      # Message serialization
│   │
│   └── ai_agent/               # AI Features (Future)
│       ├── models.py           # AI interaction models
│       └── services.py         # AI integration logic
│
├── config/                     # Project Configuration
│   ├── settings/
│   │   ├── base.py             # Base settings
│   │   ├── development.py      # Dev settings
│   │   └── production.py       # Prod settings
│   ├── urls.py                 # URL routing
│   ├── wsgi.py                 # WSGI application
│   ├── asgi.py                 # ASGI application (WebSockets)
│   └── celery.py               # Celery configuration
│
├── core/                       # Shared Utilities
│   ├── pagination.py           # Custom pagination classes
│   ├── responses.py            # Standardized API responses
│   ├── permissions.py          # Custom permissions
│   └── middleware.py           # Custom middleware
│
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── pytest.ini                  # Pytest configuration
└── pyproject.toml              # Python project config
```

---

## Architecture Patterns

### 1. Layered Architecture

```
API Layer (Views)
    ↓
Serialization Layer (DRF Serializers)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (Models + ORM)
    ↓
Database (PostgreSQL)
```

### 2. Service Layer Pattern
- **Views** handle HTTP requests/responses only
- **Services** contain all business logic
- **Models** define data structure and database operations
- **Serializers** handle validation and data transformation

### 3. Signal-Driven Events
```python
# Example: Auto-credit on contribution acceptance
@receiver(post_save, sender=Contribution)
def award_credit_on_acceptance(sender, instance, **kwargs):
    if instance.status == 'accepted':
        CreditService.award_credit(instance)
```

---

## Application Architecture

### 1. Users App (Authentication & Profiles)

#### Features
- Custom User model (UUID primary key)
- Email-based authentication
- JWT token management
- Email verification system
- GDPR compliance (soft delete + anonymization)

#### Key Models
```python
User:
  - id (UUID)
  - email (unique)
  - username
  - profile fields (bio, avatar, location)
  - is_email_verified
  - deleted_at (soft delete)
```

#### Endpoints
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - JWT token acquisition
- `POST /api/v1/auth/refresh/` - Token refresh
- `POST /api/v1/auth/logout/` - Token blacklist
- `GET /api/v1/auth/profile/` - User profile
- `PATCH /api/v1/auth/profile/` - Update profile

---

### 2. Projects App (Contribution Requests)

#### Features
- CRUD operations for projects
- Full-text search (PostgreSQL GIN indexes)
- Advanced filtering (status, tags, date range)
- Project closure workflow
- Owner-only edit/delete

#### Key Models
```python
Project:
  - id (UUID)
  - host (FK to User)
  - title
  - description
  - tags (ArrayField)
  - requirements
  - status (open/in_progress/completed/cancelled)
  - created_at, updated_at
  - search_vector (tsvector for full-text search)
```

#### Endpoints
- `GET /api/v1/projects/` - List/search projects
- `POST /api/v1/projects/` - Create project
- `GET /api/v1/projects/{id}/` - Project detail
- `PATCH /api/v1/projects/{id}/` - Update project
- `DELETE /api/v1/projects/{id}/` - Delete project
- `POST /api/v1/projects/{id}/close/` - Close project

#### Search Implementation
```python
# Full-text search on title + description
search_vector = SearchVector('title', weight='A') + \
                SearchVector('description', weight='B')
queryset = Project.objects.annotate(
    search=search_vector
).filter(search=SearchQuery(query))
```

---

### 3. Contributions App (Submission Workflow)

#### Features
- Contribution submission
- Host review (accept/decline)
- One contribution per project per user
- Auto-credit on acceptance (via signals)
- Immutable decision (no status changes after review)

#### Key Models
```python
Contribution:
  - id (UUID)
  - project (FK to Project)
  - contributor (FK to User)
  - content
  - submission_url
  - status (pending/accepted/declined)
  - submitted_at
  - reviewed_at
  - unique_together: [project, contributor]
```

#### Endpoints
- `POST /api/v1/contributions/` - Submit contribution
- `GET /api/v1/contributions/` - List contributions
- `POST /api/v1/contributions/{id}/accept/` - Accept (host only)
- `POST /api/v1/contributions/{id}/decline/` - Decline (host only)

#### Business Rules
1. Email verification required to contribute
2. Cannot contribute to own projects
3. One contribution per project per user
4. Status changes are one-way (pending → accepted/declined)
5. Auto-award 1 credit on acceptance

---

### 4. Credits App (Reputation System)

#### Features
- Immutable append-only ledger
- Credit balance calculation
- Transaction history
- Reversal support (new entry, not update)
- One credit per project constraint

#### Key Models
```python
CreditLedgerEntry:
  - id (UUID)
  - user (FK to User)
  - amount (Decimal)
  - transaction_type (award/penalty/reversal)
  - reason
  - contribution (FK, nullable)
  - project (FK, nullable)
  - created_at
  - unique_together: [user, project] (for awards)
```

#### Endpoints
- `GET /api/v1/credits/balance/` - User's current balance
- `GET /api/v1/credits/ledger/` - Transaction history

#### Business Logic
```python
class CreditService:
    @staticmethod
    def award_credit(contribution):
        # Idempotent: check if already credited
        if CreditLedgerEntry.objects.filter(
            user=contribution.contributor,
            project=contribution.project
        ).exists():
            return

        CreditLedgerEntry.objects.create(
            user=contribution.contributor,
            amount=Decimal('1.00'),
            transaction_type='award',
            contribution=contribution,
            project=contribution.project
        )
```

---

### 5. Moderation App (Admin Tools)

#### Features
- Content flagging and review
- User suspension/ban
- Immutable audit logs
- Admin-only access

#### Key Models
```python
ModerationLog:
  - id (UUID)
  - moderator (FK to User)
  - action (flag/suspend/ban/delete)
  - target_user (FK to User, nullable)
  - target_project (FK to Project, nullable)
  - reason
  - created_at
```

#### Endpoints
- `POST /api/v1/admin/flag/` - Flag content
- `POST /api/v1/admin/suspend/` - Suspend user
- `GET /api/v1/admin/logs/` - Audit trail

---

### 6. Chat App (Real-time Messaging)

#### Features
- WebSocket-based real-time chat
- Project-scoped conversations
- Message persistence
- Online presence (future)

#### Key Models
```python
ChatMessage:
  - id (UUID)
  - project (FK to Project)
  - sender (FK to User)
  - content
  - created_at
```

#### WebSocket Flow
```python
# consumers.py
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Join project room

    async def receive(self, text_data):
        # Broadcast to room

    async def disconnect(self):
        # Leave room
```

#### Endpoint
- `ws://localhost:8000/ws/chat/{project_id}/` - WebSocket connection

---

## API Design Principles

### 1. RESTful Conventions
- Resource-based URLs (`/projects/`, not `/get_projects/`)
- HTTP verbs (GET, POST, PATCH, DELETE)
- Standard status codes (200, 201, 400, 401, 403, 404, 500)

### 2. Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "errors": null
}
```

### 3. Pagination
- Cursor-based pagination for large datasets
- Configurable page size (default 20, max 100)

### 4. Error Handling
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": {
    "email": ["This field is required"],
    "password": ["Password too short"]
  }
}
```

---

## Security Architecture

### 1. Authentication
- **JWT Access Token** - Short-lived (15 min)
- **JWT Refresh Token** - Long-lived (7 days)
- **Token Blacklist** - On logout

### 2. Authorization
```python
# Permission classes
IsAuthenticated          # Logged in users
IsOwnerOrReadOnly        # Owner can edit
IsEmailVerified          # Email verified users
IsHostOfProject          # Project host only
IsAdminUser              # Staff users only
```

### 3. Input Validation
- DRF serializer validation
- Database constraints (unique, not null)
- Custom validators

### 4. SQL Injection Prevention
- Django ORM (parameterized queries)
- Never use raw SQL with user input

### 5. CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://interfacehive.com'
]
```

---

## Asynchronous Processing

### Celery Tasks

#### Email Sending
```python
@shared_task
def send_verification_email(user_id):
    # Async email delivery
```

#### Cleanup Tasks
```python
@periodic_task(run_every=crontab(hour=2, minute=0))
def anonymize_deleted_users():
    # GDPR 30-day cleanup
```

#### Future Tasks
- Notification dispatch
- Report generation
- AI model inference

---

## Database Optimization

### Indexing Strategy
```python
class Meta:
    indexes = [
        models.Index(fields=['status', 'created_at']),  # List filtering
        GinIndex(fields=['search_vector']),  # Full-text search
        models.Index(fields=['host', 'status']),  # User's projects
    ]
```

### Query Optimization
- `select_related()` for ForeignKey
- `prefetch_related()` for reverse ForeignKey/ManyToMany
- Avoid N+1 queries

### Connection Pooling
- PostgreSQL connection pooling via pgBouncer (production)

---

## Testing Strategy

### Test Structure
```
apps/projects/tests/
├── test_models.py       # Model logic
├── test_serializers.py  # Validation logic
├── test_views.py        # API endpoints
└── test_services.py     # Business logic
```

### Test Coverage
```bash
pytest --cov              # Run with coverage
# Target: >80% coverage
```

### Test Types
- **Unit Tests** - Models, serializers, services
- **Integration Tests** - API endpoints, database
- **E2E Tests** - Full user workflows

---

## Deployment Architecture

```
Load Balancer (Nginx)
    ↓
WSGI Server (Gunicorn) ← HTTP Requests
    ↓
Django Application
    ↓
PostgreSQL Database

ASGI Server (Daphne) ← WebSocket Requests
    ↓
Django Channels
    ↓
Redis (Channel Layer)

Celery Worker ← Background Tasks
    ↓
Redis (Broker)
```

---

## Monitoring & Logging

### Logging Strategy
```python
import logging
logger = logging.getLogger(__name__)

logger.info("User registered", extra={'user_id': user.id})
logger.error("Payment failed", exc_info=True)
```

### Metrics (Future)
- Request rate
- Response times
- Error rates
- Database query performance

### Tools (Planned)
- **Sentry** - Error tracking
- **Prometheus** - Metrics
- **Grafana** - Dashboards

---

## Scalability Considerations

### Horizontal Scaling
- Stateless API (JWT, no sessions)
- Multiple Gunicorn workers
- Load balancer distribution

### Database Scaling
- Read replicas for analytics
- Partitioning for large tables
- Connection pooling

### Caching Strategy
- Redis for session data
- Query result caching
- CDN for static files

---

## Development Workflow

### Local Development
```bash
python manage.py runserver        # Dev server
celery -A config worker -l info   # Celery worker
pytest                            # Run tests
```

### Code Quality
- **Black** - Code formatting (line length 100)
- **isort** - Import sorting
- **Flake8** - Linting
- **mypy** - Type checking (optional)

---

## Summary

The backend architecture emphasizes:
1. **Immutability** - Credit ledger and audit logs
2. **GDPR Compliance** - Soft delete + anonymization
3. **Type Safety** - Django ORM, serializer validation
4. **Scalability** - Stateless design, async processing
5. **Security** - JWT auth, permission classes, input validation
6. **Maintainability** - Service layer pattern, comprehensive tests
