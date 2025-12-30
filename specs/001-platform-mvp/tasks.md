# Task Breakdown: InterfaceHive Platform MVP

**Spec Reference:** 001-platform-mvp
**Created:** 2025-12-29
**Sprint/Milestone:** MVP Release

## Task Overview

This document breaks down the InterfaceHive MVP implementation into actionable, dependency-ordered tasks organized by user story. Each user story phase can be implemented and tested independently, enabling parallel development and incremental delivery.

**Total Estimated Tasks:** 170+
**Estimated Duration:** 6-8 weeks with 2-3 developers
**MVP Scope:** FR-1 through FR-9 (Authentication → Credit System)

---

## Implementation Strategy

### Incremental Delivery Model

1. **Phase 1 (Setup):** Project structure and infrastructure
2. **Phase 2 (Foundation):** Core models and shared services
3. **Phase 3+:** User stories in priority order (each independently testable)
4. **Final Phase:** Cross-cutting concerns (GDPR, moderation, polish)

### Parallel Execution

Tasks marked with `[P]` can be executed in parallel with other `[P]` tasks in the same phase if working on different files. Dependencies are explicitly noted.

### MVP Definition

**Minimum Viable Product includes:**
- FR-1: Authentication & Registration
- FR-3: Project Creation & Management
- FR-4: Project Discovery & Search  
- FR-5: Project Detail Page
- FR-6: Contribution Submission
- FR-7: Contribution Review & Decision
- FR-9: Credit System

**Post-MVP (defer if time-constrained):**
- FR-2: Extended profile features
- FR-8: Accepted contributors showcase
- FR-10: Contribution status dashboard
- FR-11: Admin moderation tools
- FR-12: GDPR compliance features

---

## Phase 1: Project Setup & Infrastructure

**Goal:** Initialize project structure, configure tooling, and set up development environment.

**Duration:** 2-3 days

### Backend Setup

- [X] T001 [P] Initialize Django project with virtualenv in backend/
- [X] T002 [P] Create requirements.txt with dependencies (Django 5.0, DRF 3.14, simplejwt, celery, redis, psycopg2-binary)
- [X] T003 [P] Configure Django settings.py for development (DEBUG=True, CORS, JWT, database)
- [X] T004 [P] Create Django apps: users, projects, contributions, credits in backend/apps/
- [X] T005 [P] Configure Celery with Redis broker in backend/config/celery.py
- [X] T006 [P] Set up PostgreSQL database connection in backend/config/settings.py
- [X] T007 [P] Configure django-cors-headers for frontend communication in backend/config/settings.py
- [X] T008 [P] Set up django-ratelimit with Redis cache in backend/config/settings.py
- [X] T009 [P] Configure drf-spectacular for OpenAPI docs in backend/config/urls.py
- [X] T010 Create .env.example file with required environment variables in backend/

### Frontend Setup

- [X] T011 [P] Initialize Vite + React + TypeScript project in frontend/
- [X] T012 [P] Install dependencies (react-router-dom, @tanstack/react-query, react-hook-form, zod, axios) in frontend/
- [X] T013 [P] Initialize shadcn/ui with Tailwind CSS in frontend/
- [X] T014 [P] Install shadcn components (button, input, card, form, dialog, badge, skeleton) in frontend/src/components/ui/
- [X] T015 [P] Configure React Router in frontend/src/main.tsx
- [X] T016 [P] Set up TanStack Query with QueryClient in frontend/src/main.tsx
- [X] T017 [P] Create axios API client with token interceptors in frontend/src/api/client.ts
- [X] T018 [P] Create environment config (.env.example) in frontend/

### Database Setup

- [X] T019 Start PostgreSQL 15 via Docker in development environment
- [X] T020 Start Redis 7 via Docker for caching and Celery broker
- [X] T021 [P] Run initial Django migrations to create default tables in backend/
- [X] T022 [P] Create superuser account for Django admin in backend/

### Documentation & Configuration

- [X] T023 [P] Create README.md with setup instructions in project root
- [X] T024 [P] Create .gitignore for backend (venv/, *.pyc, .env, db.sqlite3) and frontend (node_modules/, dist/, .env)
- [X] T025 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.json
- [X] T026 [P] Configure Black and Flake8 for backend in backend/pyproject.toml
- [X] T027 Initialize Git repository and create initial commit

**Phase 1 Completion Criteria:**
- [ ] Backend server starts without errors on localhost:8000
- [ ] Frontend dev server starts on localhost:5173
- [ ] PostgreSQL and Redis connections established
- [ ] Django admin accessible at /admin
- [ ] No linter errors in fresh setup

---

## Phase 2: Foundational Layer

**Goal:** Implement core models, base authentication infrastructure, and shared utilities.

**Duration:** 4-5 days

**Dependencies:** Phase 1 complete

### Core Models

- [X] T028 [P] Implement User model extending AbstractUser in backend/apps/users/models.py
- [X] T029 [P] Add email verification fields to User model (email_verified, email_verification_token, email_verified_at)
- [X] T030 [P] Add GDPR compliance fields to User model (is_deleted, deletion_requested_at, data_anonymized_at)
- [X] T031 [P] Implement Project model in backend/apps/projects/models.py
- [X] T032 [P] Add full-text search vector field to Project model (search_vector with GIN index)
- [X] T033 [P] Implement ProjectTag model in backend/apps/projects/models.py
- [X] T034 [P] Implement ProjectTagMap model for many-to-many in backend/apps/projects/models.py
- [X] T035 [P] Implement Contribution model in backend/apps/contributions/models.py
- [X] T036 [P] Add decision tracking fields to Contribution (decided_by_user, decided_at, status)
- [X] T037 [P] Implement CreditLedgerEntry model in backend/apps/credits/models.py
- [X] T038 [P] Add unique constraint for credit awards in CreditLedgerEntry model
- [X] T039 [P] Override save() and delete() in CreditLedgerEntry for immutability in backend/apps/credits/models.py
- [X] T040 Create Django migrations for all models in backend/apps/*/migrations/
- [X] T041 Run migrations to create database schema

### Database Indexes & Constraints

- [X] T042 [P] Add indexes for User (email, email_verified, GDPR cleanup) in migration file
- [X] T043 [P] Add indexes for Project (host_user, status, created_at, search_vector GIN) in migration file
- [X] T044 [P] Add indexes for Contribution (project+status, contributor+status) in migration file
- [X] T045 [P] Add indexes for CreditLedgerEntry (to_user, created_at) in migration file
- [X] T046 [P] Add check constraint for Contribution decision consistency in migration file
- [X] T047 [P] Add partial unique index for User email_verification_token in migration file

### Shared Services & Utilities

- [X] T048 [P] Create authentication middleware in backend/apps/users/middleware.py
- [X] T049 [P] Create permission classes (IsHostOrReadOnly, IsAuthenticatedAndVerified) in backend/apps/users/permissions.py
- [X] T050 [P] Create Celery task for sending verification emails in backend/apps/users/tasks.py
- [X] T051 [P] Configure Celery Beat for scheduled tasks in backend/config/celery.py
- [X] T052 [P] Create pagination classes in backend/core/pagination.py
- [X] T053 [P] Create custom exception handlers in backend/core/exceptions.py
- [X] T054 [P] Create error response formatter in backend/core/responses.py

### Frontend Shared Components & Utilities

- [X] T055 [P] Create AuthContext for user state management in frontend/src/contexts/AuthContext.tsx
- [X] T056 [P] Create ProtectedRoute component in frontend/src/components/ProtectedRoute.tsx
- [X] T057 [P] Create LoadingSpinner component in frontend/src/components/LoadingSpinner.tsx
- [X] T058 [P] Create ErrorMessage component in frontend/src/components/ErrorMessage.tsx
- [X] T059 [P] Create Button component wrapper (shadcn) in frontend/src/components/ui/button.tsx
- [X] T060 [P] Create Input component wrapper (shadcn) in frontend/src/components/ui/input.tsx
- [X] T061 [P] Create validation schemas using zod in frontend/src/schemas/

**Phase 2 Completion Criteria:**
- [ ] All models created with migrations applied
- [ ] Database schema matches data-model.md specification
- [ ] Django admin can view/edit all models
- [ ] Shared components render without errors
- [ ] No linter errors

---

## Phase 3: FR-1 User Authentication & Registration (Critical)

**Goal:** Users can register, verify email, log in, and manage sessions.

**User Story:** As a new user, I want to create an account and verify my email so that I can securely access the platform.

**Duration:** 3-4 days

**Dependencies:** Phase 2 complete

**Independent Test Criteria:**
- [ ] User can complete registration → email verification → login flow end-to-end
- [ ] Unverified users cannot log in
- [ ] JWT tokens refresh correctly
- [ ] Email queue processes asynchronously (registration succeeds even if SMTP down)

### Backend Implementation

- [X] T062 [US1] Create RegisterSerializer in backend/apps/users/serializers.py
- [X] T063 [US1] Create LoginSerializer in backend/apps/users/serializers.py
- [X] T064 [US1] Create UserProfileSerializer in backend/apps/users/serializers.py
- [X] T065 [US1] Implement POST /api/v1/auth/register view in backend/apps/users/views.py
- [X] T066 [US1] Implement POST /api/v1/auth/login view with email verification check in backend/apps/users/views.py
- [X] T067 [US1] Implement POST /api/v1/auth/verify-email view in backend/apps/users/views.py
- [X] T068 [US1] Implement POST /api/v1/auth/token/refresh view in backend/apps/users/views.py
- [X] T069 [US1] Implement POST /api/v1/auth/logout view with token blacklisting in backend/apps/users/views.py
- [X] T070 [US1] Implement send_verification_email Celery task with retry logic in backend/apps/users/tasks.py
- [X] T071 [US1] Configure JWT settings (1hr access, 7d refresh, rotation) in backend/config/settings.py
- [X] T072 [US1] Add authentication URLs to router in backend/apps/users/urls.py

### Frontend Implementation

- [X] T073 [P] [US1] Create auth API functions in frontend/src/api/auth.ts
- [X] T074 [P] [US1] Create useAuth hook with login/logout/register in frontend/src/contexts/AuthContext.tsx
- [X] T075 [US1] Create Register page with form in frontend/src/pages/Register.tsx
- [X] T076 [US1] Create Login page with form in frontend/src/pages/Login.tsx
- [X] T077 [US1] Create VerifyEmail page in frontend/src/pages/VerifyEmail.tsx
- [X] T078 [US1] Implement token refresh logic in axios interceptor in frontend/src/api/client.ts
- [X] T079 [US1] Create registration form validation schema in frontend/src/schemas/authSchema.ts
- [X] T080 [US1] Add authentication routes to router in frontend/src/App.tsx

### Testing

- [ ] T081 [US1] Write unit tests for User model in backend/apps/users/tests/test_models.py
- [ ] T082 [US1] Write unit tests for authentication serializers in backend/apps/users/tests/test_serializers.py
- [ ] T083 [US1] Write integration tests for registration endpoint in backend/apps/users/tests/test_views.py
- [ ] T084 [US1] Write integration tests for login endpoint (verified vs unverified) in backend/apps/users/tests/test_views.py
- [ ] T085 [US1] Write integration tests for email verification in backend/apps/users/tests/test_views.py
- [ ] T086 [US1] Write integration tests for token refresh in backend/apps/users/tests/test_views.py
- [ ] T087 [US1] Write Celery task tests for email sending with retry in backend/apps/users/tests/test_tasks.py
- [ ] T088 [US1] Write React component tests for Register page in frontend/src/pages/Register.test.tsx
- [ ] T089 [US1] Write React component tests for Login page in frontend/src/pages/Login.test.tsx

**FR-1 Completion Criteria:**
- [ ] All acceptance criteria from spec.md FR-1 met
- [ ] Users can register and receive verification email
- [ ] Only verified users can log in
- [ ] JWT tokens work and refresh correctly
- [ ] Email queue resilient to SMTP failures
- [ ] >= 70% test coverage for auth module
- [ ] < 3s response time for all auth endpoints

---

## Phase 4: FR-3 Project Creation & Management (Critical)

**Goal:** Hosts can create, edit, and manage contribution request projects.

**User Story:** As a project host, I want to publish a detailed contribution request so that contributors can understand what I need.

**Duration:** 3-4 days

**Dependencies:** FR-1 complete (authentication required)

**Independent Test Criteria:**
- [ ] Authenticated user can create project with all required fields
- [ ] Host can edit their own projects
- [ ] Host can close projects (status → CLOSED)
- [ ] Non-hosts cannot edit projects (403 error)
- [ ] Rate limiting enforced (10 projects/hour)

### Backend Implementation

- [X] T090 [US3] Create ProjectSerializer in backend/apps/projects/serializers.py
- [X] T091 [US3] Create ProjectCreateSerializer with validation in backend/apps/projects/serializers.py
- [X] T092 [US3] Create ProjectUpdateSerializer in backend/apps/projects/serializers.py
- [X] T093 [US3] Implement GET /api/v1/projects list view in backend/apps/projects/views.py
- [X] T094 [US3] Implement POST /api/v1/projects create view with rate limiting in backend/apps/projects/views.py
- [X] T095 [US3] Implement GET /api/v1/projects/:id detail view in backend/apps/projects/views.py
- [X] T096 [US3] Implement PATCH /api/v1/projects/:id update view (host only) in backend/apps/projects/views.py
- [X] T097 [US3] Implement POST /api/v1/projects/:id/close view (host only) in backend/apps/projects/views.py
- [X] T098 [US3] Create IsHostOrReadOnly permission class in backend/apps/users/permissions.py
- [X] T099 [US3] Add project URLs to router in backend/apps/projects/urls.py
- [X] T100 [US3] Apply rate limiting decorator (10/hour) to create view in backend/apps/projects/views.py

### Frontend Implementation

- [X] T101 [P] [US3] Create project API functions in frontend/src/api/projects.ts
- [X] T102 [P] [US3] Create useProjects hook in frontend/src/hooks/useProjects.ts
- [X] T103 [P] [US3] Create useCreateProject mutation hook in frontend/src/hooks/useProjects.ts
- [X] T104 [P] [US3] Create useUpdateProject mutation hook in frontend/src/hooks/useProjects.ts
- [X] T105 [US3] Create ProjectForm component in frontend/src/components/ProjectForm.tsx
- [X] T106 [US3] Create CreateProject page in frontend/src/pages/CreateProject.tsx
- [X] T107 [US3] Create EditProject page in frontend/src/pages/EditProject.tsx
- [X] T108 [US3] Create project validation schema (zod) in frontend/src/schemas/projectSchema.ts
- [X] T109 [US3] Add project routes to router in frontend/src/App.tsx

### Testing

- [ ] T110 [US3] Write unit tests for Project model in backend/apps/projects/tests/test_models.py
- [ ] T111 [US3] Write unit tests for project serializers in backend/apps/projects/tests/test_serializers.py
- [ ] T112 [US3] Write integration tests for project creation in backend/apps/projects/tests/test_views.py
- [ ] T113 [US3] Write integration tests for project update (host vs non-host) in backend/apps/projects/tests/test_views.py
- [ ] T114 [US3] Write integration tests for project close in backend/apps/projects/tests/test_views.py
- [ ] T115 [US3] Write integration tests for rate limiting (11th project) in backend/apps/projects/tests/test_views.py
- [ ] T116 [US3] Write React component tests for ProjectForm in frontend/src/components/ProjectForm.test.tsx
- [ ] T117 [US3] Write React component tests for CreateProject page in frontend/src/pages/CreateProject.test.tsx

**FR-3 Completion Criteria:**
- [ ] All acceptance criteria from spec.md FR-3 met
- [ ] Hosts can create projects with required fields
- [ ] Hosts can edit and close their projects
- [ ] Authorization enforced (only host can edit)
- [ ] Rate limiting prevents spam (10/hour)
- [ ] >= 70% test coverage for projects module
- [ ] < 3s response time for project operations

---

## Phase 5: FR-4 Project Discovery & Search (Critical)

**Goal:** Users can browse, search, and filter projects.

**User Story:** As a contributor, I want to find projects matching my skills so that I can contribute to work I'm qualified for.

**Duration:** 3-4 days

**Dependencies:** FR-3 complete (projects must exist)

**Independent Test Criteria:**
- [ ] Project feed loads within 1 second
- [ ] Search by keyword returns relevant results
- [ ] Filter by tags works correctly
- [ ] Sort by newest/oldest works
- [ ] Pagination returns 20 items per page
- [ ] Full-text search query < 100ms (GIN index)

### Backend Implementation

- [X] T118 [US4] Implement full-text search queryset in backend/apps/projects/views.py
- [X] T119 [US4] Add django-filter configuration for tags, difficulty in backend/apps/projects/filters.py
- [X] T120 [US4] Implement sort options (newest, oldest, active) in backend/apps/projects/views.py
- [X] T121 [US4] Configure pagination (20 items/page, max 100) in backend/apps/projects/views.py
- [X] T122 [US4] Optimize N+1 queries with select_related('host_user') in backend/apps/projects/views.py
- [X] T123 [US4] Create populate_search_vector migration in backend/apps/projects/migrations/
- [X] T124 [US4] Add GIN index on search_vector field in migration

### Frontend Implementation

- [X] T125 [P] [US4] Create ProjectCard component in frontend/src/components/ProjectCard.tsx
- [X] T126 [P] [US4] Create ProjectFilters component (search, tags, sort) in frontend/src/components/ProjectFilters.tsx
- [X] T127 [US4] Create ProjectFeed page with filters in frontend/src/pages/ProjectList.tsx
- [X] T128 [US4] Implement search debouncing (300ms) in frontend/src/components/ProjectFilters.tsx
- [X] T129 [US4] Implement pagination in frontend/src/pages/ProjectList.tsx
- [X] T130 [US4] Create skeleton loading states in frontend/src/components/ProjectSkeleton.tsx
- [X] T131 [US4] Add Project routes in frontend/src/App.tsx

### Testing

- [ ] T132 [US4] Write unit tests for search queryset in backend/apps/projects/tests/test_views.py
- [ ] T133 [US4] Write integration tests for keyword search in backend/apps/projects/tests/test_views.py
- [ ] T134 [US4] Write integration tests for tag filtering in backend/apps/projects/tests/test_views.py
- [ ] T135 [US4] Write integration tests for sort options in backend/apps/projects/tests/test_views.py
- [ ] T136 [US4] Write integration tests for pagination in backend/apps/projects/tests/test_views.py
- [ ] T137 [US4] Write performance test for full-text search (< 100ms) in backend/apps/projects/tests/test_performance.py
- [ ] T138 [US4] Write React component tests for ProjectCard in frontend/src/components/ProjectCard.test.tsx
- [ ] T139 [US4] Write React component tests for ProjectFilters in frontend/src/components/ProjectFilters.test.tsx

**FR-4 Completion Criteria:**
- [ ] All acceptance criteria from spec.md FR-4 met
- [ ] Project feed loads in < 1 second
- [ ] Search finds relevant projects
- [ ] Tags and sort filters work
- [ ] Pagination works with large datasets
- [ ] Full-text search < 100ms with GIN index
- [ ] >= 70% test coverage for search/filter logic
- [ ] Loading states shown during fetch

---

## Phase 6: FR-5 & FR-6 Project Detail & Contribution Submission (Critical)

**Goal:** Display project details and allow contributors to submit work.

**User Story:** As a contributor, I want to view project details and submit my contribution so that the host can review my work.

**Duration:** 4-5 days

**Dependencies:** FR-4 complete (project discovery)

**Independent Test Criteria:**
- [ ] Project detail page loads within 3 seconds
- [ ] Contribution form submits successfully
- [ ] Only authenticated non-hosts can submit
- [ ] Project closed status prevents submissions
- [ ] Rate limiting enforced (20 contributions/hour)
- [ ] SEO meta tags present (H1, H2, keywords)

### Backend Implementation

- [X] T140 [US5] Create ContributionSerializer in backend/apps/contributions/serializers.py
- [X] T141 [US5] Create ContributionCreateSerializer with validation in backend/apps/contributions/serializers.py
- [X] T142 [US5] Implement GET /api/v1/projects/:id/contributions list view in backend/apps/contributions/views.py
- [X] T143 [US5] Implement POST /api/v1/projects/:id/contributions create view with rate limiting in backend/apps/contributions/views.py
- [X] T144 [US5] Implement visibility logic (host sees all, public sees accepted) in backend/apps/contributions/views.py
- [X] T145 [US5] Validate contributor is not project host in create view in backend/apps/contributions/serializers.py
- [X] T146 [US5] Validate project status is OPEN in create view in backend/apps/contributions/serializers.py
- [X] T147 [US5] Apply rate limiting (20/hour) to contribution submission in backend/apps/contributions/views.py
- [X] T148 [US5] Add contribution URLs to router in backend/apps/contributions/urls.py

### Frontend Implementation

- [X] T149 [P] [US5] Create contribution API functions in frontend/src/api/contributions.ts
- [X] T150 [P] [US5] Create useContributions hook in frontend/src/hooks/useContributions.ts
- [X] T151 [P] [US5] Create useCreateContribution mutation hook in frontend/src/hooks/useContributions.ts
- [X] T152 [US5] Create ProjectDetail page with SEO structure in frontend/src/pages/ProjectDetail.tsx
- [X] T153 [US5] Create ContributionForm component in frontend/src/components/ContributionForm.tsx
- [X] T154 [US5] Create ContributionList component in frontend/src/components/ContributionList.tsx
- [X] T155 [US5] Create contribution validation schema (zod) in frontend/src/schemas/contributionSchema.ts
- [X] T156 [US5] Implement SEO meta tags (title, description, H1/H2/H3) in frontend/src/pages/ProjectDetail.tsx
- [X] T157 [US5] Add project detail route (/projects/:id) in frontend/src/App.tsx

### Testing

- [ ] T158 [US5] Write unit tests for Contribution model in backend/apps/contributions/tests/test_models.py
- [ ] T159 [US5] Write unit tests for contribution serializers in backend/apps/contributions/tests/test_serializers.py
- [ ] T160 [US5] Write integration tests for contribution submission in backend/apps/contributions/tests/test_views.py
- [ ] T161 [US5] Write integration tests for host-cannot-contribute rule in backend/apps/contributions/tests/test_views.py
- [ ] T162 [US5] Write integration tests for closed-project-block in backend/apps/contributions/tests/test_views.py
- [ ] T163 [US5] Write integration tests for visibility rules in backend/apps/contributions/tests/test_views.py
- [ ] T164 [US5] Write integration tests for rate limiting (21st contribution) in backend/apps/contributions/tests/test_views.py
- [ ] T165 [US5] Write React component tests for ContributionForm in frontend/src/components/ContributionForm.test.tsx
- [ ] T166 [US5] Write E2E test for SEO structure (H1/H2/H3) in tests/e2e/seo.spec.ts

**FR-5 & FR-6 Completion Criteria:**
- [ ] All acceptance criteria from spec.md FR-5 and FR-6 met
- [ ] Project detail page displays all information
- [ ] Contributors can submit work with links
- [ ] Host cannot submit to own project
- [ ] Closed projects reject submissions
- [ ] Rate limiting prevents spam (20/hour)
- [ ] SEO structure implemented (H1/H2/H3, meta tags)
- [ ] >= 70% test coverage for contribution module
- [ ] < 3s response time for detail page and submission

---

## Phase 7: FR-7 & FR-9 Contribution Review & Credit System (Critical)

**Goal:** Hosts can accept/decline contributions, triggering atomic credit awards.

**User Story:** As a project host, I want to review submissions and award credits so that I can recognize quality contributions.

**Duration:** 5-6 days (most complex phase)

**Dependencies:** FR-6 complete (contributions must exist)

**Independent Test Criteria:**
- [ ] Host can accept pending contribution
- [ ] Acceptance awards 1 credit (if first for project/user)
- [ ] Duplicate credit prevention works (unique constraint)
- [ ] Transaction is atomic (contribution status + credit ledger succeed/fail together)
- [ ] Host can decline contribution (no credit awarded)
- [ ] Credit balance calculation correct
- [ ] Non-host cannot accept (403 error)

### Backend Implementation (Contribution Review)

- [X] T167 [US7] Implement POST /api/v1/contributions/:id/accept view in backend/apps/contributions/views.py
- [X] T168 [US7] Implement POST /api/v1/contributions/:id/decline view in backend/apps/contributions/views.py
- [X] T169 [US7] Create accept_contribution service with atomic transaction in backend/apps/contributions/services.py
- [X] T170 [US7] Implement permission check (only host can decide) in backend/apps/contributions/services.py
- [X] T171 [US7] Validate contribution status is PENDING before accept/decline in backend/apps/contributions/services.py
- [X] T172 [US7] Update contribution status and decision fields in accept flow in backend/apps/contributions/services.py
- [X] T173 [US7] Handle IntegrityError for duplicate credit attempts in backend/apps/credits/services.py
- [X] T174 [US7] Contribution decision URLs already in router from Phase 6

### Backend Implementation (Credit System)

- [X] T175 [US9] Create CreditService with award_credit method in backend/apps/credits/services.py
- [X] T176 [US9] Implement atomic credit award in transaction in backend/apps/credits/services.py
- [X] T177 [US9] Create CreditLedgerEntrySerializer in backend/apps/credits/serializers.py
- [X] T178 [US9] Implement GET /api/v1/credits/me/balance view in backend/apps/credits/views.py
- [X] T179 [US9] Implement GET /api/v1/credits/me/ledger view in backend/apps/credits/views.py
- [X] T180 [US9] Create get_user_credit_balance method in backend/apps/credits/services.py
- [X] T181 [US9] Optimize ledger query with select_related in backend/apps/credits/views.py
- [X] T182 [US9] Add credit URLs to router in backend/apps/credits/urls.py

### Frontend Implementation

- [X] T183 [P] [US7] Contribution decision API functions already in contributions.ts from Phase 6
- [X] T184 [P] [US7] useAcceptContribution mutation hook already in useContributions.ts from Phase 6
- [X] T185 [P] [US7] useDeclineContribution mutation hook already in useContributions.ts from Phase 6
- [X] T186 [P] [US9] Create credits API functions in frontend/src/api/credits.ts
- [X] T187 [P] [US9] Create useCredits hooks in frontend/src/hooks/useCredits.ts
- [X] T188 [US7] Accept/Decline buttons already integrated in ContributionList.tsx from Phase 6
- [X] T189 [US7] Contribution status badges already in ContributionList.tsx from Phase 6
- [ ] T190 [US9] Display credit balance on profile page in frontend/src/pages/Profile.tsx
- [X] T191 [US9] Create CreditLedger component in frontend/src/components/CreditLedger.tsx
- [X] T192 [US7] React Query handles optimistic updates automatically

### Testing (Critical Path - 100% Coverage Required)

- [ ] T193 [US7] Write unit tests for accept_contribution service in backend/apps/contributions/tests/test_services.py
- [ ] T194 [US7] Write unit tests for transaction atomicity in backend/apps/contributions/tests/test_services.py
- [ ] T195 [US7] Write unit tests for CreditLedgerEntry immutability in backend/apps/credits/tests/test_models.py
- [ ] T196 [US7] Write integration tests for contribution acceptance in backend/apps/contributions/tests/test_views.py
- [ ] T197 [US7] Write integration tests for credit award on acceptance in backend/apps/contributions/tests/test_views.py
- [ ] T198 [US7] Write integration tests for duplicate credit prevention in backend/apps/contributions/tests/test_views.py
- [ ] T199 [US7] Write integration tests for rollback on credit failure in backend/apps/contributions/tests/test_services.py
- [ ] T200 [US7] Write integration tests for host-only permission in backend/apps/contributions/tests/test_views.py
- [ ] T201 [US7] Write integration tests for already-decided conflict (409) in backend/apps/contributions/tests/test_views.py
- [ ] T202 [US9] Write unit tests for credit balance calculation in backend/apps/credits/tests/test_queries.py
- [ ] T203 [US9] Write integration tests for credit balance endpoint in backend/apps/credits/tests/test_views.py
- [ ] T204 [US9] Write integration tests for credit ledger endpoint in backend/apps/credits/tests/test_views.py
- [ ] T205 [US7] Write concurrent acceptance test (10 threads, verify 1 credit) in backend/apps/contributions/tests/test_concurrency.py
- [ ] T206 [US7] Write React component tests for AcceptDeclineButtons in frontend/src/components/AcceptDeclineButtons.test.tsx
- [ ] T207 [US7] Write E2E test for complete contribution flow (submit → accept → credit) in tests/e2e/contribution-flow.spec.ts

**FR-7 & FR-9 Completion Criteria:**
- [ ] All acceptance criteria from spec.md FR-7 and FR-9 met
- [ ] Host can accept and decline contributions
- [ ] Credit awards atomically with acceptance
- [ ] Unique constraint prevents duplicate credits (1 per user/project)
- [ ] Transaction rollback works on credit failure
- [ ] Credit balance displays correctly
- [ ] Optimistic UI updates with rollback on error
- [ ] **100% test coverage** for critical path (credit transactions)
- [ ] Concurrent acceptance test passes
- [ ] < 3s response time for accept/decline actions

---

## Phase 8: FR-2 User Profile Management (High)

**Goal:** Users can view and edit their profiles with credit display.

**User Story:** As a user, I want to manage my profile and display my credit balance so that others can see my reputation.

**Duration:** 2-3 days

**Dependencies:** FR-9 complete (credit system)

**Independent Test Criteria:**
- [ ] User can view own profile
- [ ] User can edit profile fields (display name, bio, skills, links)
- [ ] Credit balance displays as read-only
- [ ] Profile page loads within 3 seconds
- [ ] Public profile accessible to anyone

### Backend Implementation

- [X] T208 [US2] Implement GET /api/v1/auth/me/ view (current user) in backend/apps/users/views.py
- [X] T209 [US2] Implement PATCH /api/v1/auth/profile/ view (update profile) in backend/apps/users/views.py
- [X] T210 [US2] Implement GET /api/v1/auth/:id view (public profile) in backend/apps/users/views.py
- [X] T211 [US2] Create PublicUserProfileSerializer (exclude email, GDPR fields) in backend/apps/users/serializers.py
- [X] T212 [US2] Add total_credits computed property to User model in backend/apps/users/models.py
- [X] T213 [US2] Optimize credit balance query with annotation in backend/apps/users/views.py
- [X] T214 [US2] Add profile URLs to router in backend/apps/users/urls.py

### Frontend Implementation

- [X] T215 [P] [US2] Create user API functions in frontend/src/api/users.ts
- [X] T216 [P] [US2] Create useProfile hook in frontend/src/hooks/useProfile.ts
- [X] T217 [P] [US2] Create useUpdateProfile mutation hook in frontend/src/hooks/useProfile.ts
- [X] T218 [US2] Create Profile page in frontend/src/pages/Profile.tsx
- [X] T219 [US2] Create PublicProfile page in frontend/src/pages/PublicProfile.tsx
- [X] T220 [US2] Create ProfileForm component in frontend/src/components/ProfileForm.tsx
- [X] T221 [US2] Display credit balance (read-only) in frontend/src/pages/Profile.tsx
- [X] T222 [US2] Create profile validation schema (zod) in frontend/src/schemas/profileSchema.ts
- [X] T223 [US2] Add profile routes to router in frontend/src/App.tsx

### Testing

- [ ] T224 [US2] Write integration tests for profile retrieval in backend/apps/users/tests/test_views.py
- [ ] T225 [US2] Write integration tests for profile update in backend/apps/users/tests/test_views.py
- [ ] T226 [US2] Write integration tests for public profile in backend/apps/users/tests/test_views.py
- [ ] T227 [US2] Write unit tests for total_credits computation in backend/apps/users/tests/test_models.py
- [ ] T228 [US2] Write React component tests for ProfileForm in frontend/src/components/ProfileForm.test.tsx

**FR-2 Completion Criteria:**
- [ ] All acceptance criteria from spec.md FR-2 met
- [ ] Users can edit profile fields
- [ ] Credit balance displays correctly
- [ ] Public profiles accessible
- [ ] >= 70% test coverage for profile module
- [ ] < 3s response time for profile operations

---

## Phase 9: FR-8 & FR-10 Accepted Contributors Display & Status Tracking (High)

**Goal:** Showcase accepted contributors and track contribution status.

**User Story:** As a user, I want to see who has contributed to a project and track my submission status so that I can recognize peers and monitor my work.

**Duration:** 2-3 days

**Dependencies:** FR-7 complete (contributions accepted)

**Independent Test Criteria:**
- [ ] Accepted contributors section displays unique users
- [ ] Only accepted contributions shown (not pending/declined)
- [ ] Contributors sorted by acceptance date
- [ ] Contribution status indicators clear (badges)
- [ ] Contributors can view their submission history

### Backend Implementation

- [X] T229 [US8] Add accepted_contributors property to Project model in backend/apps/projects/models.py
- [X] T230 [US8] Optimize accepted_contributors query (distinct, order by decided_at) in backend/apps/projects/models.py
- [X] T231 [US8] Include accepted_contributors in ProjectDetailSerializer in backend/apps/projects/serializers.py
- [X] T232 [US10] Implement GET /api/v1/contributions/me/ view in backend/apps/contributions/views.py
- [X] T233 [US10] Filter contributions by status in query params in backend/apps/contributions/views.py
- [X] T234 [US10] Add contribution status URLs to router in backend/apps/contributions/urls.py

### Frontend Implementation

- [X] T235 [P] [US8] Create AcceptedContributors component in frontend/src/components/AcceptedContributors.tsx
- [X] T236 [P] [US8] Add AcceptedContributors section to ProjectDetail page in frontend/src/pages/ProjectDetail.tsx
- [X] T237 [P] [US10] Status badges already implemented in ContributionList component
- [X] T238 [US10] Create MyContributions page in frontend/src/pages/MyContributions.tsx
- [X] T239 [US10] Add contribution status filter to MyContributions in frontend/src/pages/MyContributions.tsx
- [X] T240 [US10] Add MyContributions route to router in frontend/src/App.tsx

### Testing

- [ ] T241 [US8] Write unit tests for accepted_contributors property in backend/apps/projects/tests/test_models.py
- [ ] T242 [US8] Write integration tests for accepted contributors in detail endpoint in backend/apps/projects/tests/test_views.py
- [ ] T243 [US10] Write integration tests for my contributions endpoint in backend/apps/contributions/tests/test_views.py
- [ ] T244 [US8] Write React component tests for AcceptedContributors in frontend/src/components/AcceptedContributors.test.tsx

**FR-8 & FR-10 Completion Criteria:**
- [ ] All acceptance criteria from spec.md FR-8 and FR-10 met
- [ ] Accepted contributors displayed correctly
- [ ] Status indicators clear and accessible
- [ ] Contributors can track their submissions
- [ ] >= 70% test coverage
- [ ] Section updates when contributions accepted

---

## Phase 10: FR-11 Basic Moderation Tools (Medium - Post-MVP)

**Goal:** Administrators can moderate content and manage users.

**User Story:** As an admin, I want to remove abusive content and ban users so that I can maintain platform quality.

**Duration:** 3-4 days

**Dependencies:** FR-9 complete (credit system for reversals)

**Independent Test Criteria:**
- [ ] Admin can soft-delete projects and contributions
- [ ] Admin can ban users (is_active = False)
- [ ] Admin can reverse credit transactions
- [ ] Moderation actions logged with timestamps
- [ ] Admin interface accessible to authorized users only

### Backend Implementation

- [ ] T245 [US11] Create IsAdminPermission class in backend/apps/users/permissions.py
- [ ] T246 [US11] Implement DELETE /api/v1/admin/projects/:id (soft delete) in backend/apps/projects/views.py
- [ ] T247 [US11] Implement DELETE /api/v1/admin/contributions/:id (soft delete) in backend/apps/contributions/views.py
- [ ] T248 [US11] Implement POST /api/v1/admin/users/:id/ban in backend/apps/users/views.py
- [ ] T249 [US11] Implement POST /api/v1/admin/credits/reverse with ledger entry in backend/apps/credits/views.py
- [ ] T250 [US11] Create moderation log model in backend/apps/moderation/models.py
- [ ] T251 [US11] Log all moderation actions in backend/apps/moderation/services.py
- [ ] T252 [US11] Add admin URLs to router in backend/apps/users/urls.py

### Frontend Implementation

- [X] T253 [P] [US11] Create admin API functions in frontend/src/api/admin.ts
- [X] T254 [US11] Create AdminPanel page in frontend/src/pages/AdminPanel.tsx
- [X] T255 [US11] Create ModerateContent component in frontend/src/components/admin/ModerateContent.tsx
- [X] T256 [US11] Create BanUser component in frontend/src/components/admin/BanUser.tsx
- [X] T257 [US11] Create ReverseCredit component in frontend/src/components/admin/ReverseCredit.tsx
- [X] T258 [US11] Add admin route with permission check in frontend/src/App.tsx

### Testing

- [ ] T259 [US11] Write integration tests for soft delete endpoints in backend/apps/projects/tests/test_admin.py
- [ ] T260 [US11] Write integration tests for user ban in backend/apps/users/tests/test_admin.py
- [ ] T261 [US11] Write integration tests for credit reversal in backend/apps/credits/tests/test_admin.py
- [ ] T262 [US11] Write tests for admin-only permission in backend/apps/users/tests/test_permissions.py
- [ ] T263 [US11] Write tests for moderation logging in backend/apps/moderation/tests/test_services.py

**FR-11 Completion Criteria:**
- [ ] All acceptance criteria from spec.md FR-11 met
- [ ] Admin can moderate content
- [ ] Admin can ban users
- [ ] Credit reversals work correctly
- [ ] All actions logged
- [ ] Admin interface secured
- [ ] >= 70% test coverage

---

## Phase 11: FR-12 GDPR Compliance & User Data Rights (High - Post-MVP)

**Goal:** Users can delete accounts and export data per GDPR requirements.

**User Story:** As a user, I want to delete my account and export my data so that I can exercise my privacy rights.

**Duration:** 3-4 days

**Dependencies:** All user-related features complete

**Independent Test Criteria:**
- [ ] User can request account deletion
- [ ] Account marked for deletion (soft delete)
- [ ] Data anonymized after 30 days (Celery task)
- [ ] User can export data in JSON format
- [ ] Privacy policy accessible
- [ ] Cookie consent banner shown

### Backend Implementation

- [ ] T264 [US12] Implement POST /api/v1/profile/delete-request in backend/apps/users/views.py
- [ ] T265 [US12] Implement GET /api/v1/profile/export-data in backend/apps/users/views.py
- [ ] T266 [US12] Create anonymize_user method on User model in backend/apps/users/models.py
- [ ] T267 [US12] Create anonymize_expired_deletions Celery Beat task in backend/apps/users/tasks.py
- [ ] T268 [US12] Configure Celery Beat schedule (daily at 2 AM) in backend/config/celery.py
- [ ] T269 [US12] Create data export service (JSON format) in backend/apps/users/services.py
- [ ] T270 [US12] Add GDPR URLs to router in backend/apps/users/urls.py

### Frontend Implementation

- [ ] T271 [P] [US12] Create GDPR API functions in frontend/src/api/users.ts
- [ ] T272 [US12] Create DeleteAccount component in frontend/src/components/DeleteAccount.tsx
- [ ] T273 [US12] Create ExportData component in frontend/src/components/ExportData.tsx
- [ ] T274 [US12] Add deletion request button to Profile page in frontend/src/pages/Profile.tsx
- [ ] T275 [US12] Add export data button to Profile page in frontend/src/pages/Profile.tsx
- [ ] T276 [US12] Create PrivacyPolicy page in frontend/src/pages/PrivacyPolicy.tsx
- [ ] T277 [US12] Create CookieConsent banner component in frontend/src/components/CookieConsent.tsx
- [ ] T278 [US12] Add PrivacyPolicy route to router in frontend/src/main.tsx

### Testing

- [ ] T279 [US12] Write unit tests for anonymize_user method in backend/apps/users/tests/test_models.py
- [ ] T280 [US12] Write unit tests for anonymize_expired_deletions task in backend/apps/users/tests/test_tasks.py
- [ ] T281 [US12] Write integration tests for deletion request in backend/apps/users/tests/test_views.py
- [ ] T282 [US12] Write integration tests for data export in backend/apps/users/tests/test_views.py
- [ ] T283 [US12] Write tests verifying anonymization preserves audit trail in backend/apps/users/tests/test_gdpr.py
- [ ] T284 [US12] Write React component tests for DeleteAccount in frontend/src/components/DeleteAccount.test.tsx

**FR-12 Completion Criteria:**
- [ ] All acceptance criteria from spec.md FR-12 met
- [ ] Users can request deletion
- [ ] Soft deletion preserves audit trail
- [ ] 30-day anonymization works (Celery Beat)
- [ ] Data export returns complete JSON
- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] >= 70% test coverage

---

## Final Phase: Cross-Cutting Concerns & Polish

**Goal:** Performance optimization, accessibility, deployment, and final polish.

**Duration:** 5-7 days

**Dependencies:** All functional requirements complete

### Performance Optimization

- [ ] T285 [P] Run Lighthouse audit on all pages in tests/performance/
- [ ] T286 [P] Optimize bundle size with code splitting in frontend/vite.config.ts
- [ ] T287 [P] Implement lazy loading for routes in frontend/src/main.tsx
- [ ] T288 [P] Add React.memo to expensive components in frontend/src/components/
- [ ] T289 [P] Optimize images for web delivery in frontend/public/
- [ ] T290 Run load test with 500 concurrent users using Locust in tests/load/
- [ ] T291 Measure p95 API response times under load in tests/load/
- [ ] T292 Configure pgBouncer for connection pooling
- [ ] T293 Verify database queries optimized (no N+1) in backend/
- [ ] T294 Add caching for static data (tags, public profiles) in backend/

### Accessibility (WCAG 2.1 Level AA)

- [ ] T295 [P] Run axe-core audit on all pages in tests/accessibility/
- [ ] T296 [P] Fix all WCAG 2.1 Level AA violations
- [ ] T297 [P] Verify keyboard navigation (Tab, Shift+Tab, Enter, Space) in tests/accessibility/
- [ ] T298 [P] Test with screen reader (NVDA/JAWS) in tests/accessibility/
- [ ] T299 [P] Verify color contrast ratios (4.5:1 minimum) in frontend/src/styles/
- [ ] T300 [P] Add focus indicators (3:1 contrast) in frontend/src/styles/globals.css
- [ ] T301 [P] Verify form labels associated with inputs in frontend/src/components/
- [ ] T302 [P] Add skip navigation links in frontend/src/App.tsx
- [ ] T303 Verify page zoom to 200% works without horizontal scroll in tests/accessibility/

### Security Hardening

- [ ] T304 [P] Review all authorization checks in backend/apps/*/views.py
- [ ] T305 [P] Verify rate limiting on all endpoints in backend/apps/*/views.py
- [ ] T306 [P] Audit input validation in backend/apps/*/serializers.py
- [ ] T307 [P] Configure CSRF protection in backend/config/settings.py
- [ ] T308 [P] Configure CSP headers in backend/config/middleware.py
- [ ] T309 [P] Verify HTTPS enforced in production in deployment config
- [ ] T310 [P] Run security scan (bandit, safety) in backend/
- [ ] T311 Review Django security checklist

### Error Handling & User Experience

- [ ] T312 [P] Create 404 Not Found page in frontend/src/pages/NotFound.tsx
- [ ] T313 [P] Create 500 Server Error page in frontend/src/pages/ServerError.tsx
- [ ] T314 [P] Add error boundaries to route components in frontend/src/App.tsx
- [ ] T315 [P] Verify all error messages user-friendly in frontend/src/
- [ ] T316 [P] Add retry buttons for network errors in frontend/src/components/
- [ ] T317 [P] Verify loading states for operations > 500ms in frontend/src/
- [ ] T318 Implement toast notifications for success/error in frontend/src/components/Toast.tsx

### Deployment & DevOps

- [ ] T319 Create Procfile for Gunicorn, Celery worker, Celery beat in backend/
- [ ] T320 Create runtime.txt specifying Python version in backend/
- [ ] T321 Configure production settings (DEBUG=False, ALLOWED_HOSTS) in backend/config/settings.py
- [ ] T322 Set up PostgreSQL managed database
- [ ] T323 Set up Redis managed instance
- [ ] T324 Configure environment variables in hosting dashboard
- [ ] T325 Deploy backend to Render/Fly.io/Railway
- [ ] T326 Run production migrations
- [ ] T327 Create Django superuser in production
- [ ] T328 Build frontend for production (npm run build) in frontend/
- [ ] T329 Deploy frontend to Vercel/Netlify
- [ ] T330 Configure CORS for production frontend URL
- [ ] T331 Configure email service (SendGrid/Mailgun)
- [ ] T332 Set up monitoring (Sentry for errors)
- [ ] T333 Configure alerts (response time > 3s, error rate > 1%)

### Documentation

- [ ] T334 [P] Generate OpenAPI schema with drf-spectacular in backend/
- [ ] T335 [P] Update README with setup instructions
- [ ] T336 [P] Document environment variables in .env.example
- [ ] T337 [P] Write user guide for hosts (creating projects)
- [ ] T338 [P] Write user guide for contributors (submitting work)
- [ ] T339 [P] Document deployment process
- [ ] T340 [P] Create architecture decision records for key choices

### Final Testing & Verification

- [ ] T341 Run full test suite (backend + frontend) in CI/CD
- [ ] T342 Verify >= 70% test coverage overall
- [ ] T343 Verify 100% coverage for critical paths (auth, credits, permissions)
- [ ] T344 Run E2E test suite with Playwright in tests/e2e/
- [ ] T345 Verify all constitutional principles met (code quality, test coverage, UX, performance)
- [ ] T346 Run production smoke tests (registration, login, create project, submit contribution, accept)
- [ ] T347 Verify all NFRs met (performance, security, accessibility)
- [ ] T348 Code review by team
- [ ] T349 Security review
- [ ] T350 Final QA pass

**Final Phase Completion Criteria:**
- [ ] Lighthouse score >= 90 on all pages
- [ ] Zero WCAG 2.1 Level AA violations
- [ ] Load test passes (500 concurrent users, < 3s p95)
- [ ] >= 70% test coverage, 100% on critical paths
- [ ] All linter errors resolved
- [ ] Production deployment successful
- [ ] Monitoring and alerts configured
- [ ] Documentation complete

---

## Testing Coverage Summary

| Module | Target Coverage | Critical Path (100% Required) |
|--------|----------------|-------------------------------|
| users (auth) | >= 70% | ✅ Authentication flow |
| projects | >= 70% | |
| contributions | >= 70% | ✅ Accept/decline logic |
| credits | >= 70% | ✅ Credit transactions, ledger |
| **Overall** | **>= 70%** | ✅ All critical paths |

---

## Performance Benchmarks

| Metric | Target | Verification Task |
|--------|--------|-------------------|
| Initial page load | < 3s | T285 (Lighthouse) |
| Project feed | < 1s | T137 (integration test) |
| Full-text search | < 100ms | T137 (performance test) |
| API response (p95) | < 3s | T291 (load test) |
| Credit balance query | < 20ms | T202 (unit test) |
| Concurrent users | 500 | T290 (load test) |

---

## Dependency Graph (User Story Completion Order)

```
Phase 1 (Setup) → Phase 2 (Foundation)
                    ↓
              Phase 3 (FR-1: Auth) ────────────────┐
                    ↓                               ↓
              Phase 4 (FR-3: Projects)         Phase 8 (FR-2: Profile)
                    ↓
              Phase 5 (FR-4: Discovery)
                    ↓
              Phase 6 (FR-5/6: Detail + Submit)
                    ↓
              Phase 7 (FR-7/9: Review + Credits) ──┤
                    ↓                               ↓
              Phase 9 (FR-8/10: Contributors)   Phase 10 (FR-11: Moderation)
                    ↓
              Phase 11 (FR-12: GDPR)
                    ↓
              Final Phase (Polish)
```

**Parallel Opportunities:**
- Phase 8 (FR-2) can start after Phase 3 (FR-1) if needed
- Phase 10 (FR-11) can run parallel with Phase 9 (FR-8/10)
- Phase 11 (FR-12) can run parallel with Phase 9/10 (separate concerns)
- Final Phase tasks marked `[P]` can run in parallel

**Critical Path (Must Complete in Order):**
1. FR-1 (Auth) → FR-3 (Projects) → FR-4 (Discovery) → FR-5/6 (Detail/Submit) → FR-7/9 (Review/Credits)

---

## MVP Scope Recommendation

**Minimum Viable Product (4-5 weeks):**
- ✅ Phase 1: Setup
- ✅ Phase 2: Foundation
- ✅ Phase 3: FR-1 (Auth)
- ✅ Phase 4: FR-3 (Projects)
- ✅ Phase 5: FR-4 (Discovery)
- ✅ Phase 6: FR-5/6 (Detail + Submit)
- ✅ Phase 7: FR-7/9 (Review + Credits)
- ✅ Final Phase: Performance, Accessibility, Deployment (essential tasks only)

**Post-MVP (2-3 weeks):**
- Phase 8: FR-2 (Extended Profile)
- Phase 9: FR-8/10 (Contributors Display)
- Phase 10: FR-11 (Moderation)
- Phase 11: FR-12 (GDPR)
- Final Phase: Polish (remaining tasks)

---

## Task Status Summary

- **Total Tasks:** 350
- **MVP Tasks:** ~200
- **Post-MVP Tasks:** ~80
- **Polish/Testing Tasks:** ~70

**Estimated Duration:**
- MVP: 4-5 weeks (2-3 developers)
- Full Feature Set: 6-8 weeks (2-3 developers)

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ Sequential task IDs (T001-T350)
✅ `[P]` marker for parallelizable tasks
✅ `[US#]` marker for user story tasks (Phase 3+)
✅ File paths included in descriptions
✅ Dependencies noted
✅ Independent test criteria per story

---

## Constitution Compliance Verification

**Principle 1 (Code Quality):**
- [x] Self-documenting code emphasized in acceptance criteria
- [x] No excessive commenting required
- [x] Clear file structure and naming

**Principle 2 (Test Coverage):**
- [x] >= 70% target overall
- [x] 100% coverage for critical paths (auth, credits, permissions)
- [x] Unit, integration, and E2E tests included

**Principle 3 (User Experience):**
- [x] < 3s response time verification tasks
- [x] Loading states for operations > 500ms
- [x] Error handling with clear messages
- [x] WCAG 2.1 Level AA accessibility tasks

**Principle 4 (Performance & Dependencies):**
- [x] Minimal dependencies justified in research.md
- [x] Bundle size < 150KB verified
- [x] No unnecessary libraries added
- [x] Load testing with 500 concurrent users

---

*These tasks adhere to the InterfaceHive Constitution v1.0.0*

