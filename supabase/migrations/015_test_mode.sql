-- ── Test mode: mark test users and children ──────────────────────────────────
ALTER TABLE profiles  ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;
ALTER TABLE children  ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;

-- ── Test codes table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   uuid REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  school_name text,
  code        text UNIQUE NOT NULL,
  created_by  uuid,
  created_at  timestamptz DEFAULT now(),
  active      boolean DEFAULT true
);

ALTER TABLE test_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can validate a test code (the code itself is the secret)
CREATE POLICY "test_codes_public_read"   ON test_codes FOR SELECT USING (active = true);
-- Admins can create / delete codes for their school
CREATE POLICY "test_codes_admin_insert"  ON test_codes FOR INSERT WITH CHECK (my_role() = 'admin' AND school_id = my_school_id());
CREATE POLICY "test_codes_admin_delete"  ON test_codes FOR DELETE USING   (my_role() = 'admin' AND school_id = my_school_id());
CREATE POLICY "test_codes_admin_update"  ON test_codes FOR UPDATE USING   (my_role() = 'admin' AND school_id = my_school_id());
