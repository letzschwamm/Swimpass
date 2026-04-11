-- Add parent_code column to classes for parent onboarding
ALTER TABLE classes ADD COLUMN IF NOT EXISTS parent_code TEXT UNIQUE;

-- Update lookup_school_by_code to also support class lookup by parent_code
-- (parents can enter either school code or class parent_code during onboarding)
