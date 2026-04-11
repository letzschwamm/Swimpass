-- ═══════════════════════════════════════════════
-- Schritt 1: User-Status prüfen
-- ═══════════════════════════════════════════════
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'admin@swimpass.lu';

-- ═══════════════════════════════════════════════
-- Schritt 2: Passwort setzen + E-Mail bestätigen
-- ═══════════════════════════════════════════════
UPDATE auth.users
SET
  encrypted_password  = crypt('Admin1234', gen_salt('bf')),
  email_confirmed_at  = COALESCE(email_confirmed_at, now()),
  updated_at          = now()
WHERE email = 'admin@swimpass.lu';

-- ═══════════════════════════════════════════════
-- Schritt 3: Profil sicherstellen
-- ═══════════════════════════════════════════════
INSERT INTO profiles (id, email, name, role, school_id, avatar)
SELECT
  au.id,
  au.email,
  'Andy',
  'admin',
  '00000000-0000-0000-0000-000000000001',
  '🏊'
FROM auth.users au
WHERE au.email = 'admin@swimpass.lu'
ON CONFLICT (id) DO UPDATE SET
  role      = 'admin',
  school_id = '00000000-0000-0000-0000-000000000001',
  name      = COALESCE(profiles.name, 'Andy');

-- ═══════════════════════════════════════════════
-- Schritt 4: Ergebnis prüfen
-- ═══════════════════════════════════════════════
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  p.role,
  p.name,
  p.school_id
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@swimpass.lu';
