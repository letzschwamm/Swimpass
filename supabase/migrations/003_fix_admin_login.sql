-- ═══════════════════════════════════════════════
-- Fix 1: RLS-Rekursion beheben (SECURITY DEFINER)
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION my_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- ═══════════════════════════════════════════════
-- Fix 2: Profil für admin@swimpass.lu anlegen
-- ═══════════════════════════════════════════════
INSERT INTO profiles (id, email, name, role, school_id, avatar)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  'admin',
  '00000000-0000-0000-0000-000000000001',
  '🏊'
FROM auth.users au
WHERE au.email = 'admin@swimpass.lu'
ON CONFLICT (id) DO UPDATE SET
  role      = 'admin',
  school_id = '00000000-0000-0000-0000-000000000001';
