-- Add type column to test_codes to distinguish parent/instructor/participant codes
ALTER TABLE test_codes ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'parent';

-- Update existing codes to have type 'parent' (they already default to it)
UPDATE test_codes SET type = 'parent' WHERE type IS NULL;
