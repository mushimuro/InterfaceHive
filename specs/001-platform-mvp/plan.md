# Feature Plan: InterfaceHive Platform MVP

**Plan ID:** 001-platform-mvp
**Created:** 2025-12-22
**Status:** Draft

## Overview

InterfaceHive is a contribution marketplace platform connecting project hosts with contributors. The MVP implements core workflows (project posting, contribution submission, review/decision, credit tracking) with GDPR compliance, WCAG 2.1 AA accessibility, and production-ready scalability (10K users, 500 concurrent).

**Tech Stack:**
- **Frontend:** React + TypeScript + shadcn/ui + TanStack Query + React Router
- **Backend:** Django 5.x + Django REST Framework + djangorestframework-simplejwt
- **Database:** PostgreSQL 15+ with full-text search (GIN indexes)
- **Queue/Cache:** Redis + Celery (for async email processing)
- **Deployment:** Docker Compose (dev), containerized deployment (production)

## Constitution Alignment Check

This plan MUST align with InterfaceHive's constitutional principles:

- [x] **Code Quality:** Django models with clear naming, React components following single responsibility, minimal prop drilling via React Query cache
- [x] **Test Coverage:** pytest for backend (>= 70%), Jest + React Testing Library for frontend (>= 70%), Playwright for e2e
- [x] **User Experience:** API response < 3s (indexed queries), React Suspense boundaries, skeleton loading, toast notifications for errors
- [x] **Performance:** Justified dependencies (see Dependencies section), PostgreSQL with connection pooling, React lazy loading, code splitting

## Goals

1. **Enable Project Discovery:** Hosts can post contribution opportunities; contributors can discover and filter projects
2. **Facilitate Contribution Workflow:** Contributors submit work; hosts review and accept/decline with automatic credit awards
3. **Build Trust via Credits:** Transparent, append-only credit ledger prevents fraud and gamification
4. **GDPR Compliance:** User data deletion (30-day retention), export, and privacy controls
5. **Production Readiness:** Handle 500 concurrent users, < 3s response times, WCAG 2.1 AA accessibility

## Non-Goals (MVP)

- OAuth integration (GitHub/Google login) — email/password only
- Direct file uploads — links-only for contributions
- Real-time notifications — email queue with async retry
- Multi-language support — English only
- Marketplace payments — credits are reputation points, not currency
- Advanced search — basic keyword + tags only (no ML/ranking)

## User Stories

### Primary User Stories

**Host:**
As a project host, I want to post contribution requests with clear acceptance criteria so that contributors understand what I need.

**Contributor:**
As a contributor, I want to discover projects matching my skills and submit contributions so that I can build my portfolio and earn credits.

**Platform:**
As the platform, I want to ensure credit integrity and data compliance so that users trust the system and we meet legal requirements.

### Additional Stories
- As a host, I want to review submissions and accept/decline them so that I can manage contributions efficiently
- As a contributor, I want to see my credit balance and history so that I can track my accomplishments
- As a user, I want to delete my account and data so that I comply with my privacy rights (GDPR)
- As an admin, I want to moderate abusive content and reverse fraudulent credits so that platform quality is maintained

## Technical Approach

### Architecture

**High-Level:**
```
┌─────────────────┐
│  React SPA      │  ← shadcn/ui components, TanStack Query
│  (TypeScript)   │  ← React Router for navigation
└────────┬────────┘
         │ HTTP/JSON
         ▼
┌─────────────────┐
│  Django API     │  ← DRF viewsets + serializers
│  (Python 3.11+) │  ← JWT auth (simplejwt)
└────────┬────────┘
         │ ORM
         ▼
┌─────────────────┐          ┌─────────────────┐
│  PostgreSQL 15+ │          │  Redis + Celery │
│  (Primary DB)   │          │  (Email Queue)  │
└─────────────────┘          └─────────────────┘
```

**Component Responsibilities:**
- **React Frontend:** UI rendering, form validation (react-hook-form + zod), optimistic updates, accessibility (ARIA, keyboard nav)
- **Django Backend:** Business logic, authorization, atomic transactions (credit awards), API rate limiting, GDPR data operations
- **PostgreSQL:** ACID transactions, unique constraints (1 credit per project/user), full-text search, audit logging
- **Redis/Celery:** Async email queue with exponential backoff retry (1m, 5m, 30m, 2h, 24h)

**Key Design Decisions:**
1. **Atomic Credit Awards:** Use database transactions + unique constraint on `(project_id, to_user_id, entry_type='AWARD')` to prevent double-crediting
2. **Soft Deletion (GDPR):** `isDeleted` flag + scheduled job to anonymize after 30 days (preserves audit trail)
3. **API Versioning:** `/api/v1/*` URL path versioning for explicit compatibility
4. **Email Resilience:** Celery tasks with retry logic; operations never blocked by email failures
5. **Accessibility First:** WCAG 2.1 AA compliance via semantic HTML, ARIA labels, focus management, color contrast validation

### Dependencies

**Backend Dependencies:**

| Dependency | Purpose | Justification | Security |
|------------|---------|---------------|----------|
| `django==5.0.*` | Web framework | Industry standard, ORM, admin interface, security features | Active security patches |
| `djangorestframework==3.14.*` | REST API framework | Serializers, viewsets, browsable API, authentication | DRF team maintained |
| `djangorestframework-simplejwt==5.3.*` | JWT authentication | Stateless auth for SPA, token refresh, blacklisting | Standard JWT library |
| `django-cors-headers==4.3.*` | CORS handling | Allow frontend origin during development | Essential for SPA |
| `django-filter==23.*` | Query filtering | Complex filtering for project search | DRF recommended |
| `drf-spectacular==0.27.*` | OpenAPI schema | Auto-generated API docs, type-safe clients | DRF-native |
| `psycopg2-binary==2.9.*` | PostgreSQL adapter | Database connection | PostgreSQL official |
| `celery==5.3.*` | Task queue | Async email processing, scheduled jobs | Industry standard |
| `redis==5.0.*` | Cache + broker | Celery broker, session cache | Standard cache layer |
| `gunicorn==21.*` | WSGI server | Production HTTP server | Production-grade |
| `python-dotenv==1.0.*` | Environment config | Load `.env` files | Development utility |
| `pytest-django==4.7.*` | Testing | Test framework for Django | pytest ecosystem |
| `factory-boy==3.3.*` | Test fixtures | Generate test data | pytest standard |
| `coverage==7.4.*` | Code coverage | Track test coverage >= 70% | Standard tool |

**Total backend dependencies:** 14 (justified for core functionality)

**Frontend Dependencies:**

| Dependency | Purpose | Justification | Bundle Size Impact |
|------------|---------|---------------|-------------------|
| `react@18` | UI library | Component-based architecture, hooks, concurrent features | ~42KB (gzipped) |
| `react-dom@18` | DOM renderer | Required for React | Included in react |
| `typescript@5` | Type safety | Catch errors at compile-time, better DX | 0 (devDep) |
| `react-router-dom@6` | Routing | Client-side navigation, nested routes | ~11KB (gzipped) |
| `@tanstack/react-query@5` | Data fetching | Caching, optimistic updates, invalidation | ~15KB (gzipped) |
| `react-hook-form@7` | Form management | Performance, validation, low re-renders | ~9KB (gzipped) |
| `zod@3` | Schema validation | Type-safe validation, matches backend | ~13KB (gzipped) |
| `shadcn/ui` components | UI components | Accessible, customizable, no runtime overhead | ~Varies (tree-shakeable) |
| `tailwindcss@3` | Styling | Utility-first CSS, purging unused styles | ~10KB (purged) |
| `axios@1` | HTTP client | Interceptors, request cancellation | ~14KB (gzipped) |
| `date-fns@3` | Date formatting | Lightweight, tree-shakeable | ~5KB (selective import) |

**Total frontend bundle:** ~120-150KB (gzipped, including shadcn components)

**Justification:** All dependencies solve specific problems without overlap. No "kitchen sink" libraries. All actively maintained with security updates.

### Data Model Changes

Based on `db-spec.md` and GDPR requirements:

**User Model:**
```python
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=True)  # Anonymized on deletion
    display_name = models.CharField(max_length=100)  # Anonymized on deletion
    bio = models.TextField(blank=True)  # Cleared on deletion
    skills = models.JSONField(default=list, blank=True)  # Cleared on deletion
    github_url = models.URLField(blank=True)  # Cleared on deletion
    portfolio_url = models.URLField(blank=True)  # Cleared on deletion
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)  # GDPR soft delete
    deletion_requested_at = models.DateTimeField(null=True, blank=True)  # GDPR
    data_anonymized_at = models.DateTimeField(null=True, blank=True)  # GDPR
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_deleted', 'deletion_requested_at']),
        ]
```

**Project Model:**
```python
class Project(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    what_it_does = models.TextField()
    inputs_dependencies = models.TextField(blank=True)
    outputs = models.TextField()  # Acceptance criteria
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    difficulty = models.CharField(max_length=15, choices=DIFFICULTY_CHOICES, blank=True)
    estimated_time = models.CharField(max_length=50, blank=True)
    github_link = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['host', 'status']),
            models.Index(fields=['status', '-created_at']),
        ]
        ordering = ['-created_at']
```

**ProjectTag & ProjectTagMap Models:**
```python
class ProjectTag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=50, unique=True)

class ProjectTagMap(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tag_maps')
    tag = models.ForeignKey(ProjectTag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['project', 'tag']]
```

**Contribution Model:**
```python
class Contribution(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='contributions')
    contributor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contributions')
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    links = models.JSONField(default=list, blank=True)  # Array of URLs
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    decided_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='decisions_made')
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['project', 'status', '-created_at']),
            models.Index(fields=['contributor', 'status', '-created_at']),
        ]
        ordering = ['-created_at']
```

**CreditLedgerEntry Model:**
```python
class CreditLedgerEntry(models.Model):
    ENTRY_TYPE_CHOICES = [
        ('award', 'Award'),
        ('reversal', 'Reversal'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credits_received')
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credits_given')  # Host
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    contribution = models.ForeignKey(Contribution, on_delete=models.CASCADE)
    amount = models.IntegerField(default=1)
    entry_type = models.CharField(max_length=10, choices=ENTRY_TYPE_CHOICES, default='award')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['to_user', '-created_at']),
            models.Index(fields=['contribution']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'to_user'],
                condition=models.Q(entry_type='award'),
                name='unique_award_per_project_user'
            )
        ]
```

**Migration Strategy:**
1. Initial migration creates all tables with indexes
2. Populate ProjectTag table with common tags (can be done via Django admin or data migration)
3. GDPR cleanup scheduled task (Celery beat) runs daily to anonymize users with `deletion_requested_at > 30 days ago`

### API Design

Based on `back-spec.md` with `/api/v1/` versioning:

**Authentication Endpoints:**
```
POST /api/v1/auth/register
  Request: { email, password, display_name }
  Response: { id, email, display_name, access_token, refresh_token }

POST /api/v1/auth/login
  Request: { email, password }
  Response: { access_token, refresh_token, user: {...} }

POST /api/v1/auth/refresh
  Request: { refresh }
  Response: { access, refresh }

POST /api/v1/auth/logout
  Request: { refresh }
  Response: { message }
```

**User/Profile Endpoints:**
```
GET /api/v1/me
  Auth: Required
  Response: Full user profile including credits

PATCH /api/v1/me
  Auth: Required
  Request: { display_name?, bio?, skills?, github_url?, portfolio_url? }
  Response: Updated user profile

DELETE /api/v1/me
  Auth: Required
  Response: { message: "Account deletion scheduled" }
  Side effect: Sets deletion_requested_at

GET /api/v1/me/export
  Auth: Required
  Response: JSON export of all user data (GDPR)

GET /api/v1/users/:id
  Auth: Optional
  Response: Public profile (display_name, bio, links, credits, created_at)
```

**Project Endpoints:**
```
GET /api/v1/projects
  Query params: search, tags, status, sort, page, page_size
  Response: Paginated list of projects

POST /api/v1/projects
  Auth: Required
  Request: { title, description, what_it_does, outputs, tags?, difficulty?, estimated_time?, github_link? }
  Response: Created project
  Rate limit: 10/hour per user

GET /api/v1/projects/:id
  Auth: Optional
  Response: Full project details + accepted contributors

PATCH /api/v1/projects/:id
  Auth: Required (host only)
  Request: Partial project fields
  Response: Updated project

POST /api/v1/projects/:id/close
  Auth: Required (host only)
  Response: { status: "closed" }
```

**Contribution Endpoints:**
```
POST /api/v1/projects/:id/contributions
  Auth: Required (not host, project open)
  Request: { title?, body, links? }
  Response: Created contribution
  Rate limit: 20/hour per user

GET /api/v1/projects/:id/contributions
  Auth: Optional
  Response: Contributions (filtered by viewer role)
    - Host: all contributions
    - Contributor: accepted + their own
    - Public: accepted only

PATCH /api/v1/contributions/:id/accept
  Auth: Required (host or admin)
  Response: { status: "accepted", credit_awarded: true/false }
  Side effect: Atomic credit award

PATCH /api/v1/contributions/:id/decline
  Auth: Required (host or admin)
  Response: { status: "declined" }
```

**Credit Endpoints:**
```
GET /api/v1/me/credits/balance
  Auth: Required
  Response: { balance: int, last_updated: datetime }

GET /api/v1/me/credits/ledger
  Auth: Required
  Query params: page, page_size
  Response: Paginated credit transactions
```

**Admin Endpoints (optional for MVP):**
```
POST /api/v1/admin/credits/reverse
  Auth: Required (admin only)
  Request: { ledger_entry_id }
  Response: Reversal entry created

DELETE /api/v1/admin/projects/:id
  Auth: Required (admin only)
  Response: Project soft-deleted

DELETE /api/v1/admin/contributions/:id
  Auth: Required (admin only)
  Response: Contribution soft-deleted
```

**Error Responses (Standardized):**
```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "fields": {  // For validation errors
    "field_name": "Specific error"
  }
}
```

## Testing Strategy

**Target Coverage:** >= 70% (Principle 2)

### Backend Unit Tests (pytest + factory-boy)

**Authentication & User Management:**
- Test user registration with valid data creates user
- Test registration with duplicate email fails with 400
- Test login with valid credentials returns JWT tokens
- Test login with invalid credentials returns 401
- Test JWT token refresh works
- Test password hashing is secure (bcrypt)
- Test user deletion schedules anonymization
- Test anonymization job after 30 days
- Test data export includes all user data (GDPR)

**Project Management:**
- Test project creation with all fields
- Test project creation fails without required fields
- Test project update by host succeeds
- Test project update by non-host fails with 403
- Test project close by host sets status
- Test project filtering by tags
- Test project search by keyword (full-text)
- Test pagination works correctly

**Contribution Workflow:**
- Test contribution submission to Open project
- Test contribution submission to Closed project fails with 403
- Test contribution acceptance by host
- Test contribution acceptance by non-host fails with 403
- Test contribution decline by host
- Test contribution status transitions

**Credit System:**
- Test credit award on first acceptance (atomic transaction)
- Test duplicate credit award for same user/project fails with 409
- Test credit balance calculation from ledger
- Test credit transaction atomicity with concurrent requests
- Test admin credit reversal creates reversal entry
- Test ledger append-only integrity (no updates/deletes)

**GDPR Compliance:**
- Test user deletion request sets deletion_requested_at
- Test anonymization job anonymizes email, display_name, clears PII
- Test anonymized user projects/contributions remain visible
- Test data export returns complete JSON

### Backend Integration Tests (Django TestCase)

**API Endpoints:**
- Test GET /api/v1/projects returns paginated results
- Test POST /api/v1/projects creates project with 201
- Test POST /api/v1/projects fails without auth (401)
- Test GET /api/v1/projects/:id returns full details
- Test PATCH /api/v1/projects/:id updates project (host only)
- Test POST /api/v1/projects/:id/contributions creates contribution
- Test PATCH /api/v1/contributions/:id/accept awards credit
- Test PATCH /api/v1/contributions/:id/decline updates status
- Test GET /api/v1/me/credits/balance returns correct balance
- Test rate limiting (10 projects/hour, 20 contributions/hour)

**Email Queue:**
- Test email task queues successfully
- Test failed email retries with exponential backoff
- Test email failure doesn't block operations
- Test max retries (5) marks email as failed

**Permissions:**
- Test non-host cannot accept contributions
- Test non-admin cannot reverse credits
- Test deleted users cannot log in
- Test JWT token expiration works

### Frontend Unit Tests (Jest + React Testing Library)

**Components:**
- Test ProjectCard renders title, host, tags, status
- Test ContributionForm validates required fields
- Test LoadingSpinner renders with correct size prop
- Test ErrorMessage displays error text
- Test AuthForm validates email format and password strength
- Test ProfileForm updates display_name and bio
- Test Accessibility: keyboard navigation works on forms
- Test Accessibility: focus trap in modal dialogs

**Hooks & Utilities:**
- Test useAuth hook manages authentication state
- Test useProjects hook fetches and caches projects
- Test useContributions hook filters by status
- Test form validation schemas (zod) match backend

### End-to-End Tests (Playwright)

**Complete User Flows:**
1. **Host Creates Project and Accepts Contribution:**
   - Host registers and logs in
   - Host creates new project with all fields
   - Verify project appears in project list
   - Contributor registers and logs in
   - Contributor discovers project via search
   - Contributor submits contribution
   - Host views pending contributions on project page
   - Host accepts contribution
   - Verify contributor receives credit (check profile)
   - Verify contributor appears in Accepted Contributors list
   - Expected duration: < 30 seconds

2. **GDPR Data Deletion Flow:**
   - User registers and creates content
   - User requests account deletion
   - Verify deletion_requested_at is set
   - Simulate 30-day wait (adjust system time or run job manually)
   - Verify user data is anonymized
   - Verify user content remains but attributed to "Deleted User"
   - Expected duration: < 15 seconds

3. **Accessibility Navigation:**
   - Navigate entire app using keyboard only (Tab, Shift+Tab, Enter, Space, Arrows)
   - Verify all interactive elements accessible
   - Verify focus indicators visible
   - Use screen reader (NVDA) to navigate project submission flow
   - Verify ARIA labels announced correctly
   - Expected duration: < 20 seconds

4. **Load Testing:**
   - Simulate 500 concurrent users browsing projects
   - Measure API response times (p95 < 3s)
   - Verify no database connection pool exhaustion
   - Verify no memory leaks
   - Expected duration: 2-5 minutes

## User Experience Considerations

**Performance Target:** < 3 seconds response time (Principle 3)

### Loading States

- **Project List:** Skeleton cards (8 placeholder cards) while fetching
- **Project Detail:** Skeleton layout for project content and sidebar
- **Contribution Submission:** Button disabled with spinner during submit (< 3s)
- **Accept/Decline Actions:** Optimistic update (immediate UI change) + rollback on error
- **Search/Filter:** Debounced input (300ms) + loading indicator during fetch

### Error Handling

- **Network Errors:** Toast notification with "Retry" button, error persists for 5 seconds
- **Validation Errors:** Inline field errors (red text below input), prevent form submission
- **403/404 Errors:** Dedicated error pages with navigation options
- **500 Errors:** Generic error page with "Try Again" and "Report Issue" buttons
- **Rate Limiting:** Specific message: "You've reached the limit. Try again in X minutes."

### Responsive Design

- **Desktop Breakpoints:** 1920px (full), 1440px (standard), 1024px (compact)
- **Project Detail Layout:**
  - Desktop: Two-column (main content + sidebar)
  - Tablet: Single column, sidebar stacks below
- **Navigation:** Hamburger menu at < 1024px
- **Forms:** Full-width inputs on mobile, constrained width on desktop
- **Touch Targets:** Minimum 44x44px for buttons on all screen sizes

### Accessibility (WCAG 2.1 AA)

- **Keyboard Navigation:**
  - All interactive elements reachable via Tab
  - Modal dialogs trap focus, Esc to close
  - Skip navigation link to main content
- **Screen Readers:**
  - Semantic HTML (`<nav>`, `<main>`, `<article>`, `<aside>`)
  - ARIA labels on icon-only buttons
  - Status messages announced via `role="status"`
- **Color Contrast:**
  - Text: 4.5:1 minimum (normal), 3:1 (large text)
  - Focus indicators: 3:1 minimum
  - shadcn/ui default theme meets WCAG AA
- **Form Labels:**
  - Every input has associated `<label>` or `aria-label`
  - Error messages linked via `aria-describedby`
- **Automated Testing:**
  - axe-core integration in Jest tests
  - Lighthouse accessibility audit in CI/CD

## Performance Benchmarks

- **Initial Page Load (Project List):** < 1 second (p95)
- **API Response Time (GET /api/v1/projects):** < 1 second (p95)
- **API Response Time (POST /api/v1/contributions/:id/accept):** < 3 seconds (p95) including credit award transaction
- **Database Query Performance:**
  - Project list (20 results): < 50ms with indexes
  - Project detail with contributions: < 100ms with select_related/prefetch_related
  - Credit balance calculation: < 20ms with indexed count query
- **Frontend Bundle Size:** < 150KB gzipped (initial), < 50KB per lazy-loaded route
- **Concurrent Users:** 500 simultaneous users without performance degradation
- **Database Connections:** PostgreSQL connection pool: 20 connections (adjust based on load testing)

**Optimization Strategies:**
1. **Database:** Indexes on foreign keys, status fields, timestamps; use `select_related` for 1:1 relations, `prefetch_related` for 1:N
2. **Frontend:** React.lazy() for routes, React Query caching (staleTime: 5 minutes for projects), Suspense boundaries
3. **API:** DRF pagination (20 results default), rate limiting via django-ratelimit
4. **Search:** PostgreSQL full-text search with GIN index on `tsvector` (title + description)

## Security & Permissions

### Authentication
- JWT tokens with 1-hour access token, 7-day refresh token
- Refresh tokens stored in httpOnly cookies (XSS protection)
- Password hashing via Django's default (PBKDF2 with SHA256)
- Password requirements: 8+ characters, at least one number/special char

### Authorization
- **Host-Only Actions:** Accept/decline contributions, edit/close project
- **Contributor-Only Actions:** Submit contributions (not to own projects)
- **Admin-Only Actions:** Reverse credits, delete content, ban users
- **Permissions checked at:**
  - View level (DRF permissions classes)
  - Model level (raise PermissionDenied if violated)
  - Database level (foreign key constraints)

### Rate Limiting
- **Project Creation:** 10 per hour per user (prevents spam)
- **Contribution Submission:** 20 per hour per user (prevents spam)
- **Login Attempts:** 5 failed attempts → 15-minute lockout (prevents brute force)
- **API Global:** 100 requests/minute per IP (prevents DDoS)

### Data Protection
- **HTTPS Only:** Enforce in production (redirect HTTP → HTTPS)
- **CSRF Protection:** Django CSRF token for state-changing requests
- **XSS Protection:** Django template escaping, React auto-escaping
- **SQL Injection:** Django ORM parameterized queries (never raw SQL)
- **Secrets Management:** Environment variables via `.env` (never commit secrets)

### GDPR Compliance
- **Data Deletion:** User-initiated deletion request → 30-day retention → anonymization
- **Data Export:** JSON export endpoint with all user data
- **Privacy Policy:** Required link in footer
- **Cookie Consent:** Banner for EU users (session cookies only, no tracking)

## Rollout Plan

### Phase 1: Core Infrastructure (Week 1-2)
- [x] Set up Django project with DRF, JWT auth, PostgreSQL
- [x] Implement User model with GDPR fields
- [x] Create authentication endpoints (register, login, refresh, logout)
- [x] Set up React project with TypeScript, shadcn/ui, TanStack Query, React Router
- [x] Implement authentication flow in frontend (login, register, protected routes)
- [x] Set up Docker Compose for local development
- [x] Configure CI/CD pipeline (GitHub Actions): linting, unit tests

### Phase 2: Project Management (Week 3)
- [ ] Implement Project, ProjectTag, ProjectTagMap models
- [ ] Create project endpoints (CRUD, search, filter)
- [ ] Build project list page with search/filter UI
- [ ] Build project detail page with SEO structure (H1/H2/H3)
- [ ] Build create project form with validation
- [ ] Add full-text search (PostgreSQL GIN index)
- [ ] Unit tests for project workflows (>= 70% coverage)

### Phase 3: Contribution Workflow (Week 4)
- [ ] Implement Contribution model
- [ ] Create contribution endpoints (submit, accept, decline)
- [ ] Build contribution submission form
- [ ] Build host review interface (accept/decline buttons)
- [ ] Implement optimistic UI updates
- [ ] Add contribution status indicators (badges)
- [ ] Unit tests for contribution workflows

### Phase 4: Credit System (Week 5)
- [ ] Implement CreditLedgerEntry model with unique constraint
- [ ] Create atomic transaction for credit award on acceptance
- [ ] Build credit endpoints (balance, ledger)
- [ ] Display credit balance on profile
- [ ] Display accepted contributors on project page
- [ ] Implement admin credit reversal endpoint
- [ ] Unit tests for credit integrity (atomicity, uniqueness)

### Phase 5: GDPR & Compliance (Week 6)
- [ ] Implement user deletion request endpoint
- [ ] Create Celery task for data anonymization (30-day scheduled job)
- [ ] Build data export endpoint (JSON)
- [ ] Add privacy policy page
- [ ] Add cookie consent banner (EU users)
- [ ] Test GDPR workflows (deletion, export, anonymization)

### Phase 6: Email Queue & Resilience (Week 7)
- [ ] Set up Redis + Celery
- [ ] Implement email tasks (contribution accepted/declined notifications)
- [ ] Add exponential backoff retry logic (1m, 5m, 30m, 2h, 24h)
- [ ] Test email failure handling (queue, retry, max attempts)
- [ ] Add email queue monitoring

### Phase 7: Accessibility & Performance (Week 8)
- [ ] Audit all components for WCAG 2.1 AA compliance (axe-core)
- [ ] Implement keyboard navigation (focus management, skip links)
- [ ] Add ARIA labels and semantic HTML
- [ ] Verify color contrast ratios (4.5:1 minimum)
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Optimize bundle size (lazy loading, code splitting)
- [ ] Load testing (500 concurrent users)
- [ ] Database query optimization (indexes, explain analyze)

### Phase 8: Testing & Launch (Week 9-10)
- [ ] End-to-end tests (Playwright) for critical flows
- [ ] Security audit (OWASP Top 10 checklist)
- [ ] Performance benchmarking (< 3s response times verified)
- [ ] Documentation (API docs via drf-spectacular, user guides)
- [ ] Production deployment (containerized, managed PostgreSQL, Redis)
- [ ] Monitoring setup (Sentry for errors, Prometheus for metrics)
- [ ] Soft launch with limited users (100 users)
- [ ] Full launch (10K users, 500 concurrent capacity)

## Success Metrics

**Functional:**
- [ ] All 12 functional requirements (FR-1 to FR-12) implemented
- [ ] 100% of acceptance criteria passing

**Performance:**
- [ ] API response time < 3 seconds (p95) for all endpoints
- [ ] Project list loads in < 1 second (p95)
- [ ] System handles 500 concurrent users without degradation

**Quality:**
- [ ] Test coverage >= 70% (backend and frontend)
- [ ] Zero critical security vulnerabilities (Snyk/Dependabot scan)
- [ ] Zero WCAG 2.1 Level AA violations (axe-core audit)

**Compliance:**
- [ ] GDPR data deletion flow functional (30-day anonymization)
- [ ] Privacy policy and cookie consent implemented
- [ ] Audit logs for all credit transactions

**User Satisfaction (post-launch):**
- [ ] User registration completion rate > 80%
- [ ] Project submission completion rate > 70%
- [ ] Contribution submission completion rate > 60%
- [ ] Average time to first contribution < 5 minutes

## Open Questions

- [x] Data retention policy? → **Resolved:** GDPR-compliant with 30-day retention after deletion
- [x] Scalability targets? → **Resolved:** 10K users, 500 concurrent
- [x] API versioning strategy? → **Resolved:** URL path versioning (/api/v1/*)
- [x] Email service failure handling? → **Resolved:** Graceful degradation with queue retry
- [x] Accessibility compliance level? → **Resolved:** WCAG 2.1 Level AA
- [ ] Deployment platform? → **Decision needed:** AWS ECS, Render, Fly.io, or DigitalOcean?
- [ ] Error monitoring service? → **Recommendation:** Sentry (free tier supports 5K events/month)
- [ ] Analytics? → **Recommendation:** Plausible (privacy-friendly) or self-hosted Umami

## Approval

- [x] Constitution compliance verified (all 4 principles addressed)
- [ ] Technical review completed (pending)
- [ ] Security review completed (pending Phase 8)
- [ ] UX review completed (pending Phase 7)
- [ ] Ready for implementation

---
*This plan adheres to the InterfaceHive Constitution v1.0.0*

## References
- Specification: `specs/001-platform-mvp/spec.md`
- Backend Spec: `backend/specifications/back-spec.md`
- Database Spec: `backend/specifications/db-spec.md`
- Frontend Spec: `frontend/specifications/front-spec.md`
- System Architecture: `system_architecture.md`
- Constitution: `.specify/memory/constitution.md`

