# InterfaceHive Database Architecture

## Overview
PostgreSQL 16-based relational database designed for a contribution marketplace with full-text search, immutable audit trails, and GDPR compliance.

---

## Technology Stack

### Database Engine
- **PostgreSQL 16** - Advanced open-source relational database
- **psycopg2** - PostgreSQL adapter for Python
- **Django ORM** - Object-Relational Mapping

### Key PostgreSQL Features Used
- **UUID Primary Keys** - Globally unique identifiers
- **Full-Text Search** - GIN indexes with tsvector
- **Array Fields** - Native array support for tags
- **JSONB** - Semi-structured data storage
- **Triggers** - Auto-update search vectors
- **Constraints** - Data integrity enforcement

---

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     InterfaceHive Database                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────┐                  ┌──────────────┐            │
│  │   users    │◄────────────────┤  projects    │            │
│  └────────────┘                  └──────────────┘            │
│        ▲                                │                    │
│        │                                │                    │
│        │                          ┌─────▼──────────┐         │
│        │                          │ contributions  │         │
│        │                          └────────────────┘         │
│        │                                                     │
│        │          ┌─────────────────────┐                   │
│        └──────────┤ credit_ledger_entry │                   │
│                   └─────────────────────┘                   │
│                                                               │
│        ┌──────────────┐         ┌──────────────┐            │
│        │ chat_message │         │moderation_log│            │
│        └──────────────┘         └──────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Data Models

### 1. User Model

#### Purpose
Central authentication and user management with GDPR compliance.

#### Schema
```sql
CREATE TABLE users_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,  -- Hashed with PBKDF2

    -- Profile fields
    bio TEXT,
    avatar_url VARCHAR(500),
    location VARCHAR(100),
    github_url VARCHAR(200),
    linkedin_url VARCHAR(200),

    -- Auth fields
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,

    -- GDPR compliance
    deleted_at TIMESTAMP,
    anonymized_at TIMESTAMP,

    -- Timestamps
    date_joined TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
```

#### Indexes
```sql
CREATE INDEX idx_users_email ON users_user(email);
CREATE INDEX idx_users_deleted_at ON users_user(deleted_at)
    WHERE deleted_at IS NOT NULL;
```

#### Key Features
- **UUID Primary Key** - Avoids enumeration attacks
- **Email Uniqueness** - One account per email
- **Soft Delete** - `deleted_at` timestamp instead of hard delete
- **GDPR Anonymization** - `anonymized_at` marks PII removal

#### Business Rules
1. Email must be verified to create projects/contribute
2. Deleted users have 30-day grace period before anonymization
3. Anonymization irreversibly removes PII (email → `deleted-{uuid}@example.com`)

---

### 2. Project Model

#### Purpose
Stores contribution requests (calls for contribution) from project hosts.

#### Schema
```sql
CREATE TABLE projects_project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES users_user(id),

    -- Core fields
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    tags TEXT[] DEFAULT '{}',  -- PostgreSQL array

    -- Status
    status VARCHAR(20) DEFAULT 'open',
    -- Choices: open, in_progress, completed, cancelled

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP,

    -- Full-text search
    search_vector TSVECTOR
);
```

#### Indexes
```sql
-- Full-text search
CREATE INDEX idx_projects_search ON projects_project
    USING GIN(search_vector);

-- Status filtering
CREATE INDEX idx_projects_status_created ON projects_project(status, created_at);

-- Host's projects
CREATE INDEX idx_projects_host_status ON projects_project(host_id, status);

-- Tag search
CREATE INDEX idx_projects_tags ON projects_project USING GIN(tags);
```

#### Triggers
```sql
-- Auto-update search vector on insert/update
CREATE TRIGGER update_project_search_vector
    BEFORE INSERT OR UPDATE ON projects_project
    FOR EACH ROW
    EXECUTE FUNCTION
        tsvector_update_trigger(search_vector, 'pg_catalog.english',
                                 title, description);
```

#### Key Features
- **Full-Text Search** - Indexed `tsvector` for fast text queries
- **Array Fields** - Native support for tags (no junction table needed)
- **Status Tracking** - Lifecycle management (open → completed)
- **Soft Delete** - Projects can be closed, not deleted

#### Business Rules
1. Only verified users can create projects
2. Only host can edit/delete their projects
3. Cannot delete projects with accepted contributions
4. Search weighted: title (A) > description (B)

---

### 3. Contribution Model

#### Purpose
Tracks submissions from contributors to projects.

#### Schema
```sql
CREATE TABLE contributions_contribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects_project(id),
    contributor_id UUID NOT NULL REFERENCES users_user(id),

    -- Submission data
    content TEXT NOT NULL,
    submission_url VARCHAR(500),
    attachments JSONB,  -- Future: file metadata

    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- Choices: pending, accepted, declined

    -- Timestamps
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_contribution_per_user_project
        UNIQUE(project_id, contributor_id)
);
```

#### Indexes
```sql
-- Contributor's submissions
CREATE INDEX idx_contributions_contributor
    ON contributions_contribution(contributor_id, status);

-- Project submissions (for host review)
CREATE INDEX idx_contributions_project_status
    ON contributions_contribution(project_id, status);
```

#### Key Features
- **One Per User Per Project** - Unique constraint prevents duplicates
- **Immutable Decisions** - Status changes are one-way (no update from accepted/declined)
- **JSONB Attachments** - Flexible metadata storage

#### Business Rules
1. Cannot contribute to own projects
2. One contribution per user per project
3. Auto-award 1 credit on acceptance (via Django signals)
4. Status transitions: pending → (accepted OR declined) only

#### Cascade Behavior
- `ON DELETE CASCADE` for project (delete contributions if project deleted)
- `ON DELETE SET NULL` for contributor (preserve submission if user deleted)

---

### 4. CreditLedgerEntry Model

#### Purpose
Immutable append-only ledger for reputation credits.

#### Schema
```sql
CREATE TABLE credits_creditledgerentry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users_user(id),

    -- Transaction data
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    -- Choices: award, penalty, reversal

    reason TEXT,

    -- References
    contribution_id UUID REFERENCES contributions_contribution(id),
    project_id UUID REFERENCES projects_project(id),

    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW(),

    -- Prevent double-crediting same project
    CONSTRAINT unique_credit_per_user_project
        UNIQUE(user_id, project_id)
);
```

#### Indexes
```sql
-- User balance calculation
CREATE INDEX idx_credits_user_created
    ON credits_creditledgerentry(user_id, created_at DESC);

-- Project credit lookup
CREATE INDEX idx_credits_project
    ON credits_creditledgerentry(project_id);
```

#### Key Features
- **Append-Only** - No UPDATE or DELETE operations allowed
- **One Credit Per Project** - Unique constraint on (user, project) for awards
- **Reversals** - Corrections via new entry with negative amount
- **Decimal Precision** - DECIMAL(10,2) for exact arithmetic

#### Business Logic
```sql
-- Calculate user balance
SELECT user_id, SUM(amount) as balance
FROM credits_creditledgerentry
WHERE user_id = 'uuid-here'
GROUP BY user_id;
```

#### Business Rules
1. Only one award per user per project
2. Cannot modify/delete entries (immutable)
3. Corrections done via reversal entries
4. Amount can be negative (penalties/reversals)

---

### 5. ChatMessage Model

#### Purpose
Persistent storage for project-scoped real-time chat.

#### Schema
```sql
CREATE TABLE chat_chatmessage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects_project(id),
    sender_id UUID NOT NULL REFERENCES users_user(id),

    -- Message data
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    -- Choices: text, system, attachment

    metadata JSONB,  -- Future: reactions, mentions

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP
);
```

#### Indexes
```sql
-- Project chat history (ordered by time)
CREATE INDEX idx_chat_project_created
    ON chat_chatmessage(project_id, created_at DESC);

-- User's messages
CREATE INDEX idx_chat_sender
    ON chat_chatmessage(sender_id);
```

#### Key Features
- **Project-Scoped** - Each project has isolated chat room
- **JSONB Metadata** - Extensible for reactions, mentions, attachments
- **Soft Edit** - Track `edited_at` timestamp

#### Business Rules
1. Only project participants (host + contributors) can access chat
2. Messages cannot be deleted (only soft-edited)
3. System messages for events (e.g., "User joined", "Contribution accepted")

---

### 6. ModerationLog Model

#### Purpose
Immutable audit trail for admin/moderation actions.

#### Schema
```sql
CREATE TABLE moderation_moderationlog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID NOT NULL REFERENCES users_user(id),

    -- Action details
    action VARCHAR(20) NOT NULL,
    -- Choices: flag, suspend, ban, delete_content, restore

    reason TEXT NOT NULL,

    -- Targets (nullable - depends on action type)
    target_user_id UUID REFERENCES users_user(id),
    target_project_id UUID REFERENCES projects_project(id),
    target_contribution_id UUID REFERENCES contributions_contribution(id),

    metadata JSONB,  -- Additional context

    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Indexes
```sql
-- Moderator activity
CREATE INDEX idx_moderation_moderator
    ON moderation_moderationlog(moderator_id, created_at DESC);

-- Target lookups
CREATE INDEX idx_moderation_target_user
    ON moderation_moderationlog(target_user_id);
CREATE INDEX idx_moderation_target_project
    ON moderation_moderationlog(target_project_id);
```

#### Key Features
- **Immutable** - No UPDATE or DELETE operations
- **Comprehensive Logging** - Who did what, when, why
- **Multi-Target** - Can log actions on users, projects, contributions

#### Business Rules
1. Only admin/staff can create logs
2. Entries cannot be modified (audit integrity)
3. Required for compliance and dispute resolution

---

## Data Integrity Constraints

### Foreign Key Constraints
```sql
-- Cascading deletes
ALTER TABLE projects_project
    ADD CONSTRAINT fk_project_host
    FOREIGN KEY (host_id) REFERENCES users_user(id)
    ON DELETE CASCADE;

-- Nullify on delete (preserve history)
ALTER TABLE contributions_contribution
    ADD CONSTRAINT fk_contribution_contributor
    FOREIGN KEY (contributor_id) REFERENCES users_user(id)
    ON DELETE SET NULL;
```

### Check Constraints
```sql
-- Positive credit amounts (or negative for reversals)
ALTER TABLE credits_creditledgerentry
    ADD CONSTRAINT check_amount_not_zero
    CHECK (amount != 0);

-- Valid status transitions
ALTER TABLE contributions_contribution
    ADD CONSTRAINT check_valid_status
    CHECK (status IN ('pending', 'accepted', 'declined'));
```

### Unique Constraints
```sql
-- One contribution per user per project
ALTER TABLE contributions_contribution
    ADD CONSTRAINT unique_contribution_per_user_project
    UNIQUE (project_id, contributor_id);

-- One credit award per user per project
ALTER TABLE credits_creditledgerentry
    ADD CONSTRAINT unique_credit_per_user_project
    UNIQUE (user_id, project_id);
```

---

## Indexing Strategy

### Purpose-Based Indexes

#### 1. Search Optimization
```sql
-- Full-text search
CREATE INDEX idx_projects_search
    ON projects_project USING GIN(search_vector);

-- Tag filtering
CREATE INDEX idx_projects_tags
    ON projects_project USING GIN(tags);
```

#### 2. Query Performance
```sql
-- List filtering (status + sorting)
CREATE INDEX idx_projects_status_created
    ON projects_project(status, created_at DESC);

-- User's resources
CREATE INDEX idx_projects_host
    ON projects_project(host_id);
```

#### 3. Join Optimization
```sql
-- Foreign key indexes (auto-created by Django)
CREATE INDEX idx_contributions_project
    ON contributions_contribution(project_id);
CREATE INDEX idx_contributions_contributor
    ON contributions_contribution(contributor_id);
```

#### 4. Partial Indexes
```sql
-- Only index deleted users (sparse data)
CREATE INDEX idx_users_deleted
    ON users_user(deleted_at)
    WHERE deleted_at IS NOT NULL;
```

---

## Performance Optimization

### Query Optimization Techniques

#### 1. Eager Loading
```python
# Avoid N+1 queries
projects = Project.objects.select_related('host').all()

# Prefetch related sets
projects = Project.objects.prefetch_related('contributions').all()
```

#### 2. Index Usage
```sql
-- Use indexes effectively
SELECT * FROM projects_project
WHERE status = 'open'
ORDER BY created_at DESC
LIMIT 20;
-- Uses: idx_projects_status_created
```

#### 3. Aggregation
```sql
-- Credit balance with aggregation
SELECT user_id, SUM(amount) as balance
FROM credits_creditledgerentry
GROUP BY user_id;
```

### Database Configuration

#### Connection Pooling
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,  # 10 min persistent connections
    }
}
```

#### Query Timeout
```sql
-- Prevent long-running queries
SET statement_timeout = '30s';
```

---

## Backup & Recovery

### Backup Strategy

#### Daily Full Backups
```bash
pg_dump -Fc interfacehive_db > backup_$(date +%Y%m%d).dump
```

#### Point-in-Time Recovery
```bash
# Enable WAL archiving
archive_mode = on
archive_command = 'cp %p /backups/wal/%f'
```

#### Retention Policy
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

---

## Data Migration

### Django Migrations
```bash
# Create migration
python manage.py makemigrations

# Apply migration
python manage.py migrate

# Rollback
python manage.py migrate app_name migration_name
```

### Zero-Downtime Migrations
1. Add new column (nullable)
2. Deploy code to populate new column
3. Backfill existing data
4. Make column NOT NULL (if needed)
5. Remove old column (separate migration)

---

## GDPR Compliance

### Personal Data Handling

#### Soft Delete Flow
```sql
-- User requests deletion
UPDATE users_user
SET deleted_at = NOW()
WHERE id = 'user-uuid';

-- 30 days later: Anonymization
UPDATE users_user
SET
    email = 'deleted-' || id || '@example.com',
    username = 'deleted-user-' || id,
    bio = NULL,
    avatar_url = NULL,
    anonymized_at = NOW()
WHERE deleted_at < NOW() - INTERVAL '30 days'
  AND anonymized_at IS NULL;
```

#### Data Export
```python
# Generate user data export (JSON)
def export_user_data(user_id):
    return {
        'profile': User.objects.get(id=user_id).to_dict(),
        'projects': Project.objects.filter(host_id=user_id).values(),
        'contributions': Contribution.objects.filter(contributor_id=user_id).values(),
        'credits': CreditLedgerEntry.objects.filter(user_id=user_id).values()
    }
```

---

## Scaling Strategies

### Vertical Scaling
- Increase PostgreSQL resources (CPU, RAM, IOPS)
- Optimize query performance
- Add indexes

### Horizontal Scaling

#### Read Replicas
```
Primary (Write) ← Application Writes
    ↓ Replication
Replica 1 (Read) ← Application Reads
Replica 2 (Read) ← Analytics Queries
```

#### Partitioning (Future)
```sql
-- Partition large tables by date
CREATE TABLE chat_chatmessage_2024_01
    PARTITION OF chat_chatmessage
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

## Monitoring & Maintenance

### Key Metrics
- **Query Performance** - pg_stat_statements
- **Index Usage** - pg_stat_user_indexes
- **Table Bloat** - pg_bloat_check
- **Connection Count** - pg_stat_activity

### Maintenance Tasks
```sql
-- Vacuum (reclaim space)
VACUUM ANALYZE;

-- Reindex (rebuild indexes)
REINDEX INDEX idx_projects_search;

-- Analyze (update statistics)
ANALYZE projects_project;
```

---

## Security Measures

### 1. Access Control
```sql
-- Application user (limited privileges)
CREATE USER interfacehive_app WITH PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
    TO interfacehive_app;
```

### 2. SQL Injection Prevention
- Use Django ORM (parameterized queries)
- Avoid raw SQL with user input
- Use `params` argument for raw queries

### 3. Encryption
- **At Rest** - PostgreSQL transparent data encryption (TDE)
- **In Transit** - SSL/TLS connections
- **Passwords** - PBKDF2 hashing (Django default)

### 4. Row-Level Security (Future)
```sql
-- Only users can see their own data
CREATE POLICY user_data_policy ON credits_creditledgerentry
    FOR SELECT
    USING (user_id = current_setting('app.user_id')::uuid);
```

---

## Summary

The database architecture emphasizes:
1. **Data Integrity** - Constraints, foreign keys, immutable logs
2. **Performance** - Strategic indexing, full-text search, query optimization
3. **Scalability** - Read replicas, partitioning, connection pooling
4. **Compliance** - GDPR soft delete, anonymization, audit trails
5. **Security** - Access control, encryption, SQL injection prevention
6. **Maintainability** - Django migrations, backup strategy, monitoring
