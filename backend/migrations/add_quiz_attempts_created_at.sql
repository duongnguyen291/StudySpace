-- ============================================
-- MIGRATION: Add created_at column to quiz_attempts
-- Run this if quiz_attempts table is missing created_at column
-- ============================================

-- Step 1: Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_attempts' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE quiz_attempts 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        
        -- Set default value for existing rows
        UPDATE quiz_attempts 
        SET created_at = COALESCE(completed_at, CURRENT_TIMESTAMP) 
        WHERE created_at IS NULL;
        
        -- Make it NOT NULL after setting defaults
        ALTER TABLE quiz_attempts 
        ALTER COLUMN created_at SET NOT NULL;
        
        -- Add index for better query performance
        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at);
        
        RAISE NOTICE 'Added created_at column to quiz_attempts';
    ELSE
        RAISE NOTICE 'created_at column already exists in quiz_attempts';
    END IF;
END $$;

COMMENT ON COLUMN quiz_attempts.created_at IS 'Timestamp when the quiz attempt was created';

