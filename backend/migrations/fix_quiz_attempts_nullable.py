"""
Quick Fix: Make quiz_attempts columns nullable
Fixes the error: null value in column "score" violates not-null constraint
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# ============================================
# PASTE YOUR RAILWAY DATABASE_URL HERE
# ============================================
DATABASE_URL = 'postgresql://postgres:QXpQlAAnQUDdJPpAQFNJIVLSkNRiJySj@hopper.proxy.rlwy.net:53957/railway'
# ============================================

def main():
    if DATABASE_URL == "PASTE_YOUR_RAILWAY_DATABASE_URL_HERE":
        print("=" * 60)
        print("ERROR: Please paste your Railway DATABASE_URL into the script")
        print("=" * 60)
        return
    
    print("=" * 60)
    print("Quick Fix: Make quiz_attempts columns nullable")
    print("=" * 60)
    print()
    
    try:
        print("Connecting to Railway database...")
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("✓ Connected successfully")
        print()
        
        # Fix score column
        print("Step 1: Fixing score column...")
        cursor.execute("""
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'quiz_attempts' 
                    AND column_name = 'score' 
                    AND is_nullable = 'NO'
                ) THEN
                    -- Set NULL for incomplete attempts
                    UPDATE quiz_attempts 
                    SET score = NULL 
                    WHERE completed_at IS NULL;
                    
                    -- Make it nullable
                    ALTER TABLE quiz_attempts 
                    ALTER COLUMN score DROP NOT NULL;
                    
                    RAISE NOTICE 'Made score column nullable';
                ELSE
                    RAISE NOTICE 'score column is already nullable';
                END IF;
            END $$;
        """)
        print("  ✓ score column fixed")
        
        # Fix time_spent_seconds
        print("Step 2: Fixing time_spent_seconds column...")
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
        print("  ✓ time_spent_seconds column fixed")
        
        # Fix answers
        print("Step 3: Fixing answers column...")
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
        print("  ✓ answers column fixed")
        
        # Fix completed_at
        print("Step 4: Fixing completed_at column...")
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
        print("  ✓ completed_at column fixed")
        print()
        
        # Verify
        print("Step 5: Verifying schema...")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'quiz_attempts'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        print("quiz_attempts columns:")
        for col in columns:
            nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
            print(f"  - {col[0]} ({col[1]}, {nullable})")
        print()
        
        print("=" * 60)
        print("✓ Fix completed successfully!")
        print("=" * 60)
        print()
        print("The score, time_spent_seconds, answers, and completed_at columns")
        print("are now nullable as they should be.")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print()
        print("=" * 60)
        print("✗ Fix failed!")
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
        return


if __name__ == "__main__":
    main()

