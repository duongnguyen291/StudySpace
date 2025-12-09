-- ============================================
-- MIGRATION: Update quiz_questions table for multiple choice format
-- Run this if you have an existing database with the old schema
-- ============================================

-- Step 1: Add new columns (if they don't exist)
DO $$ 
BEGIN
    -- Add correct_answer_index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' AND column_name = 'correct_answer_index'
    ) THEN
        ALTER TABLE quiz_questions ADD COLUMN correct_answer_index INTEGER;
    END IF;
    
    -- Ensure options is NOT NULL (will fail if there are NULL values, so handle that first)
    -- First, set default empty array for any NULL options
    UPDATE quiz_questions SET options = '[]'::jsonb WHERE options IS NULL;
    
    -- Now make it NOT NULL
    ALTER TABLE quiz_questions ALTER COLUMN options SET NOT NULL;
END $$;

-- Step 2: Migrate existing data (if any)
-- This converts old correct_answer text to correct_answer_index
-- Note: This is a best-effort migration. You may need to manually review questions.
DO $$
DECLARE
    q_record RECORD;
    option_array JSONB;
    correct_text TEXT;
    found_index INTEGER;
BEGIN
    FOR q_record IN SELECT id, options, correct_answer FROM quiz_questions WHERE correct_answer_index IS NULL LOOP
        -- Try to find the correct answer in the options array
        correct_text := q_record.correct_answer;
        option_array := q_record.options;
        
        -- Search for the correct answer in options (case-insensitive)
        found_index := -1;
        FOR i IN 0..3 LOOP
            IF option_array->>i IS NOT NULL AND LOWER(TRIM(option_array->>i)) = LOWER(TRIM(correct_text)) THEN
                found_index := i;
                EXIT;
            END IF;
        END LOOP;
        
        -- If found, set the index; otherwise default to 0 (user should review)
        IF found_index >= 0 THEN
            UPDATE quiz_questions SET correct_answer_index = found_index WHERE id = q_record.id;
        ELSE
            -- Default to 0 if not found (user should manually review these)
            UPDATE quiz_questions SET correct_answer_index = 0 WHERE id = q_record.id;
        END IF;
    END LOOP;
END $$;

-- Step 3: Remove old columns (if they exist and migration is complete)
DO $$ 
BEGIN
    -- Remove question_type if it exists (no longer used)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' AND column_name = 'question_type'
    ) THEN
        ALTER TABLE quiz_questions DROP COLUMN question_type;
    END IF;
    
    -- Remove correct_answer if it exists (replaced by correct_answer_index)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' AND column_name = 'correct_answer'
    ) THEN
        ALTER TABLE quiz_questions DROP COLUMN correct_answer;
    END IF;
END $$;

-- Step 4: Add constraint to ensure correct_answer_index is valid (0-3)
ALTER TABLE quiz_questions 
ADD CONSTRAINT check_correct_answer_index 
CHECK (correct_answer_index >= 0 AND correct_answer_index <= 3);

-- Step 5: Add constraint to ensure options array has exactly 4 elements
-- Note: PostgreSQL doesn't have a direct array length constraint for JSONB,
-- but we can add a check that validates the array length
ALTER TABLE quiz_questions 
ADD CONSTRAINT check_options_length 
CHECK (jsonb_array_length(options) = 4);

COMMENT ON COLUMN quiz_questions.options IS 'JSONB array with exactly 4 answer options';
COMMENT ON COLUMN quiz_questions.correct_answer_index IS 'Index (0-3) of the correct answer in the options array';

