-- ═══════════════════════════════════════════════
-- 010 — Sauvetage Kurs-Management
-- ═══════════════════════════════════════════════

-- Add instructor role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'teacher', 'parent', 'instructor'));

-- Sauvetage courses
CREATE TABLE IF NOT EXISTS sauvetage_courses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           UUID REFERENCES schools(id) ON DELETE CASCADE,
  instructor_id       UUID REFERENCES profiles(id),
  name                TEXT NOT NULL,
  level               TEXT NOT NULL DEFAULT 'junior' CHECK (level IN ('junior', 'lifesaver', 'both')),
  location            TEXT,
  exam_date           DATE,
  status              TEXT DEFAULT 'open' CHECK (status IN ('open', 'exam_done', 'completed')),
  -- Instructor info (stored directly for form pre-fill)
  instructor_name     TEXT,
  instructor_firstname TEXT,
  instructor_email    TEXT,
  instructor_phone    TEXT,
  instructor_address  TEXT,
  b1_sent_at          TIMESTAMPTZ,
  b2_sent_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Sauvetage participants
CREATE TABLE IF NOT EXISTS sauvetage_participants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID REFERENCES sauvetage_courses(id) ON DELETE CASCADE,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  birth_date     DATE,
  email          TEXT,
  address        TEXT,
  status         TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'passed_junior', 'passed_lifesaver', 'failed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE sauvetage_courses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sauvetage_participants ENABLE ROW LEVEL SECURITY;

-- Courses: all school members can read; admin + instructor (own) can write
CREATE POLICY "sauvetage_course_read" ON sauvetage_courses FOR SELECT
  USING (school_id = my_school_id());

CREATE POLICY "sauvetage_course_insert" ON sauvetage_courses FOR INSERT
  WITH CHECK (school_id = my_school_id() AND my_role() IN ('admin', 'instructor'));

CREATE POLICY "sauvetage_course_update" ON sauvetage_courses FOR UPDATE
  USING (school_id = my_school_id() AND (my_role() = 'admin' OR instructor_id = auth.uid()));

CREATE POLICY "sauvetage_course_delete" ON sauvetage_courses FOR DELETE
  USING (school_id = my_school_id() AND (my_role() = 'admin' OR instructor_id = auth.uid()));

-- Participants: accessible via school's courses
CREATE POLICY "sauvetage_participant_access" ON sauvetage_participants FOR ALL
  USING (
    course_id IN (
      SELECT id FROM sauvetage_courses WHERE school_id = my_school_id()
    )
  );
