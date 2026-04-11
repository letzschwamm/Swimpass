-- Fix classes.level CHECK constraint to allow all swimming levels
-- (was restricted to junior/lifesaver only, but classes cover all levels)

ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_level_check;

ALTER TABLE classes
  ADD CONSTRAINT classes_level_check
  CHECK (level IN ('bobby','seepferdchen','trixi','bronze','silber','gold','junior','lifesaver'));
