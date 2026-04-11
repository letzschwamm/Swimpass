-- Rename school from "FLNS Schwimmschule" to "Letzschwamm Schwimmschule"
UPDATE schools
SET name = 'Letzschwamm Schwimmschule'
WHERE name LIKE '%FLNS%';
