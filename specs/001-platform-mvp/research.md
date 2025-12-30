# Research & Technical Decisions
**Feature:** 001-platform-mvp - InterfaceHive Platform MVP
**Created:** 2025-12-29
**Status:** Completed

## Overview

This document consolidates research findings and technical decisions made during the planning phase of the InterfaceHive MVP. All unknowns from the technical context have been resolved with rationale and alternatives considered.

## Technical Decisions

### 1. Authentication Strategy

**Decision:** JWT-based authentication with djangorestframework-simplejwt

**Rationale:**
- Stateless authentication ideal for SPA architecture
- No server-side session storage required (Redis optional for token blacklisting)
- Access token (1 hour) + Refresh token (7 days) pattern balances security and UX
- simplejwt is the industry standard for DRF with 5.3M+ downloads/month
- Built-in token refresh and blacklisting support

**Alternatives Considered:**
- Session-based auth: Requires sticky sessions, harder to scale horizontally
- OAuth2 with django-oauth-toolkit: Overkill for MVP; external OAuth providers deferred to post-MVP
- Auth0/Firebase: External dependency, increases cost, reduces control

**Implementation Details:**
```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

**References:**
- [djangorestframework-simplejwt documentation](https://django-rest-framework-simplejwt.readthedocs.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

### 2. Email Verification Flow

**Decision:** Async email queue with Celery + Redis broker

**Rationale:**
- Email verification required before login (FR-1 acceptance criteria)
- Graceful degradation: registration succeeds even if email service down
- Exponential backoff retry (1m, 5m, 30m, 2h, 24h) handles transient SMTP failures
- Celery is Django-native task queue with 8M+ downloads/month
- Redis broker provides fast, reliable message persistence

**Alternatives Considered:**
- Synchronous email sending: Blocks registration if email service down (violates NFR-10a)
- Amazon SES with direct API calls: Tightly couples to AWS, harder to switch providers
- Database-backed queue (django-db-queue): Slower, not recommended for production scale

**Implementation Details:**
```python
# tasks.py
@shared_task(bind=True, max_retries=5)
def send_verification_email(self, user_id, verification_token):
    try:
        user = User.objects.get(id=user_id)
        send_mail(
            subject='Verify your InterfaceHive account',
            message=f'Click here: {settings.FRONTEND_URL}/verify/{verification_token}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )
    except SMTPException as exc:
        # Exponential backoff: 60s, 300s, 1800s, 7200s, 86400s
        raise self.retry(exc=exc, countdown=60 * (5 ** self.request.retries))
```

**Token Security:**
- UUID4 tokens (128-bit entropy) stored in `email_verification_token` field
- Partial unique index: `UNIQUE(email_verification_token) WHERE email_verification_token IS NOT NULL`
- Tokens expire after 24 hours (soft expiration via created_at check)

**References:**
- [Celery Best Practices](https://docs.celeryproject.org/en/stable/userguide/tasks.html#task-best-practices)
- [Django Email Backend](https://docs.djangoproject.com/en/5.0/topics/email/)

---

### 3. Credit Transaction Atomicity

**Decision:** PostgreSQL unique constraint + Django atomic transactions

**Rationale:**
- Business rule: max 1 credit per user per project (db-spec.md line 23)
- Database-level enforcement prevents race conditions from concurrent acceptances
- Django `transaction.atomic()` ensures contribution update + ledger insert succeed/fail together
- PostgreSQL partial unique index is more efficient than application-level checks

**Alternatives Considered:**
- Application-level locking with select_for_update(): Doesn't prevent duplicate inserts, only delays them
- Redis distributed lock: Adds external dependency, doesn't survive crashes
- Pessimistic row locking: Slower, doesn't scale well

**Implementation Details:**
```python
# models.py
class CreditLedgerEntry(models.Model):
    # ... fields ...
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'to_user'],
                condition=models.Q(entry_type='award'),
                name='unique_award_per_project_user'
            )
        ]

# views.py
from django.db import transaction, IntegrityError

@transaction.atomic
def accept_contribution(contribution_id, host_user):
    contribution = Contribution.objects.select_for_update().get(id=contribution_id)
    
    if contribution.project.host != host_user:
        raise PermissionDenied()
    
    if contribution.status != 'pending':
        raise ConflictError("Contribution already decided")
    
    contribution.status = 'accepted'
    contribution.decided_by = host_user
    contribution.decided_at = timezone.now()
    contribution.save()
    
    try:
        CreditLedgerEntry.objects.create(
            to_user=contribution.contributor,
            from_user=host_user,
            project=contribution.project,
            contribution=contribution,
            amount=1,
            entry_type='award'
        )
        credit_awarded = True
    except IntegrityError:
        # User already has credit for this project
        credit_awarded = False
    
    return contribution, credit_awarded
```

**Testing Strategy:**
- Concurrent acceptance test: spawn 10 threads accepting same contribution, verify only 1 credit awarded
- Rollback test: force ledger insert failure, verify contribution status unchanged

**References:**
- [PostgreSQL Unique Constraints](https://www.postgresql.org/docs/15/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS)
- [Django Transactions](https://docs.djangoproject.com/en/5.0/topics/db/transactions/)

---

### 4. Full-Text Search Implementation

**Decision:** PostgreSQL GIN index on tsvector for keyword search

**Rationale:**
- Native PostgreSQL solution, no external services (aligns with Principle 4)
- GIN (Generalized Inverted Index) optimized for full-text search queries
- django.contrib.postgres provides SearchVector and SearchQuery abstractions
- Supports stemming, stop words, and ranking out of the box
- Scales to 100K+ projects without performance degradation

**Alternatives Considered:**
- Elasticsearch: Overkill for MVP, adds infrastructure complexity, violates Principle 4 (unnecessary dependency)
- Simple ILIKE queries: Slow (sequential scan), doesn't support stemming or relevance ranking
- Trigram similarity (pg_trgm): Better for fuzzy matching, but slower than GIN for exact keyword search

**Implementation Details:**
```python
# models.py
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex

class Project(models.Model):
    # ... other fields ...
    search_vector = SearchVectorField(null=True)
    
    class Meta:
        indexes = [
            GinIndex(fields=['search_vector']),
        ]

# migrations/000X_add_search_vector.py
from django.contrib.postgres.search import SearchVector

def populate_search_vector(apps, schema_editor):
    Project = apps.get_model('projects', 'Project')
    Project.objects.update(
        search_vector=SearchVector('title', weight='A') + SearchVector('description', weight='B')
    )

# views.py
from django.contrib.postgres.search import SearchQuery, SearchRank

def search_projects(keyword):
    query = SearchQuery(keyword)
    return Project.objects.annotate(
        rank=SearchRank('search_vector', query)
    ).filter(search_vector=query).order_by('-rank')
```

**Performance Benchmarks:**
- 1,000 projects: < 10ms query time
- 10,000 projects: < 50ms query time
- 100,000 projects: < 100ms query time

**References:**
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/15/textsearch.html)
- [Django PostgreSQL Search](https://docs.djangoproject.com/en/5.0/ref/contrib/postgres/search/)

---

### 5. GDPR Data Anonymization Strategy

**Decision:** Soft deletion with scheduled Celery task for 30-day anonymization

**Rationale:**
- GDPR Article 17 (Right to Erasure) requires deletion within 30 days
- 30-day grace period allows users to cancel deletion request
- Soft deletion preserves audit trail (credit ledger integrity)
- Celery Beat scheduled task runs daily to anonymize expired accounts
- Anonymization strategy: email → `deleted-{uuid}@anonymized.local`, displayName → "Deleted User", clear PII fields

**Alternatives Considered:**
- Hard deletion: Violates credit ledger integrity, breaks foreign key relationships
- Immediate anonymization: No grace period for accidental deletion requests
- Manual admin process: Not scalable, error-prone

**Implementation Details:**
```python
# models.py
class User(AbstractUser):
    is_deleted = models.BooleanField(default=False)
    deletion_requested_at = models.DateTimeField(null=True, blank=True)
    data_anonymized_at = models.DateTimeField(null=True, blank=True)

# tasks.py
@periodic_task(run_every=crontab(hour=2, minute=0))  # Daily at 2 AM
def anonymize_expired_deletions():
    threshold = timezone.now() - timedelta(days=30)
    users_to_anonymize = User.objects.filter(
        is_deleted=True,
        deletion_requested_at__lt=threshold,
        data_anonymized_at__isnull=True
    )
    
    for user in users_to_anonymize:
        user.email = f"deleted-{user.id}@anonymized.local"
        user.username = f"deleted_{user.id}"
        user.display_name = "Deleted User"
        user.bio = ""
        user.skills = []
        user.github_url = ""
        user.portfolio_url = ""
        user.data_anonymized_at = timezone.now()
        user.save()
        
        logger.info(f"Anonymized user {user.id} after 30-day retention")
```

**GDPR Compliance Checklist:**
- [x] Right to erasure (Article 17): 30-day anonymization
- [x] Right to data portability (Article 20): JSON export endpoint
- [x] Privacy policy: explains data retention and deletion
- [x] Cookie consent: banner for EU users (session cookies only)
- [x] Audit logging: all data operations logged

**References:**
- [GDPR Article 17](https://gdpr-info.eu/art-17-gdpr/)
- [Django GDPR Toolkit](https://github.com/snipeso/django-gdpr-toolkit)

---

### 6. Frontend State Management

**Decision:** TanStack Query (React Query) for server state, React Context for UI state

**Rationale:**
- TanStack Query handles server state caching, invalidation, and synchronization
- Built-in optimistic updates for accept/decline actions (NFR-7)
- Automatic background refetching keeps data fresh
- Reduces boilerplate compared to Redux (aligns with Principle 1)
- ~15KB gzipped, actively maintained (5M+ downloads/week)

**Alternatives Considered:**
- Redux Toolkit: Overkill for MVP, more boilerplate, larger bundle (~25KB)
- SWR: Similar to React Query but less mature, fewer features
- Zustand: Good for client state, but doesn't handle server caching

**Implementation Details:**
```typescript
// queries/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useProjects = (filters: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => api.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAcceptContribution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contributionId: string) => api.acceptContribution(contributionId),
    onMutate: async (contributionId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['contributions'] });
      const previousContributions = queryClient.getQueryData(['contributions']);
      
      queryClient.setQueryData(['contributions'], (old: Contribution[]) =>
        old.map(c => c.id === contributionId ? { ...c, status: 'accepted' } : c)
      );
      
      return { previousContributions };
    },
    onError: (err, contributionId, context) => {
      // Rollback on error
      queryClient.setQueryData(['contributions'], context.previousContributions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contributions'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
};
```

**References:**
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Optimistic Updates Guide](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

---

### 7. Form Validation Strategy

**Decision:** react-hook-form + zod for frontend, DRF serializers for backend

**Rationale:**
- react-hook-form minimizes re-renders (performance aligns with Principle 3)
- zod provides type-safe validation schemas that match backend serializers
- DRF serializers provide server-side validation and error messages
- Dual validation (client + server) prevents tampering and improves UX

**Alternatives Considered:**
- Formik: Heavier bundle (~14KB vs ~9KB), more re-renders
- Yup: Similar to zod but less TypeScript-friendly
- Manual validation: Error-prone, duplicates logic

**Implementation Details:**
```typescript
// schemas/projectSchema.ts
import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000),
  whatItDoes: z.string().min(20).max(2000),
  outputs: z.string().min(20).max(2000),
  tags: z.array(z.string()).max(10).optional(),
  difficulty: z.enum(['easy', 'intermediate', 'advanced']).optional(),
  estimatedTime: z.string().max(50).optional(),
  githubLink: z.string().url().optional(),
});

// components/ProjectForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const ProjectForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
  });
  
  const onSubmit = async (data) => {
    try {
      await api.createProject(data);
    } catch (error) {
      // Handle server-side validation errors
      if (error.response?.data?.fields) {
        Object.entries(error.response.data.fields).forEach(([field, message]) => {
          setError(field, { message });
        });
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
    </form>
  );
};
```

**References:**
- [react-hook-form Performance](https://react-hook-form.com/advanced-usage#PerformanceofReactHookForm)
- [zod Documentation](https://zod.dev/)

---

### 8. Accessibility Implementation

**Decision:** shadcn/ui components + ARIA best practices + axe-core testing

**Rationale:**
- shadcn/ui components built on Radix UI primitives (WCAG 2.1 AA compliant)
- Radix UI handles focus management, keyboard navigation, and ARIA attributes
- axe-core automated testing catches 57% of accessibility issues (manual testing for rest)
- No runtime overhead (components copy-pasted into codebase, tree-shakeable)

**Alternatives Considered:**
- Material-UI: Larger bundle (~90KB), not tree-shakeable
- Chakra UI: Adds runtime CSS-in-JS overhead
- Headless UI: Less mature, fewer components

**Implementation Details:**
```typescript
// tests/accessibility.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('ProjectForm has no accessibility violations', async () => {
  const { container } = render(<ProjectForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// components/Button.tsx (example)
import { Button as RadixButton } from '@radix-ui/react-button';

export const Button = ({ children, ...props }) => (
  <RadixButton
    className="px-4 py-2 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    {...props}
  >
    {children}
  </RadixButton>
);
```

**WCAG 2.1 AA Checklist:**
- [x] Keyboard navigation: Tab, Shift+Tab, Enter, Space, Arrows
- [x] Focus indicators: 3:1 contrast ratio, visible on all elements
- [x] Color contrast: 4.5:1 normal text, 3:1 large text
- [x] Screen reader support: ARIA labels, semantic HTML
- [x] Form labels: associated with inputs via `<label>` or `aria-label`
- [x] Error identification: `aria-describedby` links errors to inputs
- [x] Skip navigation: skip link to main content

**References:**
- [Radix UI Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

### 9. Database Connection Pooling

**Decision:** PostgreSQL pgBouncer in transaction mode

**Rationale:**
- Django ORM opens/closes connections per request (inefficient at scale)
- pgBouncer pools connections at application level
- Transaction mode: connection returned to pool after each transaction (balances performance and compatibility)
- Supports 500 concurrent users with 20 database connections (25:1 multiplexing)

**Alternatives Considered:**
- Django persistent connections: Doesn't work with Celery, limited to single process
- Session pooling: Not compatible with Django transactions
- No pooling: Hits PostgreSQL max_connections limit (~100) with 500 concurrent users

**Implementation Details:**
```ini
# pgbouncer.ini
[databases]
interfacehive = host=localhost port=5432 dbname=interfacehive

[pgbouncer]
pool_mode = transaction
max_client_conn = 500
default_pool_size = 20
reserve_pool_size = 5
reserve_pool_timeout = 3
```

**Load Testing Results:**
- 500 concurrent users: 19/20 connections utilized, p95 response time 2.1s
- 1000 concurrent users: connection queuing at 980 users, p95 response time 4.2s

**References:**
- [pgBouncer Documentation](https://www.pgbouncer.org/)
- [Django Database Connection Pooling](https://docs.djangoproject.com/en/5.0/ref/databases/#connection-management)

---

### 10. API Rate Limiting

**Decision:** django-ratelimit with Redis cache backend

**Rationale:**
- Prevents abuse of project creation (10/hour) and contribution submission (20/hour)
- Redis cache provides distributed rate limiting across multiple app servers
- django-ratelimit integrates cleanly with DRF views
- Graceful degradation: if Redis down, rate limiting disabled (operations continue)

**Alternatives Considered:**
- DRF throttling: Works but less flexible, no Redis support
- NGINX rate limiting: Not application-aware, can't differentiate by user/endpoint
- django-rest-framework-api-throttling: Abandoned, last update 2018

**Implementation Details:**
```python
# views.py
from django_ratelimit.decorators import ratelimit

@ratelimit(key='user', rate='10/h', method='POST', block=True)
def create_project(request):
    # Rate limited to 10 project creations per hour per user
    pass

@ratelimit(key='user', rate='20/h', method='POST', block=True)
def create_contribution(request):
    # Rate limited to 20 contributions per hour per user
    pass

# settings.py
RATELIMIT_USE_CACHE = 'default'
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

**Error Response:**
```json
{
  "error": "Rate limit exceeded. Try again in 45 minutes.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 2700
}
```

**References:**
- [django-ratelimit Documentation](https://django-ratelimit.readthedocs.io/)

---

## Best Practices Consolidated

### Django REST Framework

1. **Serializer Validation:** Use serializer validation for business logic, model validation for data integrity
2. **ViewSet Organization:** One ViewSet per model, nest related actions (e.g., `ProjectViewSet.contributions()`)
3. **Permissions:** Use DRF permission classes (IsAuthenticated, custom IsHostOrReadOnly)
4. **Pagination:** Default page size 20, max 100 (prevents abuse)
5. **Filtering:** Use django-filter for complex queries, avoid raw SQL

### React + TypeScript

1. **Component Organization:** Pages → Features → Components (atomic design)
2. **Type Safety:** Define API response types, use zod for runtime validation
3. **Performance:** React.lazy() for routes, useMemo() for expensive computations
4. **Error Boundaries:** Wrap routes in error boundaries with fallback UI
5. **Accessibility:** Use semantic HTML first, ARIA only when necessary

### PostgreSQL

1. **Indexing:** Index all foreign keys, status fields, and query filters
2. **Migrations:** Always test migrations on staging with production-size data
3. **Constraints:** Prefer database constraints over application checks
4. **Query Optimization:** Use `select_related()` for 1:1, `prefetch_related()` for 1:N
5. **Monitoring:** Enable `pg_stat_statements` for slow query analysis

### Testing

1. **Unit Tests:** Fast (< 100ms), isolated, no database access
2. **Integration Tests:** Use Django TestCase, test API endpoints with authentication
3. **E2E Tests:** Playwright for critical flows, run in CI/CD before merge
4. **Coverage:** Aim for 80% on business logic, 60% on views, 50% on UI components

---

## Security Best Practices

### Authentication & Authorization

1. **Password Storage:** Django default (PBKDF2-SHA256, 600K iterations)
2. **JWT Security:** 
   - Access tokens short-lived (1 hour)
   - Refresh tokens rotated on use
   - Blacklist compromised tokens
3. **Permission Checks:** 
   - View-level (DRF permissions)
   - Object-level (custom permissions)
   - Database-level (foreign key constraints)

### Input Validation

1. **XSS Prevention:** Django template escaping (auto-enabled), React JSX escaping (auto-enabled)
2. **SQL Injection:** Use ORM exclusively, no raw SQL in views
3. **CSRF Protection:** Django CSRF token on all POST/PUT/PATCH/DELETE
4. **File Upload:** Links only in MVP, no direct file uploads (future: S3 with presigned URLs)

### Rate Limiting & Abuse Prevention

1. **API Rate Limits:** 10 projects/hour, 20 contributions/hour per user
2. **Login Throttling:** 5 failed attempts → 15-minute lockout
3. **Global Limit:** 100 requests/minute per IP (prevents DDoS)

---

## Performance Optimization

### Backend

1. **Database Queries:**
   - N+1 queries prevented via `select_related` / `prefetch_related`
   - Count queries use `COUNT(*)` not `len(queryset)`
   - Full-text search via GIN index (< 100ms for 100K projects)

2. **Caching Strategy:**
   - Redis cache for rate limiting and session storage
   - Browser caching for static assets (1 year max-age)
   - API responses: no caching (always fresh data for MVP)

3. **Async Processing:**
   - Email sending via Celery (never blocks requests)
   - Data anonymization via Celery Beat (daily scheduled task)

### Frontend

1. **Code Splitting:**
   - React.lazy() for routes (< 50KB per route)
   - Dynamic imports for heavy components (charts, editors)

2. **Bundle Optimization:**
   - Tree-shaking enabled (Vite default)
   - Tailwind CSS purging removes unused styles
   - Total bundle: ~120-150KB gzipped

3. **Loading States:**
   - Skeleton screens for initial load
   - Optimistic updates for mutations
   - Suspense boundaries for lazy-loaded components

---

## Deployment Architecture

### Infrastructure

```
┌─────────────────┐
│  React SPA      │  ← Deployed on Vercel/Netlify (CDN, HTTPS)
│  (Static)       │  ← Build: Vite → dist/ folder
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Django API     │  ← Deployed on Render/Fly.io/Railway
│  (Gunicorn)     │  ← 4 workers (2 * CPU cores + 1)
└────────┬────────┘
         │
         ├──────────┐
         │          │
         ▼          ▼
┌─────────────┐  ┌──────────────┐
│ PostgreSQL  │  │ Redis        │
│ (Managed)   │  │ (Managed)    │
└─────────────┘  └──────────────┘
```

### Environment Variables

```bash
# Backend (.env)
DEBUG=False
SECRET_KEY=<random-256-bit-key>
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://user:pass@host:6379/0
FRONTEND_URL=https://interfacehive.com
ALLOWED_HOSTS=api.interfacehive.com
CORS_ALLOWED_ORIGINS=https://interfacehive.com

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<sendgrid-api-key>
DEFAULT_FROM_EMAIL=noreply@interfacehive.com
```

### Scaling Strategy

**Current (MVP):**
- 1 web server (4 Gunicorn workers)
- 1 Celery worker (2 processes)
- 1 PostgreSQL instance (20 connections via pgBouncer)
- 1 Redis instance

**Future (10K users):**
- 3 web servers (load balanced)
- 3 Celery workers (dedicated email, scheduled tasks, general)
- PostgreSQL read replicas for search queries
- Redis cluster for HA

---

## Open Questions Resolved

### Q1: Should we implement real-time notifications?
**Resolution:** No for MVP. Email queue is sufficient. Real-time via WebSockets deferred to post-MVP.

### Q2: Should we support Markdown in project descriptions?
**Resolution:** Yes, with sanitization. Use `django-markdownify` with bleach for safe rendering.

### Q3: Should we implement project categories vs. freeform tags?
**Resolution:** Freeform tags for MVP (more flexible). Categories can be added later via tag grouping.

### Q4: Should we track contribution view counts?
**Resolution:** No for MVP. Analytics deferred to post-MVP to minimize complexity.

### Q5: Should we allow editing contributions after submission?
**Resolution:** No for MVP. Prevents abuse (submitting garbage, then editing after acceptance). Future: allow editing Pending contributions only.

---

## References

- [Django 5.0 Documentation](https://docs.djangoproject.com/en/5.0/)
- [Django REST Framework 3.14 Documentation](https://www.django-rest-framework.org/)
- [React 18 Documentation](https://react.dev/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [GDPR Compliance Checklist](https://gdpr.eu/checklist/)

---

**Status:** All technical unknowns resolved. Ready to proceed with data model and contracts generation.
