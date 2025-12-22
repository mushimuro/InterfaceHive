## System Architecture

### 1.1 High-level
- **Client:** React (shadcn/ui) SPA
- **API:** Django REST (Django + DRF)
- **Database:** PostgreSQL
- **(Optional) Cache/Queue:** Redis + Celery (later)
- **Media/Attachments**
  - MVP: **links-only** in contribution payload
  - Later: S3-compatible storage (AWS S3) + store URLs in DB

### 1.2 Component responsibilities
- **React Web App**
  - Routing, forms, UI state, API calls
  - Displays projects, contributions, accepted contributors, profiles, credits
- **Django API**
  - Authentication + authorization
  - Project + contribution workflows
  - Accept/decline decisions
  - Credit award logic (atomic transaction)
- **PostgreSQL**
  - Source of truth for all entities
  - Enforces uniqueness + referential integrity
  - Supports transactional credit operations

### 1.3 Environments
- **Development**
  - Docker Compose: frontend + backend + postgres
- **Production (example, not decided yet)**
  - Frontend: Vercel/Netlify/S3+CDN
  - Backend: Render/Fly.io/ECS/EC2
  - DB: Managed Postgres (RDS/Supabase/Neon)

### 1.4 Cross-cutting concerns
- **Security:** object-level permissions (host-only decisions), rate limiting
- **Auditability:** decision fields + append-only credit ledger
- **Observability:** structured logs, error tracking (Sentry recommended)
