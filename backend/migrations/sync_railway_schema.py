"""
Migration Script: Sync Railway Database Schema with Local
This script updates Railway database to match the current schema in database_init.sql

Run this script to ensure Railway database has all the latest schema changes.
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# ============================================
# PASTE YOUR RAILWAY DATABASE_URL HERE
# ============================================
DATABASE_URL = 'postgresql://postgres:QXpQlAAnQUDdJPpAQFNJIVLSkNRiJySj@hopper.proxy.rlwy.net:53957/railway'
# ============================================

def run_migration(cursor):
    """Run all migration steps"""
    
    print("=" * 60)
    print("Railway Database Schema Sync")
    print("=" * 60)
    print()
    
    # ============================================
    # STEP 1: Update quiz_questions table
    # ============================================
    print("Step 1: Updating quiz_questions table...")
    
    # 1.1: Convert options from json to jsonb if needed
    cursor.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_questions' 
                AND column_name = 'options' 
                AND data_type = 'json'
            ) THEN
                UPDATE quiz_questions SET options = '[]'::json WHERE options IS NULL;
                ALTER TABLE quiz_questions 
                ALTER COLUMN options TYPE jsonb USING options::jsonb;
                RAISE NOTICE 'Converted options from json to jsonb';
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_questions' 
                AND column_name = 'options' 
                AND is_nullable = 'YES'
            ) THEN
                UPDATE quiz_questions SET options = '[]'::jsonb WHERE options IS NULL;
                ALTER TABLE quiz_questions ALTER COLUMN options SET NOT NULL;
                RAISE NOTICE 'Made options NOT NULL';
            END IF;
        END $$;
    """)
    print("  ✓ Options column updated")
    
    # 1.2: Add correct_answer_index if it doesn't exist
    cursor.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_questions' AND column_name = 'correct_answer_index'
            ) THEN
                ALTER TABLE quiz_questions ADD COLUMN correct_answer_index INTEGER;
                RAISE NOTICE 'Added correct_answer_index column';
            END IF;
        END $$;
    """)
    print("  ✓ correct_answer_index column checked")
    
    # 1.3: Migrate data from correct_answer to correct_answer_index
    cursor.execute("""
        DO $$
        DECLARE
            q_record RECORD;
            option_array JSONB;
            correct_text TEXT;
            found_index INTEGER;
            migrated_count INTEGER := 0;
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_questions' AND column_name = 'correct_answer'
            ) THEN
                FOR q_record IN 
                    SELECT id, options, correct_answer 
                    FROM quiz_questions 
                    WHERE correct_answer_index IS NULL 
                    AND correct_answer IS NOT NULL
                LOOP
                    correct_text := q_record.correct_answer;
                    option_array := q_record.options;
                    
                    found_index := -1;
                    FOR i IN 0..3 LOOP
                        IF option_array->>i IS NOT NULL 
                        AND LOWER(TRIM(option_array->>i)) = LOWER(TRIM(correct_text)) 
                        THEN
                            found_index := i;
                            EXIT;
                        END IF;
                    END LOOP;
                    
                    IF found_index >= 0 THEN
                        UPDATE quiz_questions SET correct_answer_index = found_index WHERE id = q_record.id;
                    ELSE
                        UPDATE quiz_questions SET correct_answer_index = 0 WHERE id = q_record.id;
                    END IF;
                    migrated_count := migrated_count + 1;
                END LOOP;
                RAISE NOTICE 'Migrated % questions', migrated_count;
            END IF;
        END $$;
    """)
    print("  ✓ Data migration completed")
    
    # 1.4: Set default for NULL values
    cursor.execute("""
        UPDATE quiz_questions 
        SET correct_answer_index = 0 
        WHERE correct_answer_index IS NULL;
    """)
    print("  ✓ Set defaults for NULL values")
    
    # 1.5: Make correct_answer_index NOT NULL
    cursor.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_questions' 
                AND column_name = 'correct_answer_index' 
                AND is_nullable = 'YES'
            ) THEN
                ALTER TABLE quiz_questions ALTER COLUMN correct_answer_index SET NOT NULL;
                RAISE NOTICE 'Made correct_answer_index NOT NULL';
            END IF;
        END $$;
    """)
    print("  ✓ correct_answer_index constraint updated")
    
    # 1.6: Remove old columns
    cursor.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_questions' AND column_name = 'question_type'
            ) THEN
                ALTER TABLE quiz_questions DROP COLUMN question_type;
                RAISE NOTICE 'Dropped question_type column';
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_questions' AND column_name = 'correct_answer'
            ) THEN
                ALTER TABLE quiz_questions DROP COLUMN correct_answer;
                RAISE NOTICE 'Dropped correct_answer column';
            END IF;
        END $$;
    """)
    print("  ✓ Old columns removed")
    
    # 1.7: Add constraints
    cursor.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'quiz_questions' 
                AND constraint_name = 'check_correct_answer_index'
            ) THEN
                ALTER TABLE quiz_questions 
                ADD CONSTRAINT check_correct_answer_index 
                CHECK (correct_answer_index >= 0 AND correct_answer_index <= 3);
            END IF;
            
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'quiz_questions' 
                AND constraint_name = 'check_options_length'
            ) THEN
                ALTER TABLE quiz_questions 
                ADD CONSTRAINT check_options_length 
                CHECK (jsonb_array_length(options) = 4);
            END IF;
        END $$;
    """)
    print("  ✓ Constraints added")
    print()
    
    # ============================================
    # STEP 2: Update quiz_attempts table
    # ============================================
    print("Step 2: Updating quiz_attempts table...")
    
    # 2.1: Fix score column to be nullable (should be NULL until quiz is submitted)
    cursor.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_attempts' 
                AND column_name = 'score' 
                AND is_nullable = 'NO'
            ) THEN
                -- First, set NULL for any attempts that haven't been completed
                UPDATE quiz_attempts 
                SET score = NULL 
                WHERE completed_at IS NULL;
                
                -- Then make it nullable
                ALTER TABLE quiz_attempts 
                ALTER COLUMN score DROP NOT NULL;
                
                RAISE NOTICE 'Made score column nullable';
            ELSE
                RAISE NOTICE 'score column is already nullable';
            END IF;
        END $$;
    """)
    print("  ✓ score column updated (made nullable)")
    
    # 2.2: Fix time_spent_seconds to be nullable
    cursor.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_attempts' 
                AND column_name = 'time_spent_seconds' 
                AND is_nullable = 'NO'
            ) THEN
                ALTER TABLE quiz_attempts 
                ALTER COLUMN time_spent_seconds DROP NOT NULL;
                
                RAISE NOTICE 'Made time_spent_seconds column nullable';
            END IF;
        END $$;
    """)
    print("  ✓ time_spent_seconds column updated")
    
    # 2.3: Fix answers to be nullable
    cursor.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_attempts' 
                AND column_name = 'answers' 
                AND is_nullable = 'NO'
            ) THEN
                ALTER TABLE quiz_attempts 
                ALTER COLUMN answers DROP NOT NULL;
                
                RAISE NOTICE 'Made answers column nullable';
            END IF;
        END $$;
    """)
    print("  ✓ answers column updated")
    
    # 2.4: Fix completed_at to be nullable
    cursor.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_attempts' 
                AND column_name = 'completed_at' 
                AND is_nullable = 'NO'
            ) THEN
                ALTER TABLE quiz_attempts 
                ALTER COLUMN completed_at DROP NOT NULL;
                
                RAISE NOTICE 'Made completed_at column nullable';
            ELSE
                RAISE NOTICE 'completed_at column is already nullable';
            END IF;
        END $$;
    """)
    print("  ✓ completed_at column updated")
    
    # 2.5: Add created_at column if it doesn't exist
    cursor.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'quiz_attempts' AND column_name = 'created_at'
            ) THEN
                ALTER TABLE quiz_attempts 
                ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
                
                UPDATE quiz_attempts 
                SET created_at = COALESCE(completed_at, CURRENT_TIMESTAMP) 
                WHERE created_at IS NULL;
                
                ALTER TABLE quiz_attempts 
                ALTER COLUMN created_at SET NOT NULL;
                
                CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at 
                ON quiz_attempts(created_at);
                
                RAISE NOTICE 'Added created_at column to quiz_attempts';
            ELSE
                RAISE NOTICE 'created_at column already exists';
            END IF;
        END $$;
    """)
    print("  ✓ created_at column updated")
    print()
    
    # ============================================
    # STEP 3: Update notes table
    # ============================================
    print("Step 3: Updating notes table...")
    
    # 3.1: Add is_quick_note if it doesn't exist
    cursor.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'notes' AND column_name = 'is_quick_note'
            ) THEN
                ALTER TABLE notes ADD COLUMN is_quick_note BOOLEAN DEFAULT FALSE;
                RAISE NOTICE 'Added is_quick_note column';
            END IF;
        END $$;
    """)
    print("  ✓ is_quick_note column checked")
    
    # 3.2: Add source_context if it doesn't exist
    cursor.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'notes' AND column_name = 'source_context'
            ) THEN
                ALTER TABLE notes ADD COLUMN source_context TEXT;
                RAISE NOTICE 'Added source_context column';
            END IF;
        END $$;
    """)
    print("  ✓ source_context column checked")
    
    # 3.3: Add theme if it doesn't exist
    cursor.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'notes' AND column_name = 'theme'
            ) THEN
                ALTER TABLE notes ADD COLUMN theme VARCHAR(50) DEFAULT 'standard';
                RAISE NOTICE 'Added theme column';
            END IF;
        END $$;
    """)
    print("  ✓ theme column checked")
    print()
    
    # ============================================
    # STEP 4: Update note_categories table
    # ============================================
    print("Step 4: Checking note_categories table...")
    
    # Check if table exists
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'note_categories'
        );
    """)
    note_categories_exists = cursor.fetchone()[0]
    
    if not note_categories_exists:
        print("  ⚠ note_categories table does not exist")
        print("  (This table is separate from categories and may need manual creation)")
    else:
        print("  ✓ note_categories table exists")
    print()
    
    # ============================================
    # STEP 5: Update tasks table
    # ============================================
    print("Step 5: Updating tasks table...")
    
    # 5.1: Add start_date if it doesn't exist
    cursor.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tasks' AND column_name = 'start_date'
            ) THEN
                ALTER TABLE tasks ADD COLUMN start_date DATE;
                RAISE NOTICE 'Added start_date column';
            END IF;
        END $$;
    """)
    print("  ✓ start_date column checked")
    
    # 5.2: Update priority default if needed
    cursor.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tasks' 
                AND column_name = 'priority' 
                AND column_default IS NULL
            ) THEN
                ALTER TABLE tasks 
                ALTER COLUMN priority SET DEFAULT 'medium';
                RAISE NOTICE 'Set priority default to medium';
            END IF;
        END $$;
    """)
    print("  ✓ priority default checked")
    print()
    
    # ============================================
    # STEP 6: Add missing indexes
    # ============================================
    print("Step 6: Adding missing indexes...")
    
    indexes = [
        ("idx_quiz_attempts_user_id", "quiz_attempts", "user_id"),
        ("idx_quiz_attempts_created_at", "quiz_attempts", "created_at"),
        ("idx_note_categories_user_id", "note_categories", "user_id"),
    ]
    
    for index_name, table_name, column_name in indexes:
        cursor.execute(f"""
            SELECT EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE indexname = '{index_name}'
            );
        """)
        if not cursor.fetchone()[0]:
            try:
                cursor.execute(f"""
                    CREATE INDEX {index_name} ON {table_name}({column_name});
                """)
                print(f"  ✓ Created index {index_name}")
            except Exception as e:
                print(f"  ⚠ Could not create {index_name}: {e}")
        else:
            print(f"  ✓ Index {index_name} already exists")
    print()
    
    # ============================================
    # STEP 7: Verify final schema
    # ============================================
    print("Step 7: Verifying final schema...")
    
    tables_to_check = [
        'quiz_questions',
        'quiz_attempts',
        'notes',
        'tasks'
    ]
    
    for table_name in tables_to_check:
        cursor.execute(f"""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = '{table_name}'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()
        print(f"\n{table_name}:")
        for col in columns:
            nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
            print(f"  - {col[0]} ({col[1]}, {nullable})")
    print()


def main():
    if DATABASE_URL == "PASTE_YOUR_RAILWAY_DATABASE_URL_HERE":
        print("=" * 60)
        print("ERROR: Please paste your Railway DATABASE_URL into the script")
        print("=" * 60)
        print()
        print("1. Open this file: backend/migrations/sync_railway_schema.py")
        print("2. Find the line: DATABASE_URL = 'PASTE_YOUR_RAILWAY_DATABASE_URL_HERE'")
        print("3. Replace it with your Railway DATABASE_URL")
        print("4. Run this script again")
        print()
        return
    
    print("=" * 60)
    print("Railway Database Schema Sync")
    print("Syncing Railway database with local schema...")
    print("=" * 60)
    print()
    
    try:
        print("Connecting to Railway database...")
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("✓ Connected successfully")
        print()
        
        # Run all migrations
        run_migration(cursor)
        
        print("=" * 60)
        print("✓ Schema sync completed successfully!")
        print("=" * 60)
        print()
        print("Your Railway database should now match the local schema.")
        print("You can test by running your application.")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print()
        print("=" * 60)
        print("✗ Migration failed!")
        print("=" * 60)
        print(f"Error: {e}")
        print()
        return
    except Exception as e:
        print()
        print("=" * 60)
        print("✗ Unexpected error!")
        print("=" * 60)
        print(f"Error: {e}")
        print()
        import traceback
        traceback.print_exc()
        return


if __name__ == "__main__":
    main()

