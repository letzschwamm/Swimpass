-- ═══════════════════════════════════════════════
-- 019 — Fix test_codes RLS: admin insert/update/delete
-- ═══════════════════════════════════════════════
-- Problem: school_id = my_school_id() is FALSE when my_school_id() returns NULL
-- (NULL comparisons always return NULL/unknown in SQL, blocking the INSERT)
-- Fix: drop school_id restriction on admin policies — my_role() = 'admin' is sufficient

DROP POLICY IF EXISTS "test_codes_admin_insert" ON test_codes;
DROP POLICY IF EXISTS "test_codes_admin_update" ON test_codes;
DROP POLICY IF EXISTS "test_codes_admin_delete" ON test_codes;

CREATE POLICY "test_codes_admin_insert" ON test_codes FOR INSERT
  WITH CHECK (my_role() = 'admin');

CREATE POLICY "test_codes_admin_update" ON test_codes FOR UPDATE
  USING (my_role() = 'admin');

CREATE POLICY "test_codes_admin_delete" ON test_codes FOR DELETE
  USING (my_role() = 'admin');
