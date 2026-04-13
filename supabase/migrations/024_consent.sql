-- ── Migration 024: GDPR consent timestamp ───────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_given TIMESTAMPTZ;

-- Index for quick consent checks
CREATE INDEX IF NOT EXISTS profiles_consent_given_idx ON profiles(consent_given);
