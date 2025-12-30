## Backend (Django + DRF)

### 1.1 Recommended packages
- `djangorestframework`
- `django-cors-headers` (if different domains)
- `django-filter` (search/filter)
- `drf-spectacular` (OpenAPI)
- Auth:
  - JWT (SPA-friendly) via `djangorestframework-simplejwt`

### 1.2 Domain rules
- Only authenticated users can create projects / contributions
- Only the **project host** can accept/decline contributions
- Contribution states:
  - Pending → Accepted or Declined
- Credits:
  - Credits are awarded when a contribution becomes **Accepted**
  - Enforce **max 1 credit per user per project**
  - Credit history is stored in an append-only ledger

### 1.3 API Endpoints

#### Auth / User
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/profile`
- `PATCH /api/profile`
- `GET /api/users/:id`

#### Projects
- `GET /api/projects`
  - query: `search`, `tags`, `status`, `sort`, `page`, `page_size`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id` (host only)
- `POST /api/projects/:id/close` (host only)

#### Contributions
- `POST /api/projects/:id/contributions` (auth; not host; project Open)
- `GET /api/projects/:id/contributions`
  - host: all
  - public: accepted only
  - contributor: accepted + their own pending/declined
- `PATCH /api/contributions/:id/accept` (host only)
- `PATCH /api/contributions/:id/decline` (host only)

#### Credits
- `GET /api/me/credits`
  - returns total + recent ledger entries
- Admin (optional):
  - `POST /api/admin/credits/reverse`
  - `POST /api/admin/content/remove`

### 1.4 Accept workflow (must be atomic)
When host accepts a pending contribution:
1. Verify requester is project host
2. Update contribution status to `ACCEPTED` + set `decided_by` + `decided_at`
3. Enforce “1 credit per (project, contributor)” via DB constraint + check
4. Insert `CREDIT_LEDGER_ENTRY (AWARD)`
5. Commit transaction

### 1.5 Error cases
- Accept/Decline on non-pending → `409 Conflict`
- Non-host tries to decide → `403 Forbidden`
- Second credit award attempt → `409 Conflict`
- Project closed when submitting contribution → `403/409`
