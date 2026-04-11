-- ═══════════════════════════════════════════════
-- 014 — Add missing DELETE RLS policies
-- ═══════════════════════════════════════════════

-- Children: no DELETE policy existed — admins/teachers couldn't delete rows
CREATE POLICY "child_delete_admin_teacher" ON children FOR DELETE
  USING (school_id = my_school_id() AND my_role() IN ('admin', 'teacher'));

-- Notes: notes_write was INSERT-only — deletes were blocked
CREATE POLICY "notes_delete_admin_teacher" ON notes FOR DELETE
  USING (my_role() IN ('admin', 'teacher') AND
         EXISTS (SELECT 1 FROM children WHERE children.id = notes.child_id AND children.school_id = my_school_id()));
