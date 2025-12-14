"""
Migration Script: Add created_at column to quiz_attempts table
Run this on Railway database if quiz_attempts is missing created_at column
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
    print("Migration: Add created_at to quiz_attempts")
    print("=" * 60)
    print()
    
    try:
        print("Connecting to Railway database...")
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("✓ Connected successfully")
        print()
        
        # Check current schema
        print("Step 1: Checking current schema...")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'quiz_attempts'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        print("Current columns in quiz_attempts:")
        for col in columns:
            print(f"  - {col[0]} ({col[1]}, nullable: {col[2]})")
        print()
        
        has_created_at = any(col[0] == 'created_at' for col in columns)
        
        if has_created_at:
            print("✓ created_at column already exists")
            print()
        else:
            print("✗ created_at column does not exist - will be added")
            print()
            
            # Step 2: Add created_at column
            print("Step 2: Adding created_at column...")
            cursor.execute("""
                ALTER TABLE quiz_attempts 
                ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            """)
            print("✓ Column added")
            print()
            
            # Step 3: Set default value for existing rows
            print("Step 3: Setting default values for existing rows...")
            cursor.execute("""
                UPDATE quiz_attempts 
                SET created_at = COALESCE(completed_at, CURRENT_TIMESTAMP) 
                WHERE created_at IS NULL;
            """)
            updated = cursor.rowcount
            print(f"✓ Updated {updated} existing rows")
            print()
            
            # Step 4: Make it NOT NULL
            print("Step 4: Making created_at NOT NULL...")
            cursor.execute("""
                ALTER TABLE quiz_attempts 
                ALTER COLUMN created_at SET NOT NULL;
            """)
            print("✓ Column set to NOT NULL")
            print()
            
            # Step 5: Add index
            print("Step 5: Adding index...")
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at 
                ON quiz_attempts(created_at);
            """)
            print("✓ Index created")
            print()
        
        # Verify final schema
        print("Step 6: Verifying final schema...")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'quiz_attempts'
            ORDER BY ordinal_position;
        """)
        
        final_columns = cursor.fetchall()
        print("Final schema:")
        for col in final_columns:
            print(f"  ✓ {col[0]} ({col[1]}, nullable: {col[2]})")
        print()
        
        print("=" * 60)
        print("✓ Migration completed successfully!")
        print("=" * 60)
        
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
        return


if __name__ == "__main__":
    main()

