# Database Migration: Quiz Questions Schema Update

## Problem
The quiz questions table schema doesn't match the new multiple choice format. The old schema had:
- `correct_answer TEXT NOT NULL`
- `question_type VARCHAR(20)`
- `options JSONB` (nullable)

The new schema needs:
- `correct_answer_index INTEGER NOT NULL` (0-3)
- `options JSONB NOT NULL` (exactly 4 options)
- No `question_type` column

## Solution

### For New Databases
The `database_init.sql` file has been updated with the correct schema. Just use the updated file.

### For Existing Databases
Run the migration script:

```bash
# Connect to your database
psql -U admin -d studyspace -f backend/migrations/migrate_quiz_questions.sql
```

Or if using Docker:
```bash
docker exec -i studyspace-postgres psql -U admin -d studyspace < backend/migrations/migrate_quiz_questions.sql
```

## What the Migration Does

1. **Adds new column**: `correct_answer_index` (if it doesn't exist)
2. **Makes options NOT NULL**: Sets default empty array for NULL values, then makes it NOT NULL
3. **Migrates existing data**: Attempts to convert old `correct_answer` text to `correct_answer_index` by matching against options array
4. **Removes old columns**: Drops `question_type` and `correct_answer` columns
5. **Adds constraints**: 
   - Ensures `correct_answer_index` is between 0-3
   - Ensures `options` array has exactly 4 elements

## Important Notes

- **Data Loss Warning**: If you have existing quiz questions, the migration will attempt to preserve them, but you should review questions where `correct_answer_index` defaults to 0
- **Backup First**: Always backup your database before running migrations
- **Test First**: Test the migration on a development/staging database first

## Verification

After running the migration, verify the schema:

```sql
\d quiz_questions
```

You should see:
- `options` as `jsonb NOT NULL`
- `correct_answer_index` as `integer NOT NULL`
- No `correct_answer` or `question_type` columns

