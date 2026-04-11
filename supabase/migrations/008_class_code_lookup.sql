-- Migration 008: Support class parent_code in lookup + new badge levels
-- 1. Update lookup_school_by_code to also match class parent_code
-- 2. Add new badge level check to children table

-- ── 1. UPDATED LOOKUP FUNCTION ──────────────────────────────────────────────
-- Checks school code first, then class parent_code as fallback.
-- Returns school info + the matched class (or all classes if school code used).
CREATE OR REPLACE FUNCTION lookup_school_by_code(school_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  cleaned TEXT;
BEGIN
  cleaned := UPPER(TRIM(school_code));

  -- ── Try school code first ──
  SELECT json_build_object(
    'id',      s.id,
    'name',    s.name,
    'code',    s.code,
    'matched', 'school',
    'classes', COALESCE((
      SELECT json_agg(
        json_build_object(
          'id',          c.id,
          'name',        c.name,
          'day',         c.day,
          'time',        c.time,
          'level',       c.level,
          'parent_code', c.parent_code,
          'profiles',    json_build_object('name', COALESCE(p.name, '—'))
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
  WHERE UPPER(TRIM(s.code)) = cleaned;

  IF result IS NOT NULL THEN
    RETURN result;
  END IF;

  -- ── Try class parent_code ──
  SELECT json_build_object(
    'id',      s.id,
    'name',    s.name,
    'code',    s.code,
    'matched', 'class',
    'classes', json_build_array(
      json_build_object(
        'id',          c.id,
        'name',        c.name,
        'day',         c.day,
        'time',        c.time,
        'level',       c.level,
        'parent_code', c.parent_code,
        'profiles',    json_build_object('name', COALESCE(p.name, '—'))
      )
    )
  )
  INTO result
  FROM classes c
  JOIN schools s ON s.id = c.school_id
  LEFT JOIN profiles p ON p.id = c.teacher_id
  WHERE UPPER(TRIM(c.parent_code)) = cleaned;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION lookup_school_by_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION lookup_school_by_code(TEXT) TO authenticated;


-- ── 2. EXTEND level CHECK CONSTRAINT ────────────────────────────────────────
-- Add new badge levels to the children.level column if a constraint exists.
DO $$
BEGIN
  -- Drop old constraint if it only allows junior/lifesaver
  ALTER TABLE children DROP CONSTRAINT IF EXISTS children_level_check;
  ALTER TABLE children DROP CONSTRAINT IF EXISTS chk_level;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE children
  ADD CONSTRAINT children_level_check
  CHECK (level IN ('bobby','seepferdchen','trixi','bronze','silber','gold','junior','lifesaver'));
