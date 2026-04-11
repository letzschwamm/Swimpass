-- ═══════════════════════════════════════════════
-- Migration 005: Adults support
-- Adds person_type and contact_email to children table
-- ═══════════════════════════════════════════════

-- Add person_type column (default 'child' — backwards compatible)
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS person_type TEXT NOT NULL DEFAULT 'child'
    CHECK (person_type IN ('child', 'adult'));

-- Add optional contact email for adults
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_children_person_type ON children(school_id, person_type);
