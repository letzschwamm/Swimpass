-- ═══════════════════════════════════════════════
-- 018 — Phone on profiles + venue_address on sauvetage_courses
-- ═══════════════════════════════════════════════

-- Instructor phone number stored in profile
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Full address of the swimming pool (venue) where the exam takes place
ALTER TABLE sauvetage_courses ADD COLUMN IF NOT EXISTS venue_address TEXT;
