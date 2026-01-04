# InterfaceHive — Product Requirements Document (PRD)

## Overview
InterfaceHive is a web platform that helps builders get real contributions to open-source or real-world projects. Hosts publish “calls for contribution,” and contributors submit work. Hosts can accept or decline submissions. Accepted contributions and participants are displayed on each project. A credit-based system supports fair exchange and incentives.

## Problem
- Builders struggle to find reliable contributors quickly.
- Contributors struggle to find legitimate, well-scoped opportunities with clear expectations.
- Existing platforms are fragmented: discovery, coordination, and reward are often disconnected.

## Goals
1. Make it easy for hosts to post clearly scoped contribution requests.
2. Make it easy for contributors to discover projects and submit contributions.
3. Provide transparent acceptance/decline workflow with visible accepted contributors.
4. Maintain trust and quality via permissions, moderation, and auditability.

## Non-Goals (Initial)
- Full GitHub PR review replacement
- Complex marketplace billing (Stripe payouts, cash-out) in MVP
- Real-time collaborative editing
- Enterprise org management

## Target Users
- **Hosts:** open-source maintainers, indie hackers, student teams, startups
- **Contributors:** students, junior devs, designers, writers, QA, open-source enthusiasts

## Core Concepts
- **Project (Call for Contribution):** a post created by a host describing what they need.
- **Contribution:** a reply/submission created by a contributor.
- **Decision:** host accepts or declines a contribution.
- **Credits:** an amount of contribution projects a user did. starts at 0 by default

---

## User Stories

### Host
- As a host, I can create a project post describing the project and what I need.
- As a host, I can review incoming contributions and accept or decline them.
- As a host, I can see a list of accepted contributors on my project page.

### Contributor
- As a contributor, I can browse and filter projects by tags/skills.
- As a contributor, I can submit a contribution with text, links, and attachments.
- As a contributor, I can see whether my contribution is pending/accepted/declined.
- As a contributor, I can earn credits for accepted contributions. can earn 1 max per project.

### Admin/Moderator
- As a moderator, I can remove abusive content and ban accounts.
- As a moderator, I can resolve disputes and revert fraudulent credit transactions.

---

## Functional Requirements (MVP)

### Authentication & Profiles
- Users can sign up / log in.
- User profile includes:
  - display name, bio
  - skills/tags (optional)
  - links (GitHub, portfolio)
  - credit balance (read-only; derived from ledger)

### Project Posting (Host)
- Create Project (Call for Contribution) with:
  - title (required)
  - description (required)
  - “What it does” (required)
  - inputs / dependencies (optional but recommended)
  - desired outputs / acceptance criteria (required)
  - tags (skills, tech stack)
  - difficulty (optional)
  - estimated time (optional)
- Project statuses:
  - Draft (optional)
  - Open (default)
  - Closed (no longer accepting contributions)

### Project Discovery
- Project list page:
  - search by keyword
  - filter by tags
  - sort by newest / most active
- Project detail page shows:
  - project content
  - host info
  - github/gitlab link (optional)
  - list of accepted contributors (only accepted, not declined)
  - contribution submission box (if Open)

### Contributions (Reply Workflow)
- Contributors can submit a Contribution to an Open project:
  - title/summary (optional)
  - body (required)
  - links (GitHub PR, Figma, docs)
  - attachments (optional; may be links-only for MVP)
- Contribution state machine:
  - Pending (default)
  - Accepted
  - Declined
- Only the host (and admins) can Accept/Decline.
- A declined contribution is not shown in the public “contributors list” for the project.
- A project shows accepted contributions and accepted contributors.

### Credit Exchange (MVP Version)
- Credits are tracked via an append-only ledger:
  - credit award on acceptance (host → contributor)
  - each user can obtain max of 1 credit per project.
  - all users start with credit of 0 by default. (on account creation)
- Rules:
  - On host's Accept, credit is given to contributor.
- Display:
  - user profile shows current credits

### Notifications (Nice-to-have MVP)
- Contributor gets notified when accepted/declined.
- Host gets notified on new contribution.

---

## Permissions & Security Requirements
- Only authenticated users can post projects or contributions.
- Only the project host can:
  - edit/close the project
  - accept/decline contributions
- Rate limiting:
  - limit project creation and contribution spam
- Audit logs:
  - record accept/decline actions with timestamps and acting user
- Prevent double-spend credits:
  - credit transfer must be transactional and consistent

---

## Data Model (Draft)

### Entities
- User
- Project
- Contribution
- ContributionDecision (or fields on Contribution)
- CreditLedgerEntry

### Relationships
- User (host) 1—N Project
- Project 1—N Contribution
- User (contributor) 1—N Contribution
- Contribution 1—0/1 Decision (Accepted/Declined)
- CreditLedgerEntry references:
  - from_user (host)
  - to_user (contributor)
  - contribution_id
  - amount
  - type (award, reversal, etc.)

---

## API Requirements (Draft)

### Projects
- GET /api/projects
- POST /api/projects
- GET /api/projects/:id
- PATCH /api/projects/:id (host only)
- POST /api/projects/:id/close (host only)

### Contributions
- POST /api/projects/:id/contributions
- GET /api/projects/:id/contributions (host sees all; public sees accepted only or hides declined)
- PATCH /api/contributions/:id/accept (host only)
- PATCH /api/contributions/:id/decline (host only)

### Credits
- GET /api/me/credits/balance
- GET /api/me/credits/ledger
- (Optional) POST /api/credits/award (server-internal; triggered by accept)

---

## UX / UI Requirements (shadcn + React)
- Clean “post/reply” layout:
  - Project detail page: left main content, right sidebar (host, tags, credits, status)
- Contribution submission is simple and obvious.
- Accepted contributors display as an “Accepted Contributors” section:
  - unique users, sorted by most recent accepted contribution
- Show contribution statuses clearly to contributors.

---

## Non-Functional Requirements
- Performance:
  - project list loads in < 1s on typical broadband for first page
- Reliability:
  - credit transfers must be consistent and atomic
- Privacy:
  - only show public profile info chosen by user
- Compliance:
  - basic ToS / community guidelines
- Logging & Monitoring:
  - error reporting for API failures and credit transfer issues

---

## MVP Milestones
1. Auth + Profiles
2. Project CRUD + Discovery
3. Contribution submission + Accept/Decline workflow
4. Accepted contributors display logic
5. Credits ledger + atomic transfer on accept
6. Basic moderation tools (admin-only)

---

## Project Structure

### Overall Directory Layout

```
InterfaceHive/
├── backend/                    # Django REST API backend
├── frontend/                   # React TypeScript frontend
├── specs/                      # Feature specifications & planning
├── docs/                       # Project documentation
├── docker-compose.yml          # Docker services (PostgreSQL, Redis)
├── prd.md                      # Product requirements document
└── README.md                   # Main project documentation
```

---

### Backend Structure (Django REST Framework)

**Location:** `backend/`

```
backend/
├── config/                     # Django project configuration
│   ├── settings.py             # Main settings (DB, auth, middleware)
│   ├── urls.py                 # Root URL routing
│   ├── asgi.py                 # ASGI server config (Daphne/WebSockets)
│   ├── wsgi.py                 # WSGI server config
│   └── celery.py               # Celery task queue config
│
├── core/                       # Shared utilities
│   ├── exceptions.py           # Custom exception handler
│   ├── pagination.py           # Custom pagination classes
│   └── responses.py            # Standardized API responses
│
├── apps/                       # Django applications
│   ├── users/                  # Authentication & user management
│   │   ├── models.py           # Custom User model (UUID, email verification)
│   │   ├── views.py            # Auth & profile endpoints
│   │   ├── serializers.py      # User serialization
│   │   ├── permissions.py      # Custom permissions
│   │   └── urls.py             # User routes
│   │
│   ├── projects/               # Project (Call for Contribution) management
│   │   ├── models.py           # Project, ProjectTag, ProjectResource, ProjectNote
│   │   ├── views.py            # Project CRUD & search
│   │   ├── serializers.py      # Project serialization
│   │   └── urls.py             # Project routes
│   │
│   ├── contributions/          # Contribution submission & review
│   │   ├── models.py           # Contribution model (status workflow)
│   │   ├── views.py            # Submission & review endpoints
│   │   ├── serializers.py      # Contribution serialization
│   │   ├── services.py         # Business logic
│   │   └── urls.py             # Contribution routes
│   │
│   ├── credits/                # Credit system & ledger
│   │   ├── models.py           # CreditLedgerEntry (immutable, append-only)
│   │   ├── views.py            # Balance & ledger endpoints
│   │   ├── serializers.py      # Credit serialization
│   │   ├── services.py         # Atomic credit transactions
│   │   └── urls.py             # Credit routes
│   │
│   ├── moderation/             # Content moderation & admin
│   │   ├── models.py           # Moderation records
│   │   ├── services.py         # Ban, reversal logic
│   │   └── urls.py             # Admin routes
│   │
│   ├── chat/                   # Real-time chat
│   │   ├── models.py           # Chat messages
│   │   ├── views.py            # Chat endpoints
│   │   ├── consumers.py        # WebSocket consumers
│   │   ├── routing.py          # WebSocket routing
│   │   └── middleware.py       # JWT WebSocket auth
│   │
│   └── ai_agent/               # AI agent integration
│       ├── models.py           # AI interaction logs
│       ├── views.py            # AI endpoints
│       └── services.py         # Google Generative AI integration
│
├── manage.py                   # Django CLI
├── requirements.txt            # Python dependencies
└── venv/                       # Python virtual environment
```

#### Backend Apps Overview

| App | Purpose |
|-----|---------|
| `users` | Authentication, registration, email verification, profiles, GDPR compliance |
| `projects` | Project CRUD, full-text search (PostgreSQL GIN), tag filtering |
| `contributions` | Submission workflow, accept/decline status transitions |
| `credits` | Append-only ledger, atomic transactions, max 1 credit per user/project |
| `moderation` | User banning, content removal, credit reversal |
| `chat` | WebSocket-based real-time messaging |
| `ai_agent` | Google Generative AI integration |

---

### Frontend Structure (React + TypeScript)

**Location:** `frontend/`

```
frontend/
├── src/
│   ├── api/                    # API client & endpoints
│   │   ├── client.ts           # Axios HTTP client configuration
│   │   ├── auth.ts             # Authentication endpoints
│   │   ├── users.ts            # User endpoints
│   │   ├── projects.ts         # Project endpoints
│   │   ├── contributions.ts    # Contribution endpoints
│   │   ├── credits.ts          # Credit system endpoints
│   │   ├── admin.ts            # Admin/moderation endpoints
│   │   └── ai.ts               # AI agent endpoints
│   │
│   ├── pages/                  # Page components (routes)
│   │   ├── Home.tsx            # Landing page
│   │   ├── Login.tsx           # Login page
│   │   ├── Register.tsx        # Registration page
│   │   ├── VerifyEmail.tsx     # Email verification
│   │   ├── ProjectList.tsx     # Browse projects
│   │   ├── ProjectDetail.tsx   # Project detail view
│   │   ├── CreateProject.tsx   # Create new project
│   │   ├── EditProject.tsx     # Edit existing project
│   │   ├── MyProjects.tsx      # User's hosted projects
│   │   ├── MyContributions.tsx # User's contributions
│   │   ├── Profile.tsx         # User profile settings
│   │   ├── PublicProfile.tsx   # Public profile view
│   │   └── AdminPanel.tsx      # Admin dashboard
│   │
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # shadcn/ui components (Button, Dialog, Form, etc.)
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── ProjectCard.tsx     # Project card display
│   │   ├── ProjectForm.tsx     # Project creation/edit form
│   │   ├── ProjectFilters.tsx  # Search & filter interface
│   │   ├── ContributionForm.tsx # Contribution submission
│   │   ├── ContributionList.tsx # List contributions
│   │   ├── CreditBadge.tsx     # Credit display badge
│   │   ├── CreditLedger.tsx    # Credit history table
│   │   ├── AcceptedContributors.tsx # Contributor list
│   │   ├── ChatRoom.tsx        # Chat interface
│   │   └── ProfileForm.tsx     # User profile editor
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── contexts/               # React Context providers (auth, theme)
│   ├── schemas/                # Zod validation schemas
│   ├── lib/                    # Utility functions
│   ├── assets/                 # Static images/files
│   │
│   ├── App.tsx                 # Main app component & routing
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles (Tailwind)
│
├── public/                     # Public static files
├── vite.config.ts              # Vite bundler configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── package.json                # NPM dependencies
└── components.json             # shadcn/ui configuration
```

---

### Technology Stack

#### Backend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Django | 5.0.0 |
| REST API | Django REST Framework | 3.14.0 |
| Authentication | djangorestframework-simplejwt | 5.3.0 |
| Database | PostgreSQL | 16 |
| Cache/Queue | Redis | 7 |
| Task Queue | Celery | 5.3.4 |
| WebSockets | Django Channels | 4.0.0 |
| ASGI Server | Daphne | 4.0.0 |
| API Docs | drf-spectacular (OpenAPI) | 0.27.0 |
| Rate Limiting | django-ratelimit | 4.1.0 |
| AI | google-generativeai | 0.3.0+ |

#### Frontend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 19.x |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 7.x |
| Routing | React Router | 7.x |
| State Management | TanStack Query | 5.x |
| Forms | react-hook-form + Zod | 7.x / 4.x |
| HTTP Client | Axios | 1.x |
| UI Components | shadcn/ui (Radix UI) | Latest |
| Styling | Tailwind CSS | 3.x |
| Icons | Lucide React | Latest |

#### Infrastructure
| Component | Technology |
|-----------|------------|
| Containerization | Docker |
| Database | PostgreSQL 16 (via docker-compose) |
| Cache | Redis 7 (via docker-compose) |

---

### API Endpoints

**Base URL:** `http://localhost:8000/api/v1/`

| Group | Endpoints | Description |
|-------|-----------|-------------|
| `/auth/` | register, login, refresh, verify-email | Authentication |
| `/users/` | me, profiles | User management |
| `/projects/` | CRUD, search, tags | Project management |
| `/contributions/` | submit, accept, decline | Contribution workflow |
| `/credits/` | balance, ledger | Credit system |
| `/admin/` | ban, moderate, reverse | Moderation tools |
| `/chat/` | messages, WebSocket | Real-time chat |
| `/ai/` | generate | AI agent |

**API Documentation:**
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

---

### Database Schema

```
User (UUID PK)
├── hosted_projects → Project (1:N)
├── contributions → Contribution (1:N)
└── credit_entries → CreditLedgerEntry (1:N)

Project (UUID PK)
├── contributions → Contribution (1:N)
├── tag_maps → ProjectTagMap (1:N)
├── resources → ProjectResource (1:N)
├── notes → ProjectNote (1:N)
└── credit_ledger → CreditLedgerEntry (1:N)

Contribution (UUID PK)
├── project → Project (N:1)
├── contributor → User (N:1)
└── credit_entry → CreditLedgerEntry (1:1)

CreditLedgerEntry (UUID PK) [Immutable]
├── to_user → User (N:1)
├── project → Project (N:1)
└── contribution → Contribution (N:1)
```

---

### Development Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev

# Docker services (PostgreSQL, Redis)
docker-compose up -d
```

**Development Servers:**
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

---

### Git Information

- **Main Branch:** `master`
- **Feature Branch:** `001-platform-mvp`

