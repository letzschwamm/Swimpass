-- ═══════════════════════════════════════════════
-- 013 — Add 'instructor' to profiles.role CHECK constraint
-- ═══════════════════════════════════════════════

-- The original CHECK only allowed admin/teacher/parent.
-- Instructor registration (register-instructor function) needs to insert role='instructor'.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'teacher', 'parent', 'instructor'));
