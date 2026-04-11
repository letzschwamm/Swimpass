-- ═══════════════════════════════════════════════
-- 011 — Instructor Invite System + Participant Portal
-- ═══════════════════════════════════════════════

-- Subscription status on profiles (for instructor payment tracking)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'
  CHECK (subscription_status IN ('active', 'pending', 'inactive'));

-- Instructor invite codes (admin generates, instructor uses to register)
CREATE TABLE IF NOT EXISTS instructor_invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id  UUID REFERENCES schools(id) ON DELETE CASCADE,
  code       TEXT UNIQUE NOT NULL,
  note       TEXT,
  used       BOOLEAN DEFAULT false,
  used_by    UUID REFERENCES profiles(id),
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE instructor_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invite_admin_manage" ON instructor_invites FOR ALL
  USING (school_id = my_school_id() AND my_role() = 'admin');

-- Public read for code validation (anon during registration)
CREATE POLICY "invite_anon_read" ON instructor_invites FOR SELECT
  USING (true);

-- Participant access token for self-service status page
ALTER TABLE sauvetage_participants
  ADD COLUMN IF NOT EXISTS access_token UUID DEFAULT gen_random_uuid();

-- Lookup participant by access token (SECURITY DEFINER for anon access)
CREATE OR REPLACE FUNCTION get_participant_by_token(p_token UUID)
RETURNS TABLE (
  id UUID, course_id UUID, first_name TEXT, last_name TEXT,
  birth_date DATE, email TEXT, status TEXT, payment_status TEXT,
  course_name TEXT, course_level TEXT, exam_date DATE, location TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.id, p.course_id, p.first_name, p.last_name,
    p.birth_date, p.email, p.status, p.payment_status,
    c.name, c.level, c.exam_date, c.location
  FROM sauvetage_participants p
  JOIN sauvetage_courses c ON c.id = p.course_id
  WHERE p.access_token = p_token;
$$;
