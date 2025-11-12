# Database Migrations

This directory contains SQL migration files for the database schema.

## Migration Files

### 001_increase_varchar_limits.sql
Increases VARCHAR limits for existing tables:
- `ideas.title`: 255 → 500 characters
- `ideas.persona`: 100 → 200 characters
- `ideas.industry`: 100 → 200 characters
- `content_plans.target_audience`: 255 → 500 characters

### 002_create_content_packs.sql
Creates the `content_packs` table with the following structure:

**Columns:**
- `pack_id`: UUID (Primary Key, auto-generated)
- `brief_id`: UUID (Foreign Key → `briefs.brief_id`)
- `draft_content`: TEXT
- `word_count`: INTEGER (default: 0)
- `status`: ENUM('draft', 'review', 'approved', 'published') (default: 'draft')
- `created_at`: TIMESTAMP (auto-set on insert)
- `updated_at`: TIMESTAMP (auto-updated on row update)

**Features:**
- ✅ UUID primary key with auto-generation
- ✅ Foreign key constraint to `briefs` table with CASCADE on delete/update
- ✅ ENUM type for status with default value 'draft'
- ✅ Automatic `updated_at` timestamp via trigger
- ✅ Indexes on `brief_id`, `status`, and `created_at` for performance
- ✅ Creates `briefs` table if it doesn't exist

## Running Migrations

### Method 1: Using Docker (Recommended)
```powershell
# Copy migration file to container
docker cp backend/migrations/002_create_content_packs.sql ideas_db:/tmp/migration.sql

# Run migration
docker exec ideas_db psql -U postgres -d ideas_db -f /tmp/migration.sql
```

### Method 2: Direct psql
```bash
psql -U postgres -d ideas_db -f backend/migrations/002_create_content_packs.sql
```

### Method 3: Using psql in Docker
```powershell
# Read file and pipe to psql
Get-Content backend/migrations/002_create_content_packs.sql | docker exec -i ideas_db psql -U postgres -d ideas_db
```

## Verification

After running a migration, verify it worked:

```powershell
# Check table structure
docker exec ideas_db psql -U postgres -d ideas_db -c "\d content_packs"

# Check constraints
docker exec ideas_db psql -U postgres -d ideas_db -c "SELECT conname, contype, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'content_packs'::regclass;"

# Check triggers
docker exec ideas_db psql -U postgres -d ideas_db -c "SELECT tgname, tgtype, tgenabled FROM pg_trigger WHERE tgrelid = 'content_packs'::regclass;"
```

## Testing the Migration

### Test auto-update trigger:
```sql
-- Insert a test record
INSERT INTO content_packs (brief_id, draft_content, word_count)
VALUES (
    (SELECT brief_id FROM briefs LIMIT 1),
    'Test content',
    2
);

-- Wait a moment, then update
UPDATE content_packs SET draft_content = 'Updated content' WHERE pack_id = (
    SELECT pack_id FROM content_packs ORDER BY created_at DESC LIMIT 1
);

-- Check updated_at was automatically updated
SELECT pack_id, draft_content, created_at, updated_at 
FROM content_packs 
ORDER BY created_at DESC 
LIMIT 1;
```

### Test foreign key constraint:
```sql
-- This should fail (invalid brief_id)
INSERT INTO content_packs (brief_id, draft_content)
VALUES ('00000000-0000-0000-0000-000000000000', 'Test');
```

## Notes

- The migration creates the `briefs` table if it doesn't exist
- UUID extension (`uuid-ossp`) is automatically enabled
- The trigger function `update_content_packs_updated_at()` is reusable
- All indexes are created with `IF NOT EXISTS` to prevent errors on re-run








