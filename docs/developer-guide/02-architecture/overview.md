# Architecture Overview

This document provides a high-level overview of InterfaceHive's system architecture, component interactions, and data flow.

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser<br/>Chrome, Firefox, Safari]
    end

    subgraph "Frontend Layer - React 19 + TypeScript"
        UI[UI Components<br/>shadcn/ui + Tailwind CSS]
        Router[React Router v7<br/>Client-side Routing]
        State[TanStack Query<br/>Server State Management]
        AuthCtx[Auth Context<br/>JWT Token Management]
        APIClient[Axios Client<br/>HTTP + Token Interceptor]
    end

    subgraph "Backend Layer - Django 5.0"
        ASGI[Daphne ASGI Server<br/>HTTP + WebSocket]

        subgraph "HTTP Layer"
            DRF[Django REST Framework<br/>API Endpoints]
            Auth[JWT Authentication<br/>simplejwt]
            Perms[Permissions<br/>IsAuthenticated, Custom]
        end

        subgraph "WebSocket Layer"
            Channels[Django Channels<br/>WebSocket Consumers]
            ChannelLayer[Channel Layer<br/>Redis Backend]
        end

        subgraph "Business Logic"
            Services[Service Layer<br/>Business Logic]
            Signals[Django Signals<br/>Event Handlers]
        end

        subgraph "Data Layer"
            ORM[Django ORM<br/>Query Builder]
            Models[Django Models<br/>Schema Definitions]
        end

        subgraph "Async Tasks"
            Celery[Celery Workers<br/>Task Queue]
            Beat[Celery Beat<br/>Scheduled Tasks]
        end
    end

    subgraph "Data Storage"
        PostgreSQL[(PostgreSQL 16<br/>Primary Database<br/>GIN Indexes + JSONB)]
        Redis[(Redis 7<br/>Cache + Message Broker<br/>Channel Layer)]
    end

    subgraph "External Services"
        Email[Email Service<br/>SMTP]
        AI[Google Gemini AI<br/>Project Generation]
    end

    %% Client to Frontend
    Browser -->|HTTPS| UI
    UI --> Router
    Router --> State
    State --> APIClient
    AuthCtx --> APIClient

    %% Frontend to Backend
    APIClient -->|REST API<br/>JSON| DRF
    APIClient -->|WebSocket<br/>JSON| Channels

    %% Backend HTTP Flow
    ASGI --> DRF
    DRF --> Auth
    Auth --> Perms
    Perms --> Services
    Services --> ORM
    ORM --> Models
    Models --> PostgreSQL

    %% Backend WebSocket Flow
    ASGI --> Channels
    Channels --> ChannelLayer
    ChannelLayer --> Redis
    Channels --> Services

    %% Async Tasks
    Services -.->|Queue Task| Celery
    Celery --> Redis
    Celery --> Email
    Services --> AI
    Beat -.->|Schedule| Celery

    %% Signals
    Models -.->|post_save, etc.| Signals
    Signals --> Services

    %% Caching
    DRF -.->|Cache| Redis
    State -.->|Cache| Redis

    classDef frontend fill:#e1f5ff,stroke:#0288d1
    classDef backend fill:#fff3e0,stroke:#ff6f00
    classDef data fill:#f3e5f5,stroke:#7b1fa2
    classDef external fill:#e8f5e9,stroke:#388e3c

    class UI,Router,State,AuthCtx,APIClient frontend
    class ASGI,DRF,Auth,Perms,Services,Signals,ORM,Models,Channels,ChannelLayer,Celery,Beat backend
    class PostgreSQL,Redis data
    class Email,AI external
```

## Component Layers

### 1. Client Layer

**Web Browser** - Modern browsers (Chrome, Firefox, Safari)
- Renders React application
- Executes JavaScript
- Manages localStorage (JWT tokens)
- WebSocket connections

### 2. Frontend Layer

**UI Components** (React 19 + TypeScript)
- Component-based architecture
- shadcn/ui for accessible primitives
- Tailwind CSS for styling
- Responsive design

**React Router v7** - Client-side routing
- URL-based navigation
- Code splitting
- Protected routes
- Nested layouts

**TanStack Query** - Server state management
- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication

**Auth Context** - Authentication state
- User information
- Token management
- Login/logout handlers

**Axios Client** - HTTP client
- Base URL configuration
- JWT token injection
- Automatic token refresh
- Error handling

### 3. Backend Layer

#### HTTP Layer

**Daphne** - ASGI server
- Handles both HTTP and WebSocket
- Production-ready
- Async support

**Django REST Framework** - API framework
- RESTful API endpoints
- Serialization (JSON ↔ Models)
- Content negotiation
- Browsable API (dev mode)

**JWT Authentication** - Token-based auth
- Stateless authentication
- Access token (5 min expiry)
- Refresh token (7 days)
- Automatic refresh on 401

**Permissions** - Authorization
- `IsAuthenticated` - Logged-in users only
- Custom permissions (e.g., `IsProjectHost`)
- Object-level permissions

#### WebSocket Layer

**Django Channels** - WebSocket support
- Real-time bidirectional communication
- Chat system
- Live updates

**Channel Layer** - Message routing
- Redis backend
- Group messaging
- Cross-process communication

#### Business Logic

**Service Layer** - Business logic
- Separated from views
- Reusable functions
- Transaction management
- Complex operations

**Django Signals** - Event handlers
- `post_save` - After model save
- `pre_delete` - Before model delete
- Trigger side effects (badges, notifications)

#### Data Layer

**Django ORM** - Database abstraction
- Query builder
- Lazy evaluation
- Relationships (FK, M2M)
- Aggregations

**Django Models** - Schema definitions
- Python classes → Database tables
- Field types and validation
- Constraints and indexes
- Methods and properties

#### Async Tasks

**Celery Workers** - Background tasks
- Email sending
- Notification processing
- Badge calculations
- Heavy computations

**Celery Beat** - Task scheduler
- Periodic tasks (cron-like)
- Clean up old data
- Update statistics

### 4. Data Storage

**PostgreSQL 16** - Primary database
- Relational data (users, projects, contributions)
- ACID transactions
- GIN indexes for full-text search
- JSONB for flexible data

**Redis 7** - In-memory storage
- Cache (query results, computed data)
- Celery message broker
- Channel layer backend
- Session storage

### 5. External Services

**Email Service** - SMTP
- Email verification
- Contribution notifications
- Password reset

**Google Gemini AI** - AI integration
- Project template generation
- Structured output
- Natural language processing

## Request Flow

### HTTP Request Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant F as Frontend
    participant API as Axios Client
    participant DRF as Django REST Framework
    participant Auth as JWT Auth
    participant Svc as Service Layer
    participant DB as PostgreSQL

    B->>F: User action (e.g., "View Project")
    F->>API: getProject(id)

    Note over API: Get token from localStorage
    API->>DRF: GET /api/v1/projects/:id/<br/>Authorization: Bearer <token>

    DRF->>Auth: Verify JWT token

    alt Token valid
        Auth-->>DRF: User authenticated
        DRF->>Svc: get_project(id, user)
        Svc->>DB: SELECT * FROM projects WHERE id=?
        DB-->>Svc: Project data

        Note over Svc: Check permissions<br/>(is public or user has access)

        Svc-->>DRF: Project instance
        DRF-->>API: 200 OK + JSON
        API-->>F: Project data
        F-->>B: Render project details
    else Token expired
        Auth-->>DRF: 401 Unauthorized
        DRF-->>API: 401 Unauthorized

        Note over API: Interceptor catches 401
        API->>DRF: POST /api/v1/auth/refresh/<br/>refresh_token

        alt Refresh success
            DRF-->>API: 200 OK + new tokens
            Note over API: Update localStorage
            API->>DRF: Retry GET /api/v1/projects/:id/
            DRF-->>API: 200 OK + JSON
            API-->>F: Project data
            F-->>B: Render project details
        else Refresh failed
            DRF-->>API: 401 Unauthorized
            Note over API: Clear localStorage
            API-->>F: Redirect to login
            F-->>B: Show login page
        end
    end
```

### WebSocket Connection Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant F as Frontend
    participant WS as WebSocket
    participant C as Consumer
    participant CL as Channel Layer
    participant R as Redis

    B->>F: Open chat
    F->>WS: Connect ws://localhost/chat/:project_id/
    WS->>C: connect(scope)

    Note over C: Authenticate via scope['user']

    C->>CL: group_add("chat_123", channel_name)
    CL->>R: SUBSCRIBE chat_123
    R-->>CL: OK
    CL-->>C: Added to group
    C-->>WS: accept()
    WS-->>F: Connected
    F-->>B: Show chat interface

    Note over B,R: User sends message
    B->>F: Type message + send
    F->>WS: send(JSON)
    WS->>C: receive_json(content)

    Note over C: Process message
    C->>DB: Save message to database

    C->>CL: group_send("chat_123", message_data)
    CL->>R: PUBLISH chat_123 message_data
    R-->>CL: OK

    Note over CL: Broadcast to all in group
    CL-->>C: chat_message(event)
    C-->>WS: send_json(message)
    WS-->>F: Receive JSON
    F-->>B: Display message

    Note over B,R: User disconnects
    B->>F: Close tab
    F->>WS: disconnect()
    WS->>C: disconnect(close_code)
    C->>CL: group_discard("chat_123", channel_name)
    CL->>R: UNSUBSCRIBE chat_123
    R-->>CL: OK
```

### Async Task Flow

```mermaid
sequenceDiagram
    participant API as API View
    participant Svc as Service Layer
    participant DB as PostgreSQL
    participant Q as Celery Queue
    participant W as Celery Worker
    participant SMTP as Email Server

    API->>Svc: accept_contribution(id)

    Note over Svc: Start transaction
    activate Svc
    Svc->>DB: BEGIN TRANSACTION
    Svc->>DB: UPDATE contribution SET status='accepted'
    Svc->>DB: INSERT INTO credit_ledger
    Svc->>DB: UPDATE user SET reputation_data
    Svc->>DB: COMMIT
    deactivate Svc

    Note over Svc: Transaction committed<br/>Now queue async task

    Svc->>Q: send_email.delay(contribution_id)
    Q->>Redis: LPUSH celery contribution_id
    Redis-->>Q: OK
    Svc-->>API: Success
    API-->>Client: 200 OK

    Note over W,Redis: Worker polling queue
    W->>Redis: BRPOP celery
    Redis-->>W: contribution_id
    W->>DB: SELECT * FROM contributions WHERE id=?
    DB-->>W: Contribution data
    W->>SMTP: Send email
    SMTP-->>W: Email sent
    W->>Redis: Task success
```

## Data Flow Patterns

### Read Operations

1. **Frontend** initiates request (e.g., view projects)
2. **TanStack Query** checks cache
   - If cached and fresh: Return immediately
   - If stale: Return cached + fetch in background
   - If not cached: Show loading state
3. **Axios** adds JWT token to request
4. **DRF View** receives request
5. **Authentication** verifies token
6. **Permissions** check access
7. **Service Layer** queries database
8. **ORM** generates SQL
9. **PostgreSQL** executes query
10. **Serializer** converts models to JSON
11. **Response** returned to frontend
12. **TanStack Query** caches result
13. **Component** renders data

### Write Operations

1. **Frontend** submits form
2. **Zod** validates input client-side
3. **Axios** sends POST/PUT/PATCH request
4. **DRF View** receives request
5. **Serializer** validates data
6. **Service Layer** handles business logic
7. **Transaction** begins (if multi-step)
8. **ORM** executes INSERT/UPDATE
9. **PostgreSQL** commits transaction
10. **Signals** trigger (e.g., award badge)
11. **Celery Task** queued (e.g., send email)
12. **Response** returned to frontend
13. **TanStack Query** invalidates cache
14. **Optimistic Update** (optional)
15. **Component** re-renders

## Caching Strategy

### Frontend Caching (TanStack Query)

```typescript
// Aggressive caching for static data
useQuery({
  queryKey: ['badges'],
  queryFn: getBadges,
  staleTime: Infinity,  // Never stale
  cacheTime: Infinity   // Keep forever
})

// Moderate caching for semi-static data
useQuery({
  queryKey: ['projects', 'list'],
  queryFn: getProjects,
  staleTime: 5 * 60 * 1000,   // 5 minutes
  cacheTime: 10 * 60 * 1000   // 10 minutes
})

// Minimal caching for dynamic data
useQuery({
  queryKey: ['user', 'balance'],
  queryFn: getCreditBalance,
  staleTime: 0,  // Always stale
  cacheTime: 1000  // Keep for 1 second
})
```

### Backend Caching (Redis)

```python
# View-level caching
@method_decorator(cache_page(60 * 5))  # 5 minutes
def list(self, request):
    return super().list(request)

# Query-level caching
def get_project_list():
    cache_key = 'projects:list:v1'
    result = cache.get(cache_key)

    if result is None:
        result = Project.objects.all().values()
        cache.set(cache_key, result, timeout=300)

    return result

# Invalidation on update
def update_project(project):
    project.save()
    cache.delete('projects:list:v1')  # Invalidate cache
```

## Security Layers

### Authentication

1. **JWT Tokens** - Stateless authentication
2. **Email Verification** - Prevent fake accounts
3. **Password Hashing** - bcrypt with salt
4. **Token Rotation** - Refresh tokens expire after 7 days

### Authorization

1. **Permissions** - Role-based access control
2. **Object Permissions** - Check ownership
3. **Rate Limiting** - Throttle API requests

### Data Protection

1. **HTTPS** - Encrypted communication
2. **CSRF Protection** - Token-based
3. **XSS Protection** - Content Security Policy
4. **SQL Injection** - Parameterized queries (ORM)
5. **GDPR** - Soft delete, data anonymization

## Scalability Considerations

### Horizontal Scaling

- **Frontend**: Static files on CDN
- **Backend**: Multiple Django instances behind load balancer
- **Celery**: Multiple workers
- **PostgreSQL**: Read replicas for read-heavy operations
- **Redis**: Redis Cluster for high availability

### Vertical Scaling

- **Database**: Increase RAM for better caching
- **Redis**: Increase memory for larger cache
- **Workers**: More CPU cores for Celery

### Performance Optimization

- **Database Indexes**: B-tree, GIN for search
- **Query Optimization**: select_related, prefetch_related
- **Connection Pooling**: Reuse database connections
- **Caching**: Redis for frequent queries
- **CDN**: Static assets (images, CSS, JS)
- **Code Splitting**: Load only needed JavaScript

## Monitoring and Observability

### Logging

- **Django**: Request/response logs
- **Celery**: Task execution logs
- **PostgreSQL**: Slow query log
- **Redis**: Command logs

### Metrics

- **Response Time**: API endpoint latency
- **Error Rate**: 4xx and 5xx responses
- **Database**: Query count, connection pool usage
- **Cache Hit Rate**: Redis cache effectiveness
- **Task Queue**: Celery task backlog

### Alerts

- **High Error Rate**: > 5% errors
- **Slow Responses**: > 1 second average
- **Database Connections**: > 80% pool usage
- **Disk Space**: < 20% free
- **Memory Usage**: > 90% used

## Development Workflow

1. **Local Development**: docker-compose for services
2. **Code Changes**: Hot reload (Vite HMR, Django runserver)
3. **Testing**: pytest (backend), Vitest (frontend)
4. **Code Quality**: Black, isort, ESLint, Prettier
5. **Git Workflow**: Feature branches → PR → Review → Merge
6. **CI/CD**: GitHub Actions (or similar)
7. **Deployment**: Docker containers, environment variables

## Next Steps

- [Backend Architecture](backend-architecture.md) - Django app structure in detail
- [Frontend Architecture](frontend-architecture.md) - React components and state management
- [Database Design](database-design.md) - Schema and relationships

---

This architecture provides a solid foundation for building a scalable, maintainable platform!
