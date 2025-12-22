## Frontend (React + shadcn)

### 1.1 Stack
- React + **TypeScript** (recommended)
- UI: shadcn/ui
- Routing: React Router
- Data fetching: TanStack Query (recommended) or SWR
- Forms: react-hook-form + zod

### 1.2 Routes / Pages

#### `/` — Project Feed
- Search by keyword
- Filter by tags
- Sort: newest / most active
- Project cards show:
  - title, host display name
  - tags
  - status (Open/Closed)
  - created date
  - accepted contributor count

#### `/projects/new` — Create Project
- Required:
  - title
  - description
  - what_it_does
  - desired_outputs (acceptance criteria)
- Optional:
  - inputs_dependencies
  - tags, difficulty, estimated_time
  - github_url
  - credit_offer (if you expose it)

#### `/projects/:id` — Project Detail
- Project summary + full description fields
- Sidebar: host card, status, tags, links
- Sections:
  - **Accepted Contributors** (unique users from accepted contributions only)
  - **Contributions**
    - Host view: all contributions + status + Accept/Decline actions
    - Public view: accepted only
    - Contributor view: accepted + “my contributions” with status
- “Submit Contribution” form (only if Open + logged in + not host)

#### `/profile` — My Profile
- Edit profile fields (display name, bio, links)
- Credit total
- Lists:
  - My Projects
  - My Contributions

#### `/users/:id` — Public Profile
- Display name, bio, links
- Total credits (and optionally recent accepted work)

#### `/auth/login`, `/auth/register`
- Auth flows

### 1.3 Frontend validation rules
- Project:
  - title: 5–120 chars
  - description: 20–5000 chars
  - what_it_does: 20–2000 chars
  - desired_outputs: 20–2000 chars
  - tags: max 10
- Contribution:
  - body: 20–5000 chars
  - links: max 10 URLs
  - attachments: MVP links-only (max 5)

### 1.4 UX behavior
- Contribution statuses displayed with badges:
  - Pending / Accepted / Declined
- Host decisions update UI immediately (optimistic update) + rollback on failure
- Declined contributions never appear in accepted contributor list