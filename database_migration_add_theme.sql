-- ============================================
-- MIGRATION: Add theme column to notes table
-- ============================================
-- This migration adds the theme column to the notes table
-- Run this if you have an existing database

ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'standard' NOT NULL;

-- Update existing notes to have default theme
UPDATE notes 
SET theme = 'standard' 
WHERE theme IS NULL;

-- Add comment
COMMENT ON COLUMN notes.theme IS 'Theme preset for note display (standard, cute_pink, elegant_beige, calm_blue, study_minimal)';

