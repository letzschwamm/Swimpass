-- ═══════════════════════════════════════════════════════════
-- 021 — SAUV participant code + badge payment status
-- ═══════════════════════════════════════════════════════════

-- 1. Course: unique participant registration code
ALTER TABLE sauvetage_courses
  ADD COLUMN IF NOT EXISTS participant_code TEXT UNIQUE;

-- 2. Participants: badge payment status + user account link
ALTER TABLE sauvetage_participants
  ADD COLUMN IF NOT EXISTS badge_payment_status TEXT DEFAULT 'pending'
    CHECK (badge_payment_status IN ('pending', 'paid')),
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);

-- 3. Update get_participant_by_token to include badge_payment_status
DROP FUNCTION IF EXISTS get_participant_by_token(uuid);
CREATE FUNCTION get_participant_by_token(p_token UUID)
RETURNS TABLE (
  id UUID, course_id UUID, first_name TEXT, last_name TEXT,
  birth_date DATE, email TEXT, status TEXT, payment_status TEXT, badge_payment_status TEXT,
  course_name TEXT, course_level TEXT, exam_date DATE, location TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.id, p.course_id, p.first_name, p.last_name,
    p.birth_date, p.email, p.status, p.payment_status, p.badge_payment_status,
    c.name, c.level, c.exam_date, c.location
  FROM sauvetage_participants p
  JOIN sauvetage_courses c ON c.id = p.course_id
  WHERE p.access_token = p_token;
$$;

-- 4. Look up course by participant code (anon-safe via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION get_course_by_participant_code(p_code TEXT)
RETURNS TABLE (
  id UUID, name TEXT, level TEXT, exam_date DATE, location TEXT,
  instructor_firstname TEXT, instructor_name TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id, name, level, exam_date, location, instructor_firstname, instructor_name
  FROM sauvetage_courses
  WHERE participant_code = p_code;
$$;

-- 5. Get participant data for the currently logged-in user
CREATE OR REPLACE FUNCTION get_my_participant_data()
RETURNS TABLE (
  id UUID, course_id UUID, first_name TEXT, last_name TEXT,
  birth_date DATE, email TEXT, status TEXT, payment_status TEXT, badge_payment_status TEXT,
  course_name TEXT, course_level TEXT, exam_date DATE, location TEXT,
  instructor_firstname TEXT, instructor_name TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.id, p.course_id, p.first_name, p.last_name,
    p.birth_date, p.email, p.status, p.payment_status, p.badge_payment_status,
    c.name, c.level, c.exam_date, c.location, c.instructor_firstname, c.instructor_name
  FROM sauvetage_participants p
  JOIN sauvetage_courses c ON c.id = p.course_id
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$;
