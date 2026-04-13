-- ── Migration 023: Swim Courses ─────────────────────────────────────────────

-- Add instructor_type to profiles (sauvetage | swimming | both)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instructor_type TEXT NOT NULL DEFAULT 'sauvetage';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_instructor_type_check' AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_instructor_type_check
      CHECK (instructor_type IN ('sauvetage', 'swimming', 'both'));
  END IF;
END$$;

-- ── Swim courses table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS swim_courses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID       NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT       NOT NULL,
  level         TEXT       NOT NULL DEFAULT 'beginner',
  weekday       TEXT       NOT NULL DEFAULT '',
  time          TEXT       NOT NULL DEFAULT '',
  location      TEXT       NOT NULL DEFAULT '',
  swim_code     TEXT       NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Swim fields on children ──────────────────────────────────────────────────
ALTER TABLE children ADD COLUMN IF NOT EXISTS swim_course_id       UUID REFERENCES swim_courses(id) ON DELETE SET NULL;
ALTER TABLE children ADD COLUMN IF NOT EXISTS swim_payment_status  TEXT NOT NULL DEFAULT 'pending';

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS swim_courses_instructor_id_idx  ON swim_courses(instructor_id);
CREATE INDEX IF NOT EXISTS swim_courses_swim_code_idx      ON swim_courses(swim_code);
CREATE INDEX IF NOT EXISTS children_swim_course_id_idx     ON children(swim_course_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE swim_courses ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read (needed for code lookup during onboarding)
DROP POLICY IF EXISTS "swim_courses_select_all"    ON swim_courses;
CREATE POLICY "swim_courses_select_all"    ON swim_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "swim_courses_insert_own"    ON swim_courses;
CREATE POLICY "swim_courses_insert_own"    ON swim_courses FOR INSERT WITH CHECK (instructor_id = auth.uid());

DROP POLICY IF EXISTS "swim_courses_update_own"    ON swim_courses;
CREATE POLICY "swim_courses_update_own"    ON swim_courses FOR UPDATE USING (instructor_id = auth.uid());

DROP POLICY IF EXISTS "swim_courses_delete_own"    ON swim_courses;
CREATE POLICY "swim_courses_delete_own"    ON swim_courses FOR DELETE USING (instructor_id = auth.uid());

-- ── RPC: look up a course by its SWIM code (used during onboarding) ──────────
CREATE OR REPLACE FUNCTION get_course_by_swim_code(swim_code_input TEXT)
RETURNS TABLE (
  id              UUID,
  name            TEXT,
  level           TEXT,
  weekday         TEXT,
  "time"          TEXT,
  location        TEXT,
  instructor_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.level,
    c.weekday,
    c.time,
    c.location,
    COALESCE(p.name, split_part(p.email, '@', 1)) AS instructor_name
  FROM swim_courses c
  JOIN profiles p ON p.id = c.instructor_id
  WHERE c.swim_code = swim_code_input;
END;
$$;
