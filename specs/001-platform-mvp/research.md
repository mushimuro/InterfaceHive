# Technical Research & Decisions: InterfaceHive Platform MVP

**Date:** 2025-12-22
**Status:** Approved

## Overview

This document consolidates all technical decisions made during the planning phase, including technology choices, architectural patterns, and implementation strategies. Each decision includes rationale and alternatives considered.

## Core Technology Stack

### Decision 1: Backend Framework - Django + Django REST Framework

**Decision:** Use Django 5.x with Django REST Framework for the backend API.

**Rationale:**
1. **Mature ORM:** Django ORM provides ACID transactions critical for credit system integrity
2. **Built-in Admin:** Django admin interface accelerates moderation tool development
3. **Security Features:** CSRF protection, SQL injection prevention, XSS protection out-of-the-box
4. **DRF Ecosystem:** Excellent serialization, viewsets, permissions, browsable API
5. **GDPR Support:** Model fields, query filtering, and scheduled jobs easily implement data deletion/export
6. **Team Familiarity:** User specified Django as preferred backend framework

**Alternatives Considered:**
- **FastAPI:** Faster performance but less mature ecosystem, no built-in admin, more boilerplate for ORM transactions
- **Flask + SQLAlchemy:** More flexibility but requires more manual setup for security, admin, API serialization
- **Node.js (Express/NestJS):** Different language, less suited for transactional workloads, team prefers Python

**Implementation Notes:**
- Use DRF viewsets for CRUD operations (reduces boilerplate)
- Use DRF serializers for validation (matches frontend zod schemas)
- Use djangorestframework-simplejwt for stateless authentication

---

### Decision 2: Frontend Framework - React + TypeScript

**Decision:** Use React 18 with TypeScript, shadcn/ui components, and TanStack Query for data fetching.

**Rationale:**
1. **Component Reusability:** React's component model fits project/contribution card patterns
2. **Type Safety:** TypeScript catches errors at compile-time, improves DX
3. **shadcn/ui:** Accessible components (WCAG 2.1 AA compliant), customizable, no runtime overhead
4. **TanStack Query:** Best-in-class caching, optimistic updates, background refetching
5. **Large Ecosystem:** Abundant libraries for forms (react-hook-form), routing (react-router), testing (RTL)
6. **Team Familiarity:** User specified React + shadcn as preferred frontend stack

**Alternatives Considered:**
- **Vue 3:** Simpler learning curve but smaller ecosystem for enterprise features
- **Svelte:** Better performance but immature ecosystem, fewer UI libraries
- **Next.js (React SSR):** Overkill for SPA, adds deployment complexity (need Node.js server)

**Implementation Notes:**
- Use React Router v6 for client-side routing
- Use react-hook-form + zod for form validation (type-safe, performant)
- Use Tailwind CSS with shadcn/ui for styling
- Use React.lazy() + Suspense for code splitting

---

### Decision 3: Database - PostgreSQL 15+

**Decision:** Use PostgreSQL as the primary relational database.

**Rationale:**
1. **ACID Transactions:** Critical for atomic credit awards (prevent double-crediting)
2. **Unique Constraints:** Partial unique index enforces "1 credit per user/project" business rule
3. **Full-Text Search:** Built-in GIN indexes for project search (no external service needed)
4. **JSON Fields:** Native JSONB support for `skills`, `links` arrays (flexible schema)
5. **Mature Ecosystem:** Excellent Django ORM support, battle-tested reliability
6. **Team Familiarity:** User specified Postgres as preferred database

**Alternatives Considered:**
- **MySQL/MariaDB:** Less advanced full-text search, weaker JSON support
- **MongoDB:** NoSQL unsuitable for transactional workloads (credit system requires ACID)
- **SQLite:** Not suitable for production (no concurrent writes, no connection pooling)

**Implementation Notes:**
- Create GIN index on `tsvector` for full-text search (title + description)
- Use partial unique index: `UNIQUE(project_id, to_user_id) WHERE entry_type='AWARD'`
- Configure connection pooling (20 connections for 500 concurrent users)

---

### Decision 4: Message Queue - Redis + Celery

**Decision:** Use Redis as broker and Celery for asynchronous task processing.

**Rationale:**
1. **Email Resilience:** Celery task retry with exponential backoff (1m, 5m, 30m, 2h, 24h)
2. **Scheduled Jobs:** Celery Beat for GDPR data anonymization (daily job)
3. **Non-Blocking:** Email failures don't block user operations (improves UX)
4. **Django Integration:** Excellent Django-Celery integration, well-documented
5. **Redis Benefits:** Can also serve as session cache, rate limiting store

**Alternatives Considered:**
- **RabbitMQ:** More features but heavier, overkill for simple email queue
- **AWS SQS:** Vendor lock-in, higher latency for retry logic
- **No Queue (Synchronous Email):** Blocks operations, poor UX if email service down

**Implementation Notes:**
- Configure Celery with Redis broker: `redis://localhost:6379/0`
- Set max retries: 5 attempts with exponential backoff
- Use Celery Beat for scheduled tasks (data anonymization job)

---

## Authentication & Security

### Decision 5: Authentication - JWT with httpOnly Cookies

**Decision:** Use JWT tokens (simplejwt) with access token in localStorage and refresh token in httpOnly cookie.

**Rationale:**
1. **Stateless:** JWT tokens enable horizontal scaling (no session store required)
2. **SPA-Friendly:** Access token in localStorage for API requests
3. **XSS Protection:** Refresh token in httpOnly cookie (not accessible to JavaScript)
4. **Token Refresh:** 1-hour access token, 7-day refresh token balances security and UX
5. **Logout Capability:** Refresh token blacklist on logout (security best practice)

**Alternatives Considered:**
- **Session-Based Auth:** Requires session store (Redis), adds complexity, not stateless
- **OAuth2 (Google/GitHub):** Not needed for MVP, adds external dependencies
- **Both Tokens in localStorage:** Vulnerable to XSS attacks (refresh token theft)

**Implementation Notes:**
- Access token: 1-hour expiration, stored in localStorage
- Refresh token: 7-day expiration, httpOnly cookie (secure, sameSite: strict)
- Include refresh token in blacklist on logout

---

### Decision 6: API Versioning - URL Path Versioning

**Decision:** Use URL path versioning (`/api/v1/*`) for all endpoints.

**Rationale:**
1. **Explicit:** Version clearly visible in URL, easy to understand
2. **Routing:** Simple to route different versions to different handlers
3. **Industry Standard:** Most REST APIs use path versioning (Stripe, GitHub, Twilio)
4. **Client Clarity:** Clients explicitly choose version (no negotiation)
5. **Backward Compatibility:** Old clients continue working on `/api/v1/` while v2 is developed

**Alternatives Considered:**
- **Header-Based (`Accept: application/vnd.interfacehive.v1+json`):** Less discoverable, harder to test
- **Query Parameter (`/api/projects?version=1`):** Non-standard, complicates caching
- **No Versioning:** Breaking changes would break all clients immediately

**Implementation Notes:**
- All endpoints prefixed with `/api/v1/`
- Deprecated endpoints supported for 6 months with `Deprecation` header
- API changelog documents version changes

---

## Data Architecture

### Decision 7: GDPR Soft Deletion Strategy

**Decision:** Use soft deletion (`isDeleted` flag) with scheduled anonymization after 30 days.

**Rationale:**
1. **Audit Trail:** Preserves project/contribution history for platform integrity
2. **GDPR Compliance:** Meets "right to erasure" while maintaining audit logs
3. **Graceful Degradation:** Deleted users show as "Deleted User" (content remains)
4. **30-Day Grace Period:** Users can cancel deletion request (prevents accidental deletion)
5. **Legal Safety:** Anonymization (not full deletion) meets GDPR while preserving business records

**Alternatives Considered:**
- **Hard Deletion:** Violates audit requirements, cascades delete projects/contributions
- **Immediate Anonymization:** No grace period for users to cancel
- **Keep All Data Forever:** Violates GDPR "right to erasure"

**Implementation Notes:**
- User model fields: `isDeleted`, `deletion_requested_at`, `data_anonymized_at`
- Celery task runs daily, finds users with `deletion_requested_at > 30 days ago`
- Anonymization: email → `deleted-{uuid}@anonymized.local`, display_name → "Deleted User", clear bio/skills/links

---

### Decision 8: Credit System - Append-Only Ledger with Unique Constraint

**Decision:** Use append-only ledger (`CreditLedgerEntry`) with database-level unique constraint.

**Rationale:**
1. **Immutability:** Append-only ensures no tampering (audit trail)
2. **Atomic Awards:** Database transaction + unique constraint prevents double-crediting
3. **Reversals:** Reversal entries (negative amount) instead of deleting original entry
4. **Race Condition Safety:** Unique constraint handles concurrent accept requests
5. **Auditability:** Full history of all credit transactions with timestamps

**Alternatives Considered:**
- **Credits Field on User:** Prone to race conditions, no audit trail, reversals difficult
- **Application-Level Locking:** Slower, error-prone, doesn't prevent database-level races
- **External Ledger Service:** Over-engineered for MVP, adds dependency

**Implementation Notes:**
- Unique constraint: `UNIQUE(project_id, to_user_id) WHERE entry_type='AWARD'`
- Use Django `select_for_update()` in transaction for extra safety
- Credit balance computed: `SELECT COUNT(*) WHERE entry_type='AWARD'`

---

## Performance Optimization

### Decision 9: Full-Text Search - PostgreSQL GIN Index

**Decision:** Use PostgreSQL's built-in full-text search with GIN index on `tsvector`.

**Rationale:**
1. **No External Service:** Avoids dependency on Elasticsearch/Algolia
2. **Good Enough for MVP:** PostgreSQL FTS handles 10K projects, <50ms query time
3. **Integrated:** Works seamlessly with Django ORM
4. **Cost-Effective:** No additional infrastructure costs
5. **Scalability Path:** Can migrate to Elasticsearch later if needed

**Alternatives Considered:**
- **Elasticsearch:** Overkill for MVP, adds infrastructure complexity, cost
- **Algolia:** Vendor lock-in, pricing scales with records, unnecessary for MVP scale
- **LIKE Queries:** Slow on large datasets, no relevance ranking

**Implementation Notes:**
- Add `search_vector` field: `SearchVectorField()` on Project model
- Create GIN index: `CREATE INDEX idx_project_search ON project USING GIN(search_vector)`
- Update `search_vector` on save: trigger or Django signal

---

### Decision 10: Frontend Caching - TanStack Query with 5-Minute Stale Time

**Decision:** Use TanStack Query with 5-minute `staleTime` for project data, 1-minute for contributions.

**Rationale:**
1. **Reduced API Calls:** Projects rarely change; aggressive caching reduces server load
2. **Background Refetch:** TanStack Query refetches stale data in background (no loading spinners)
3. **Optimistic Updates:** Accept/decline contributions update cache immediately
4. **Automatic Invalidation:** Mutation triggers re-fetch of related queries
5. **Improved UX:** Instant navigation between cached pages

**Alternatives Considered:**
- **No Caching:** Every navigation = API call (slow, bad UX, higher server load)
- **Redux:** More boilerplate, manual cache invalidation, no background refetch
- **SWR:** Similar to TanStack Query but less features (no mutation hooks)

**Implementation Notes:**
- Project list: `staleTime: 5 * 60 * 1000` (5 minutes)
- Contributions: `staleTime: 1 * 60 * 1000` (1 minute)
- Invalidate queries on mutation: `queryClient.invalidateQueries(['projects', projectId])`

---

## Accessibility Strategy

### Decision 11: WCAG 2.1 Level AA Compliance

**Decision:** Target WCAG 2.1 Level AA compliance with automated axe-core audits.

**Rationale:**
1. **Legal Compliance:** AA is sufficient for most jurisdictions (US Section 508, EU accessibility directive)
2. **User Inclusivity:** Supports users with visual, auditory, motor, cognitive disabilities
3. **Industry Standard:** Most modern web apps target AA (AAA is often unnecessary)
4. **Automated Testing:** axe-core integration in CI/CD catches violations early
5. **shadcn/ui Support:** shadcn components are WCAG AA compliant out-of-the-box

**Alternatives Considered:**
- **WCAG 2.1 Level AAA:** Too stringent, diminishing returns, not legally required
- **Basic Accessibility Only:** Legal risk, excludes users with disabilities
- **No Formal Standard:** Inconsistent implementation, no clear success criteria

**Implementation Notes:**
- Run axe-core in Jest tests: `axe(container)` on all components
- Manual testing with NVDA screen reader
- Ensure color contrast ratios: 4.5:1 (normal text), 3:1 (large text, UI controls)
- Keyboard navigation: all interactive elements reachable via Tab, focus indicators visible

---

## Deployment & DevOps

### Decision 12: Development Environment - Docker Compose

**Decision:** Use Docker Compose for local development with separate containers for frontend, backend, PostgreSQL, Redis.

**Rationale:**
1. **Consistent Environment:** All developers have identical setup (no "works on my machine")
2. **Quick Onboarding:** New developers run `docker-compose up` (no manual installs)
3. **Service Isolation:** PostgreSQL and Redis isolated from host system
4. **Production Parity:** Container setup mirrors production deployment
5. **Easy Testing:** Can spin up isolated test databases

**Alternatives Considered:**
- **Native Installation:** Inconsistent environments, manual setup per dev, Windows/Mac/Linux differences
- **Virtual Machines (Vagrant):** Heavier, slower than containers
- **Dev Containers (VS Code):** Vendor-specific, less flexible than Docker Compose

**Implementation Notes:**
- `docker-compose.yml` with services: frontend (React dev server), backend (Django runserver), postgres, redis
- Volume mounts for hot reloading: `./backend:/app` (Django), `./frontend:/app` (React)
- Healthchecks ensure services start in order

---

### Decision 13: Monitoring & Error Tracking - Sentry

**Decision:** Use Sentry for error tracking and performance monitoring.

**Rationale:**
1. **Error Aggregation:** Groups similar errors, prioritizes by frequency/impact
2. **Source Maps:** Shows original TypeScript/React code in stack traces
3. **Context:** Captures user, request, environment data for debugging
4. **Free Tier:** 5K events/month sufficient for MVP
5. **Integration:** Excellent Django and React SDKs

**Alternatives Considered:**
- **Rollbar:** Similar features, less popular, smaller community
- **Custom Logging:** No aggregation, no context, difficult to debug production issues
- **Datadog/New Relic:** Overkill for MVP, expensive

**Implementation Notes:**
- Django: `sentry_sdk.init(dsn=os.getenv('SENTRY_DSN'))`
- React: `Sentry.init({ dsn, integrations: [new BrowserTracing()] })`
- Set environment tags: `environment: 'production'`

---

## Testing Strategy

### Decision 14: Testing Tools - pytest (Backend), Jest + RTL (Frontend), Playwright (E2E)

**Decision:** Use pytest for backend unit/integration tests, Jest + React Testing Library for frontend, Playwright for end-to-end tests.

**Rationale:**
1. **pytest:** Best Python testing framework, excellent Django plugin, fixture system
2. **Jest + RTL:** Standard React testing tools, good accessibility testing support
3. **Playwright:** Cross-browser E2E testing, faster than Selenium, better API
4. **Separation of Concerns:** Unit tests fast (<5min), E2E tests comprehensive but slower
5. **CI/CD Integration:** All tools have excellent CI/CD support

**Alternatives Considered:**
- **Cypress (E2E):** Browser-only, no multi-tab support, slower than Playwright
- **unittest (Backend):** Less features than pytest, more boilerplate
- **Enzyme (Frontend):** Deprecated, RTL is new standard

**Implementation Notes:**
- Backend: `pytest-django`, `factory-boy` for fixtures, `pytest-cov` for coverage
- Frontend: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- E2E: Playwright with codegen for generating tests

---

## Open Technical Decisions

### Pending Decision 1: Production Deployment Platform

**Options:**
1. **AWS ECS/Fargate:** Scalable, mature, higher cost, requires AWS expertise
2. **Render:** Simple, managed PostgreSQL/Redis, lower cost, automatic deployments from Git
3. **Fly.io:** Global edge deployment, lower latency, Docker-native
4. **DigitalOcean App Platform:** Simple, lower cost, good for startups

**Recommendation:** **Render** - best balance of simplicity, cost, and managed services for MVP. Provides managed PostgreSQL, Redis, and automatic deployments from Git.

---

### Pending Decision 2: Analytics Platform

**Options:**
1. **Google Analytics:** Free, comprehensive, but privacy-invasive (requires GDPR cookie consent)
2. **Plausible:** Privacy-friendly, no cookies, simple, paid ($9/month)
3. **Umami:** Self-hosted, privacy-friendly, free, requires maintenance
4. **No Analytics:** Simplest, no privacy concerns, but no user behavior insights

**Recommendation:** **Plausible** - privacy-friendly (no cookie consent needed), simple to integrate, affordable for MVP. Defer decision until post-launch.

---

## Summary of Key Technical Decisions

| Category | Decision | Rationale |
|----------|----------|-----------|
| Backend | Django + DRF | Mature ORM, built-in admin, security, GDPR support |
| Frontend | React + TypeScript + shadcn/ui | Component reusability, type safety, accessible UI |
| Database | PostgreSQL 15+ | ACID transactions, unique constraints, full-text search |
| Queue | Redis + Celery | Email resilience, scheduled jobs, non-blocking operations |
| Auth | JWT (simplejwt) | Stateless, SPA-friendly, XSS protection (httpOnly cookies) |
| API Versioning | URL path (`/api/v1/`) | Explicit, industry standard, client clarity |
| GDPR | Soft deletion + 30-day anonymization | Audit trail, grace period, legal compliance |
| Credits | Append-only ledger + unique constraint | Immutability, atomic awards, race condition safety |
| Search | PostgreSQL GIN index | No external service, good enough for MVP, cost-effective |
| Caching | TanStack Query (5min stale time) | Reduced API calls, background refetch, optimistic updates |
| Accessibility | WCAG 2.1 Level AA | Legal compliance, user inclusivity, automated testing |
| Development | Docker Compose | Consistent environment, quick onboarding, production parity |
| Monitoring | Sentry | Error aggregation, source maps, context, free tier |
| Testing | pytest + Jest + Playwright | Best-in-class tools, CI/CD integration, coverage tracking |

---

## References
- Django Documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- React Documentation: https://react.dev/
- TanStack Query: https://tanstack.com/query/latest
- PostgreSQL Full-Text Search: https://www.postgresql.org/docs/current/textsearch.html
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Celery Documentation: https://docs.celeryq.dev/
- Sentry Documentation: https://docs.sentry.io/

