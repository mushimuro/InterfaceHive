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


