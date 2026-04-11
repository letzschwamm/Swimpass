-- ═══════════════════════════════════════════════
-- SwimPass — Initial Database Schema
-- ═══════════════════════════════════════════════

-- Schools
CREATE TABLE schools (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT UNIQUE NOT NULL,  -- e.g. LETZSCHWAMM000001
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  subscription_status     TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend auth.users with profile data
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id  UUID REFERENCES schools(id),
  role       TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
  name       TEXT,
  email      TEXT,
  avatar     TEXT DEFAULT '🏊',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id  UUID REFERENCES profiles(id),
  name        TEXT NOT NULL,
  day         TEXT NOT NULL,  -- 'Monday', 'Wednesday', etc.
  time        TEXT NOT NULL,  -- '17:00'
  level       TEXT NOT NULL CHECK (level IN ('junior', 'lifesaver')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Children
CREATE TABLE children (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES classes(id),
  parent_id   UUID REFERENCES profiles(id),
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  birth_date  DATE,
  level       TEXT NOT NULL CHECK (level IN ('junior', 'lifesaver')),
  avatar      TEXT DEFAULT '👦',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Progress: which criteria a child has passed
CREATE TABLE progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID REFERENCES children(id) ON DELETE CASCADE,
  criteria_key  TEXT NOT NULL,  -- e.g. 'jl_swim_1'
  teacher_id    UUID REFERENCES profiles(id),
  passed_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (child_id, criteria_key)
);

-- Notes from teachers to parents
CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID REFERENCES children(id) ON DELETE CASCADE,
  teacher_id  UUID REFERENCES profiles(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed (dashboard)
CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  type        TEXT DEFAULT 'blue',  -- 'blue', 'gold', 'green'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id                 UUID REFERENCES children(id),
  parent_id                UUID REFERENCES profiles(id),
  school_id                UUID REFERENCES schools(id),
  stripe_session_id        TEXT,
  stripe_payment_intent_id TEXT,
  amount                   INTEGER DEFAULT 3500,  -- in cents (35.00 EUR)
  status                   TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at               TIMESTAMPTZ DEFAULT NOW()
);


-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════

ALTER TABLE schools    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE children   ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments   ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's school_id
-- SECURITY DEFINER bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION my_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid()
$$;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Schools: readable by members
CREATE POLICY "school_read" ON schools FOR SELECT
  USING (id = my_school_id());

-- Profiles: own row always readable; admins see school members
CREATE POLICY "profile_read_own" ON profiles FOR SELECT
  USING (id = auth.uid() OR school_id = my_school_id());

CREATE POLICY "profile_insert_own" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profile_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Classes: school members read; admin/teacher write
CREATE POLICY "class_read" ON classes FOR SELECT
  USING (school_id = my_school_id());

CREATE POLICY "class_write" ON classes FOR ALL
  USING (school_id = my_school_id() AND my_role() IN ('admin', 'teacher'));

-- Children: school members read; admin/teacher write; parents see own
CREATE POLICY "child_read_school" ON children FOR SELECT
  USING (school_id = my_school_id() OR parent_id = auth.uid());

CREATE POLICY "child_write_admin_teacher" ON children FOR INSERT
  WITH CHECK (school_id = my_school_id() AND my_role() IN ('admin', 'teacher'));

CREATE POLICY "child_update_admin_teacher" ON children FOR UPDATE
  USING (school_id = my_school_id() AND my_role() IN ('admin', 'teacher'));

CREATE POLICY "child_insert_parent" ON children FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- Progress: school members read; teachers write
CREATE POLICY "progress_read" ON progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM children WHERE children.id = progress.child_id AND (children.school_id = my_school_id() OR children.parent_id = auth.uid())));

CREATE POLICY "progress_write" ON progress FOR ALL
  USING (my_role() IN ('admin', 'teacher'));

-- Notes: teachers write, parents read their child's notes
CREATE POLICY "notes_read" ON notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM children WHERE children.id = notes.child_id AND (children.school_id = my_school_id() OR children.parent_id = auth.uid())));

CREATE POLICY "notes_write" ON notes FOR INSERT
  WITH CHECK (my_role() IN ('admin', 'teacher') AND teacher_id = auth.uid());

-- Activities: school members read; admin/teacher write
CREATE POLICY "activity_read" ON activities FOR SELECT
  USING (school_id = my_school_id());

CREATE POLICY "activity_write" ON activities FOR INSERT
  WITH CHECK (school_id = my_school_id() AND my_role() IN ('admin', 'teacher'));

-- Payments: own data only
CREATE POLICY "payment_read" ON payments FOR SELECT
  USING (parent_id = auth.uid() OR school_id = my_school_id() AND my_role() = 'admin');


-- ═══════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════

-- Auto-create profile from user metadata after sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role, school_id, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    (NEW.raw_user_meta_data->>'school_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'avatar', '🏊')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ═══════════════════════════════════════════════
-- SEED DATA — Demo school
-- ═══════════════════════════════════════════════

INSERT INTO schools (id, name, code) VALUES
  ('00000000-0000-0000-0000-000000000001', 'FLNS Schwimmschule Luxemburg', 'LETZSCHWAMM000001');

-- Note: Seed admin/teacher users via Supabase Dashboard or CLI:
--   supabase auth admin create-user --email admin@swimpass.lu --password ...
-- Then update their profile manually:
--   UPDATE profiles SET role='admin', school_id='00000000-...' WHERE email='admin@swimpass.lu';
