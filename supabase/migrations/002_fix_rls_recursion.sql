-- ═══════════════════════════════════════════════
-- Fix: RLS Recursion in Helper Functions
-- Führe dieses SQL im Supabase SQL Editor aus
-- ═══════════════════════════════════════════════

-- SECURITY DEFINER = Funktion läuft mit Rechten des Erstellers (bypassed RLS)
-- Das verhindert die Endlosschleife: profiles → my_school_id() → profiles → ...

CREATE OR REPLACE FUNCTION my_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;
