# Feature Plan: InterfaceHive Platform MVP

**Plan ID:** 001-platform-mvp
**Created:** 2025-12-29
**Status:** Approved

## Overview

InterfaceHive is a web platform connecting builders (hosts) with contributors for open-source and real-world projects. Hosts publish contribution requests with detailed requirements. Contributors submit their work, and hosts review submissions. The platform includes a credit-based reputation system that awards credits when contributions are accepted, enforcing a maximum of 1 credit per user per project. The MVP features full-text search, SEO optimization, WCAG 2.1 Level AA accessibility compliance, GDPR data rights, email verification with resilient async processing, and sub-3-second performance targets.

## Constitution Alignment Check

This plan MUST align with InterfaceHive's constitutional principles:

- [x] **Code Quality:** Django ORM for self-documenting database queries, React components following single responsibility, zod schemas for type-safe validation, minimal comments (code structure explains intent)
- [x] **Test Coverage:** Unit tests for business logic (credit transactions, permissions), integration tests for API endpoints, E2E tests for critical flows (contribution acceptance, credit awards); target >= 70% overall, 100% on authentication/credits/permissions
- [x] **User Experience:** < 3s page load times enforced via performance testing, loading indicators for operations > 500ms, optimistic UI updates for accept/decline, clear error messages with actionable guidance, WCAG 2.1 Level AA keyboard navigation and screen reader support
- [x] **Performance:** Minimal dependencies (React ecosystem: react-router, react-query, react-hook-form; Django ecosystem: DRF, simplejwt, celery); PostgreSQL native full-text search (no Elasticsearch); pgBouncer for connection pooling; bundle size < 150KB gzipped

## Goals

- Enable hosts to publish contribution request projects with clear acceptance criteria
- Enable contributors to discover projects via search and tags, submit work, and track submission status
- Implement credit-based reputation system with atomic transactions and audit trail
- Ensure email verification required for login with resilient async email processing
- Achieve < 3 second response times for all user-facing operations
- Support 500 concurrent users with horizontal scaling capability
- Meet WCAG 2.1 Level AA accessibility standards
- Implement GDPR compliance with user data deletion and export rights

## Non-Goals

- Real-time notifications via WebSockets (email-based notifications only)
- File uploads (links-only for MVP; direct uploads post-MVP)
- OAuth integration with GitHub/GitLab (external links only for MVP)
- Marketplace billing/payments (credits are reputation points, not currency)
- Multi-language support (English only for MVP)
- Mobile native apps (responsive web only for MVP)
- Project categories (freeform tags only; categories post-MVP)
- Contribution editing after submission (immutable for MVP to prevent abuse)

## User Stories

### Primary User Story
As a **project host**, I want to **publish a detailed contribution request and review submissions**, so that **I can find skilled contributors to help build my project and award credits to quality work**.

### Additional Stories
- As a **contributor**, I want to **discover projects matching my skills and submit my work**, so that **I can contribute to interesting projects and build my reputation through credits**.
- As a **contributor**, I want to **track the status of my submissions across all projects**, so that **I can see which contributions were accepted, declined, or pending**.
- As a **visitor**, I want to **browse open projects and view public contributor profiles**, so that **I can evaluate opportunities and recognize top contributors**.
- As a **user**, I want to **verify my email address before logging in**, so that **the platform maintains email authenticity and reduces spam**.
- As a **user**, I want to **delete my account and have my data anonymized**, so that **I can exercise my GDPR data rights**.

## Technical Approach

### Architecture

**Stack:**
- **Backend:** Django 5.0 + Django REST Framework 3.14 + PostgreSQL 15
- **Frontend:** React 18 + TypeScript + Vite + shadcn/ui (Radix primitives)
- **Authentication:** JWT via djangorestframework-simplejwt (access token 1hr, refresh token 7 days)
- **State Management:** TanStack Query (server state) + React Context (UI state)
- **Async Processing:** Celery + Redis (email queue, GDPR anonymization)
- **Full-Text Search:** PostgreSQL GIN index on tsvector (native, no external services)
- **Caching:** Redis for rate limiting and session storage
- **Connection Pooling:** pgBouncer in transaction mode (20 connections for 500 concurrent users)

**API Design:**
- RESTful API with URL path versioning: `/api/v1/*`
- JWT bearer token authentication
- Rate limiting: 10 projects/hour, 20 contributions/hour per user
- Pagination: 20 items per page, max 100
- OpenAPI 3.0 specification for API documentation

**Database Strategy:**
- PostgreSQL unique constraints for data integrity (1 credit per user/project)
- Django ORM exclusively (no raw SQL) for SQL injection prevention
- Atomic transactions for multi-step operations (contribution acceptance + credit award)
- Append-only ledger for credit transactions (immutable audit trail)
- Full-text search via generated tsvector column with GIN index
- Soft deletion for GDPR compliance (preserve audit trail, anonymize PII after 30 days)

### Dependencies

| Dependency | Purpose | Justification | Bundle Size Impact |
|------------|---------|---------------|-------------------|
| **Backend** | | | |
| djangorestframework | REST API framework | Industry standard for Django APIs, serialization, permissions | N/A (server) |
| djangorestframework-simplejwt | JWT authentication | Stateless auth for SPA, 5.3M+ downloads/month, actively maintained | N/A (server) |
| django-cors-headers | CORS handling | Required for frontend-backend communication on different domains | N/A (server) |
| django-filter | Query filtering | Clean API filtering by tags, status, difficulty | N/A (server) |
| drf-spectacular | OpenAPI schema | Auto-generates API docs, follows OpenAPI 3.0 standard | N/A (server) |
| psycopg2-binary | PostgreSQL adapter | Official PostgreSQL driver for Django | N/A (server) |
| celery | Async task queue | Email sending, GDPR anonymization; 8M+ downloads/month | N/A (server) |
| redis | Cache & broker | Rate limiting, Celery message broker; 5M+ downloads/month | N/A (server) |
| django-ratelimit | Rate limiting | Prevents abuse, Redis-backed distributed limiting | N/A (server) |
| **Frontend** | | | |
| react-router-dom | Client-side routing | Standard React routing, 10M+ downloads/week | ~12KB gzipped |
| @tanstack/react-query | Server state management | Caching, invalidation, optimistic updates; 5M+ downloads/week | ~15KB gzipped |
| react-hook-form | Form handling | Minimal re-renders, performance-optimized; 8M+ downloads/week | ~9KB gzipped |
| zod | Schema validation | Type-safe validation matching backend; 6M+ downloads/week | ~13KB gzipped |
| axios | HTTP client | Interceptors for token refresh, 30M+ downloads/week | ~5KB gzipped |
| shadcn/ui (Radix) | UI components | WCAG 2.1 AA compliant, tree-shakeable, copy-pasted (not NPM dependency) | ~40KB gzipped (varies by components used) |
| **Total Frontend Bundle** | | | **~94KB gzipped + Radix components (~40KB) = ~134KB total** ✅ < 150KB target |

**Dependency Justification:**
- All dependencies are actively maintained (updated within 12 months)
- Each serves core functionality (no single-use-case libraries)
- Frontend bundle stays under 150KB target (aligns with Principle 4)
- No redundant or overlapping functionality

### Data Model Changes

**See:** `specs/001-platform-mvp/data-model.md` for complete specification.

**Entities:**
1. **USER** - Authentication, profile, GDPR compliance fields
2. **PROJECT** - Contribution requests with full-text search
3. **PROJECT_TAG** - Reusable skill/technology tags
4. **PROJECT_TAG_MAP** - Many-to-many project-tag relationship
5. **CONTRIBUTION** - Submitted work with status tracking
6. **CREDIT_LEDGER_ENTRY** - Append-only credit transaction log

**Key Constraints:**
- `USER.email` unique, `email_verification_token` unique when non-null
- `PROJECT_TAG.name` unique (lowercase normalized)
- `PROJECT_TAG_MAP(project, tag)` unique together
- `CONTRIBUTION` decision consistency: PENDING requires `decided_by=NULL`, ACCEPTED/DECLINED requires `decided_by!=NULL`
- `CREDIT_LEDGER_ENTRY(project, to_user)` unique for `entry_type=AWARD` (enforces 1 credit per user/project)

**Indexes:**
- `USER(email)`, `USER(email_verified)`, `USER(is_deleted, deletion_requested_at)`
- `PROJECT(host_user, status)`, `PROJECT(status, -created_at)`, `PROJECT(search_vector)` GIN
- `CONTRIBUTION(project, status, -created_at)`, `CONTRIBUTION(contributor_user, status, -created_at)`
- `CREDIT_LEDGER_ENTRY(to_user, -created_at)`

**State Transitions:**
- User: Registration → Verification → Login
- Project: DRAFT → OPEN → CLOSED (irreversible)
- Contribution: PENDING → ACCEPTED/DECLINED (one-time decision)

### API Design

**See:** `specs/001-platform-mvp/contracts/openapi.yaml` for complete OpenAPI 3.0 specification.

**Key Endpoints:**

**Authentication:**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/token/refresh
POST /api/v1/auth/verify-email
POST /api/v1/auth/logout
```

**Users:**
```
GET /api/v1/profile
PATCH /api/v1/profile
GET /api/v1/users/{userId}
```

**Projects:**
```
GET /api/v1/projects?search=keyword&tags=python,django&sort=newest
POST /api/v1/projects
GET /api/v1/projects/{projectId}
PATCH /api/v1/projects/{projectId}
POST /api/v1/projects/{projectId}/close
```

**Contributions:**
```
GET /api/v1/projects/{projectId}/contributions
POST /api/v1/projects/{projectId}/contributions
PATCH /api/v1/contributions/{contributionId}/accept
PATCH /api/v1/contributions/{contributionId}/decline
```

**Credits:**
```
GET /api/v1/me/credits/balance
GET /api/v1/me/credits/ledger
```

**Rate Limits:**
- Project creation: 10/hour per user
- Contribution submission: 20/hour per user
- General API: 100/minute per IP

## Testing Strategy

**Target Coverage:** >= 70% overall, 100% on critical paths (Principle 2)

### Unit Tests

**Authentication (users app):**
- User registration with valid data creates user and sends verification email
- User registration with duplicate email returns 409 error
- User login with verified email succeeds
- User login with unverified email returns 401 with clear message
- User login with invalid credentials returns 401
- Email verification with valid token marks email_verified=True
- Email verification with invalid/expired token returns 400

**Project Management (projects app):**
- Project creation with all required fields succeeds
- Project creation without required fields returns 400 validation error
- Project update by host succeeds
- Project update by non-host returns 403
- Project close by host sets status=CLOSED
- Project search by keyword returns matching projects
- Project filter by tags returns correct results
- Full-text search via GIN index performs < 100ms

**Contribution Workflow (contributions app):**
- Contribution submission to OPEN project succeeds
- Contribution submission to CLOSED project returns 403
- Contribution submission by project host returns 403
- Contribution acceptance by host updates status to ACCEPTED
- Contribution acceptance by non-host returns 403
- Contribution decline by host updates status to DECLINED
- Contribution acceptance on non-PENDING returns 409

**Credit System (credits app):**
- Credit award on first contribution acceptance creates ledger entry
- Duplicate credit award for same user/project raises IntegrityError (caught, returns creditAwarded=False)
- Credit balance calculation returns correct count
- Credit ledger entry save() with existing pk raises ValueError (append-only)
- Credit ledger entry delete() raises ValueError (append-only)
- Atomic transaction rollback on credit failure reverts contribution status

**GDPR Compliance (users app):**
- User anonymize() method clears PII fields
- Celery task anonymizes users after 30-day deletion period
- Soft deletion preserves contributions and credit ledger

### Integration Tests

**Projects API:**
- GET /api/v1/projects returns paginated results with 20 items
- GET /api/v1/projects?search=keyword filters correctly
- GET /api/v1/projects?tags=python,django filters by tags
- POST /api/v1/projects creates project (authenticated)
- POST /api/v1/projects returns 401 without authentication
- PATCH /api/v1/projects/{id} updates project (host only)
- POST /api/v1/projects/{id}/close closes project (host only)

**Contributions API:**
- POST /api/v1/projects/{id}/contributions creates contribution (authenticated, non-host, project OPEN)
- POST returns 403 if project CLOSED
- POST returns 403 if user is host
- PATCH /api/v1/contributions/{id}/accept awards credit and updates status
- PATCH returns 409 if contribution already decided
- PATCH returns 403 if user is not host
- GET /api/v1/projects/{id}/contributions shows all for host, accepted for public

**Credits API:**
- GET /api/v1/me/credits/balance returns correct balance
- GET /api/v1/me/credits/ledger returns transaction history
- Credit balance updates after contribution acceptance

**Email Service Resilience:**
- User registration succeeds even if SMTP service is down
- Failed email sends are queued for retry
- Celery task retries with exponential backoff (1m, 5m, 30m, 2h, 24h)
- Max 5 retry attempts before permanent failure
- Email queue processes when service recovers

**Rate Limiting:**
- 11th project creation within 1 hour returns 429
- 21st contribution within 1 hour returns 429
- Rate limit resets after time window expires

### End-to-End Tests

**Test 1: Complete Contribution Flow (Playwright)**
1. Host registers, verifies email, logs in
2. Host creates project with title, description, tags
3. Contributor registers, verifies email, logs in
4. Contributor searches projects by keyword
5. Contributor views project detail page
6. Contributor submits contribution with body and links
7. Host views project contributions page
8. Host accepts contribution
9. Verify contributor receives 1 credit
10. Verify contributor appears in "Accepted Contributors" list
11. Verify contributor's credit balance increased by 1

**Expected Duration:** < 30 seconds

**Test 2: SEO and Performance**
1. Navigate to project detail page
2. Verify H1 = project title
3. Verify H2 sections for "What This Project Does", "Acceptance Criteria", "Accepted Contributors"
4. Verify meta tags present (title, description, keywords)
5. Measure page load time (must be < 3 seconds)
6. Verify keywords naturally integrated in content

**Expected Duration:** < 10 seconds

**Test 3: Accessibility (WCAG 2.1 Level AA)**
1. Run axe-core automated audit (0 violations)
2. Test keyboard navigation: Tab through project feed, Enter to open project
3. Test keyboard form submission: Tab to fields, Enter to submit
4. Test screen reader: NVDA announces form labels, error messages
5. Verify focus indicators visible on all interactive elements
6. Verify color contrast meets 4.5:1 minimum
7. Test page zoom to 200% (no horizontal scroll)

**Expected Result:** Zero WCAG 2.1 Level AA violations

### Load & Performance Tests

**Test 1: Concurrent User Load (Locust)**
1. Simulate 500 concurrent users
2. Users browse projects, view details, submit contributions
3. Measure API response times under load
4. Verify p95 response time < 3 seconds
5. Monitor database connection pool (should not exceed 20 connections via pgBouncer)
6. Check for memory leaks or resource exhaustion

**Expected Result:** All endpoints respond within 3s at 500 concurrent users

**Test 2: Database Query Performance**
1. Seed database with 10,000 users, 100,000 projects, 500,000 contributions
2. Execute full-text search queries
3. Measure query time (must be < 100ms)
4. Execute credit balance calculation
5. Measure query time (must be < 20ms with index)

**Expected Result:** Performance targets met at scale

## User Experience Considerations

**Performance Target:** < 3 seconds response time (Principle 3)

### Loading States

- **Project Feed:** Skeleton cards while loading (15 cards matching layout)
- **Project Detail:** Skeleton for project content, contributions section
- **Contribution Submission:** Button shows spinner, disabled state during submission
- **Accept/Decline Actions:** Optimistic UI update (status changes immediately), rollback on error
- **Credit Balance:** Loading spinner on profile page during fetch

### Error Handling

- **Network Errors:** "Unable to connect. Please check your internet connection and try again." + Retry button
- **Validation Errors:** Field-level error messages below inputs (red text, clear description)
- **Authentication Errors:** "Invalid email or password" (login), "Email not verified. Check your inbox." (login unverified)
- **Permission Errors:** "You don't have permission to perform this action." (403)
- **Rate Limit Errors:** "You've reached the limit of 10 projects per hour. Try again in 45 minutes." (429)
- **404 Errors:** Custom 404 page with link back to project feed
- **500 Errors:** Custom 500 page: "Something went wrong on our end. We've been notified and are working on it."

### Responsive Design

- **Breakpoints:** 1920px (desktop large), 1440px (desktop), 1024px (tablet), 768px (mobile)
- **Desktop-First:** Optimized for desktop, mobile-compatible but not primary focus in MVP
- **Touch Targets:** Minimum 44x44px for buttons on mobile
- **Typography:** 16px base font size, scales to 14px on mobile
- **Navigation:** Sticky header on desktop, collapsible menu on mobile

### Accessibility (WCAG 2.1 Level AA)

- **Keyboard Navigation:** All interactive elements accessible via Tab, Shift+Tab, Enter, Space, Arrow keys
- **Focus Indicators:** 3px solid outline on focus, 3:1 contrast ratio with background
- **Screen Readers:** ARIA labels on icon buttons, `aria-describedby` linking errors to inputs, semantic HTML (`<nav>`, `<main>`, `<article>`)
- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text (18px+), verified with axe-core
- **Form Labels:** `<label>` associated with `<input>` via `htmlFor`, or `aria-label` for custom inputs
- **Error Announcements:** `role="alert"` on error messages for screen reader announcement
- **Skip Navigation:** "Skip to main content" link at top of page (visible on focus)

## Performance Benchmarks

- **Initial Page Load:** < 3 seconds on standard broadband (10 Mbps)
- **Project Feed:** < 1 second for first page (20 projects)
- **Project Detail:** < 3 seconds with contributions
- **Full-Text Search:** < 100ms query time with GIN index (100K projects)
- **Credit Balance:** < 20ms query time with index
- **API Response Time (p95):** < 3 seconds under 500 concurrent users
- **Database Connection Pool:** 20 connections sufficient for 500 concurrent users (pgBouncer transaction mode)
- **Bundle Size:** < 150KB gzipped (React + dependencies)

## Security & Permissions

### Authentication
- JWT access tokens: 1 hour expiry, stored in localStorage
- JWT refresh tokens: 7 days expiry, rotated on use, blacklisted on logout
- Email verification required before login (enforced in view)
- Password requirements: min 8 characters, must contain number or special char

### Authorization
- **Projects:**
  - Create: Authenticated users only
  - Update: Host only
  - Close: Host only
  - View: Public (OPEN projects), authenticated (DRAFT projects by host)
- **Contributions:**
  - Submit: Authenticated, non-host, project OPEN
  - Accept/Decline: Host only
  - View: Host (all), contributor (accepted + own), public (accepted only)
- **Credits:**
  - View balance: Own credits only
  - View ledger: Own ledger only

### Rate Limiting
- Project creation: 10/hour per user (prevents spam)
- Contribution submission: 20/hour per user (prevents spam)
- Login attempts: 5 failures → 15-minute lockout (brute force prevention)
- Global: 100 requests/minute per IP (DDoS prevention)

### Input Validation
- **XSS Prevention:** Django template auto-escaping, React JSX auto-escaping
- **SQL Injection:** Django ORM exclusively (no raw SQL)
- **CSRF Protection:** Django CSRF token on all POST/PUT/PATCH/DELETE
- **URL Validation:** Django `URLValidator` on all URL fields
- **JSON Validation:** DRF serializers validate structure and max lengths

### Audit Logging
- All credit transactions logged with `created_by_user`, `created_at`
- Contribution decisions logged with `decided_by_user`, `decided_at`
- User anonymization logged in application logs
- Failed login attempts logged (monitor for brute force)

## Rollout Plan

### Phase 1: Backend Foundation (Week 1-2)
- [x] Project setup (Django, virtual env, requirements.txt)
- [ ] Database schema implementation (models.py for all apps)
- [ ] Migrations created and tested
- [ ] Django admin configured for all models
- [ ] Authentication endpoints (register, login, verify email, refresh token)
- [ ] Email verification Celery task with retry logic
- [ ] User profile endpoints (GET, PATCH)
- [ ] Unit tests for authentication flow

### Phase 2: Projects & Search (Week 2-3)
- [ ] Project model with full-text search vector
- [ ] Project CRUD endpoints (list, create, retrieve, update, close)
- [ ] Tag creation and filtering
- [ ] PostgreSQL GIN index on search_vector
- [ ] Pagination implementation
- [ ] Rate limiting on project creation
- [ ] Unit tests for project management
- [ ] Integration tests for projects API

### Phase 3: Contributions & Credits (Week 3-4)
- [ ] Contribution model with decision tracking
- [ ] Contribution submission endpoint
- [ ] Contribution acceptance endpoint (atomic transaction)
- [ ] Credit ledger model (append-only, immutable)
- [ ] Credit balance and ledger endpoints
- [ ] Visibility logic (host/contributor/public)
- [ ] Rate limiting on contribution submission
- [ ] Unit tests for contribution workflow
- [ ] Unit tests for credit system (atomicity, uniqueness)
- [ ] Integration tests for contributions API

### Phase 4: Frontend Core (Week 4-5)
- [ ] Vite project setup with TypeScript
- [ ] React Router configuration
- [ ] TanStack Query setup
- [ ] API client with token refresh interceptor
- [ ] Authentication pages (login, register, verify email)
- [ ] Project feed page with search and filters
- [ ] Project detail page
- [ ] Contribution submission form
- [ ] User profile page

### Phase 5: Frontend Polish (Week 5)
- [ ] shadcn/ui components integration
- [ ] Form validation with react-hook-form + zod
- [ ] Loading states (skeletons, spinners)
- [ ] Error handling and user-friendly messages
- [ ] Optimistic UI updates for accept/decline
- [ ] Responsive design (mobile-compatible)
- [ ] Keyboard navigation
- [ ] Focus indicators

### Phase 6: Testing & Accessibility (Week 5-6)
- [ ] Backend unit tests (>= 70% coverage)
- [ ] Backend integration tests (all endpoints)
- [ ] Frontend unit tests (critical components)
- [ ] E2E tests (Playwright: complete flow, SEO, accessibility)
- [ ] axe-core automated accessibility audit (0 violations)
- [ ] Manual keyboard navigation testing
- [ ] Manual screen reader testing (NVDA/JAWS)
- [ ] Load testing (500 concurrent users)
- [ ] Performance testing (< 3s response times)

### Phase 7: GDPR & Security (Week 6)
- [ ] User deletion request endpoint
- [ ] Celery Beat task for 30-day anonymization
- [ ] Data export endpoint (JSON)
- [ ] Cookie consent banner
- [ ] Privacy policy page
- [ ] Rate limiting on all endpoints
- [ ] Security review (CSRF, XSS, SQL injection)
- [ ] Penetration testing (optional, recommended)

### Phase 8: Deployment (Week 6)
- [ ] Backend deployed to Render/Fly.io/Railway
- [ ] PostgreSQL managed database provisioned
- [ ] Redis managed instance provisioned
- [ ] Celery worker and beat configured
- [ ] Environment variables set
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Domain and SSL configured
- [ ] Email service configured (SendGrid/Mailgun)
- [ ] Monitoring configured (Sentry, APM)
- [ ] Production smoke tests

## Success Metrics

**User Engagement:**
- 100 registered users in first month
- 50 projects created in first month
- 200 contributions submitted in first month
- 30% contribution acceptance rate

**Performance:**
- 95% of API responses < 3 seconds
- 99% uptime
- 0 critical security vulnerabilities
- 70%+ test coverage maintained

**Accessibility:**
- 0 WCAG 2.1 Level AA violations (axe-core)
- Keyboard navigation functional on all pages
- Screen reader compatible

**GDPR Compliance:**
- 100% of deletion requests processed within 30 days
- Data export available on demand
- Privacy policy published and accessible

## Open Questions

- [x] ~~Should we implement real-time notifications?~~ → **Resolved:** No for MVP. Email queue sufficient. WebSockets post-MVP.
- [x] ~~Should we support Markdown in project descriptions?~~ → **Resolved:** Yes, with sanitization using django-markdownify + bleach.
- [x] ~~Should we implement project categories vs. freeform tags?~~ → **Resolved:** Freeform tags for MVP. Categories via tag grouping post-MVP.
- [x] ~~Should we track contribution view counts?~~ → **Resolved:** No for MVP. Analytics deferred to post-MVP.
- [x] ~~Should we allow editing contributions after submission?~~ → **Resolved:** No for MVP. Prevents abuse (editing after acceptance). Future: allow editing PENDING only.

## Approval

- [x] Constitution compliance verified (Code Quality, Test Coverage, User Experience, Performance)
- [x] Technical review completed (research.md, data-model.md, openapi.yaml generated)
- [x] UX review completed (loading states, error handling, accessibility defined)
- [x] Ready for implementation

---
*This plan adheres to the InterfaceHive Constitution v1.0.0*
