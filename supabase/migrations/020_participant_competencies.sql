-- ═══════════════════════════════════════════════
-- 020 — Participant competencies (FLNS criteria)
-- ═══════════════════════════════════════════════

ALTER TABLE sauvetage_participants
  ADD COLUMN IF NOT EXISTS competencies JSONB DEFAULT '{}';
