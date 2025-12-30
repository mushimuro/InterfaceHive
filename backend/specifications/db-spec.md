## Database (PostgreSQL)

### 1.1 Entities
- `USER`
- `PROJECT`
- `PROJECT_TAG`
- `PROJECT_TAG_MAP`
- `CONTRIBUTION`
- `CREDIT_LEDGER_ENTRY`

### 1.2 Key constraints
- User authentication:
  - `USER.email` is unique
  - **Only users with `email_verified = true` can log in**
  - `email_verification_token` must be unique when non-null
- Tags:
  - `PROJECT_TAG.name` is unique
- Tag mapping:
  - `(project_id, tag_id)` unique
- Contribution decision consistency:
  - If `status in (ACCEPTED, DECLINED)` then `decided_by_user_id` and `decided_at` are non-null
- Credit uniqueness (core business rule):
  - **At most one AWARD per (project_id, to_user_id)**

**Recommended Postgres partial unique index**
- `UNIQUE(project_id, to_user_id) WHERE entry_type = 'AWARD'`
- `UNIQUE(email_verification_token) WHERE email_verification_token IS NOT NULL`

### 1.3 Indexing
- `USER(email_verified, email_verification_token)`
- `PROJECT(host_user_id)`
- `PROJECT(status, created_at DESC)`
- `CONTRIBUTION(project_id, created_at DESC)`
- `CONTRIBUTION(contributor_user_id, created_at DESC)`
- `CREDIT_LEDGER_ENTRY(to_user_id, created_at DESC)`
- Optional search:
  - GIN full-text index over project title/description

### 1.4 Credits computation
- Total credits = count of AWARD ledger entries for a user:
  - `COUNT(*) WHERE to_user_id = ? AND entry_type='AWARD'`


### 1.5 Overall ERD

```mermaid
erDiagram
  USER {
    uuid id PK
    string email "unique"
    string username "unique"
    string display_name
    text bio
    string github_url
    string portfolio_url
    boolean email_verified "false by default, required for login"
    string email_verification_token "nullable, unique when set"
    timestamp email_verified_at "nullable until verified"
    timestamp created_at
    timestamp updated_at
  }

  PROJECT {
    uuid id PK
    uuid host_user_id FK
    string title
    text description
    text what_it_does
    text inputs_dependencies
    text desired_outputs
    string status "DRAFT|OPEN|CLOSED"
    string difficulty
    string estimated_time
    string github_url
    timestamp created_at
    timestamp updated_at
  }

  PROJECT_TAG {
    uuid id PK
    string name "unique"
  }

  PROJECT_TAG_MAP {
    uuid project_id FK
    uuid tag_id FK
    timestamp created_at
  }

  CONTRIBUTION {
    uuid id PK
    uuid project_id FK
    uuid contributor_user_id FK
    string title
    text body
    text links_json "JSON array of URLs"
    text attachments_json "JSON array / optional"
    string status "PENDING|ACCEPTED|DECLINED"
    uuid decided_by_user_id FK "nullable until decided"
    timestamp decided_at "nullable until decided"
    timestamp created_at
    timestamp updated_at
  }

  CREDIT_LEDGER_ENTRY {
    uuid id PK
    uuid to_user_id FK
    uuid project_id FK
    uuid contribution_id FK
    int amount "typically 1"
    string entry_type "AWARD|REVERSAL|ADJUSTMENT"
    uuid created_by_user_id FK "host or admin"
    timestamp created_at
  }

  %% Relationships
  USER ||--o{ PROJECT : hosts
  PROJECT ||--o{ CONTRIBUTION : receives
  USER ||--o{ CONTRIBUTION : submits

  PROJECT ||--o{ PROJECT_TAG_MAP : has
  PROJECT_TAG ||--o{ PROJECT_TAG_MAP : used_by

  USER ||--o{ CREDIT_LEDGER_ENTRY : earns
  CONTRIBUTION ||--o{ CREDIT_LEDGER_ENTRY : triggers
  PROJECT ||--o{ CREDIT_LEDGER_ENTRY : for_project
  USER ||--o{ CREDIT_LEDGER_ENTRY : created_by
  USER ||--o{ CONTRIBUTION : decides
```