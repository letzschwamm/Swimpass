-- ═══════════════════════════════════════════════
-- Migration 006: Fix onboarding
-- 1. Secure code lookup function (bypasses RLS for anon)
-- 2. Seed FLNS school + sample class
-- 3. access_code column on children
-- ═══════════════════════════════════════════════

-- ── 1. SECURE CODE LOOKUP ──────────────────────
-- SECURITY DEFINER = bypasses RLS, so anon users can look up a school by code
-- Only returns school + classes — no sensitive data
CREATE OR REPLACE FUNCTION lookup_school_by_code(school_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id',      s.id,
    'name',    s.name,
    'code',    s.code,
    'classes', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id',       c.id,
          'name',     c.name,
          'day',      c.day,
          'time',     c.time,
          'level',    c.level,
          'profiles', json_build_object('name', COALESCE(p.name, '—'))
        )
        ORDER BY c.name
      )
      FROM classes c
      LEFT JOIN profiles p ON p.id = c.teacher_id
      WHERE c.school_id = s.id
    ), '[]'::json)
  )
  INTO result
  FROM schools s
  WHERE UPPER(TRIM(s.code)) = UPPER(TRIM(school_code));

  RETURN result;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION lookup_school_by_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION lookup_school_by_code(TEXT) TO authenticated;


-- ── 2. SEED FLNS SCHOOL ────────────────────────
INSERT INTO schools (id, name, code, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'FLNS Schwimmschule',
  'LETZSCHWAMM000001',
  'active'
)
ON CONFLICT (id) DO UPDATE
  SET name                = 'FLNS Schwimmschule',
      code                = 'LETZSCHWAMM000001',
      subscription_status = 'active';

-- Make sure code uniqueness is respected (update if different code existed)
UPDATE schools
SET code = 'LETZSCHWAMM000001'
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND code != 'LETZSCHWAMM000001';

-- Seed sample classes (linked to admin profile)
INSERT INTO classes (school_id, teacher_id, name, day, time, level)
SELECT
  '00000000-0000-0000-0000-000000000001',
  p.id,
  'Junior Lifesaver A',
  'Wednesday',
  '17:00',
  'junior'
FROM profiles p
WHERE p.email = 'admin@swimpass.lu'
ON CONFLICT DO NOTHING;

INSERT INTO classes (school_id, teacher_id, name, day, time, level)
SELECT
  '00000000-0000-0000-0000-000000000001',
  p.id,
  'Lifesaver Pro',
  'Friday',
  '16:00',
  'lifesaver'
FROM profiles p
WHERE p.email = 'admin@swimpass.lu'
ON CONFLICT DO NOTHING;

-- Link admin profile to FLNS school
UPDATE profiles
SET school_id = '00000000-0000-0000-0000-000000000001'
WHERE email = 'admin@swimpass.lu'
  AND (school_id IS NULL OR school_id != '00000000-0000-0000-0000-000000000001');


-- ── 3. ACCESS CODE COLUMN ──────────────────────
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS access_code TEXT UNIQUE;

-- ── 4. ALLOW PARENT CHILD INSERT (needed during onboarding) ──
-- Parents need to insert their own child record during onboarding
-- The existing policy "child_insert_parent" only allows parent_id = auth.uid()
-- which is correct — ensure it exists:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'children' AND policyname = 'child_insert_parent'
  ) THEN
    CREATE POLICY "child_insert_parent" ON children FOR INSERT
      WITH CHECK (parent_id = auth.uid());
  END IF;
END $$;
