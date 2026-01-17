# Fix Database Migration and AI Generation Issues

## Problem 1: Database Migration
The frontend is trying to filter by `is_ai_generated` field, but the database doesn't have this column yet because the migration hasn't been applied.

## Problem 2: AI Generation Missing Fields
The AI service wasn't including all required fields (`estimated_time`, `usage_type`) that the database expects.

## Solution

### Step 1: Run Database Migrations

#### If using Docker:
```bash
docker compose exec backend python manage.py migrate
```

#### If running locally:
```bash
cd backend
python manage.py migrate
```

### Step 2: Restart Backend Server

After running migrations, restart your backend server:

#### If using Docker:
```bash
docker compose restart backend
```

#### If running locally:
Stop the server (Ctrl+C) and start it again:
```bash
python manage.py runserver
```

## Verification

After running migrations, you should see:
```
Running migrations:
  Applying projects.0006_project_is_ai_generated... OK
```

Then both pages should work correctly:
- `/projects` - Shows user-created projects (`is_ai_generated=false`)
- `/project-templates` - Shows AI-generated templates (`is_ai_generated=true`)

## What was fixed

1. **Migration**: Adds the `is_ai_generated` boolean field to the `projects` table
2. **AI Service**: Updated to include all required fields:
   - `estimated_time` (default: "2-4 weeks")
   - `usage_type` (default: "practice")
   - `difficulty` (default: "intermediate")
3. **Data Normalization**: Ensures difficulty and usage_type are lowercase to match database constraints
4. **Better Error Logging**: Added `exc_info=True` for full stack traces in logs
