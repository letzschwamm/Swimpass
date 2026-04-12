import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const { participantCode, firstName, lastName, email, password, birthDate } = await req.json()

    if (!participantCode || !firstName || !lastName || !email || !password) {
      return json({ error: 'Pflichtfelder fehlen (Code, Vorname, Nachname, E-Mail, Passwort)' })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Find course by participant_code
    const { data: course, error: courseErr } = await supabase
      .from('sauvetage_courses')
      .select('id, name, school_id')
      .eq('participant_code', participantCode)
      .single()

    if (courseErr || !course) {
      return json({ error: 'Ungültiger Kurs-Code. Bitte prüfe den Code.' })
    }

    // 2. Check if email already registered
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existingProfile) {
      return json({ error: 'Diese E-Mail ist bereits registriert. Bitte melde dich an.' })
    }

    // 3. Create auth user
    const { data: { user }, error: authErr } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
    })

    if (authErr || !user) {
      return json({ error: authErr?.message || 'Registrierung fehlgeschlagen' })
    }

    // 4. Create profile
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: user.id,
      email: email.toLowerCase().trim(),
      name: `${firstName} ${lastName}`,
      role: 'participant',
      school_id: course.school_id,
    })

    if (profileErr) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(user.id)
      return json({ error: 'Fehler beim Erstellen des Profils' })
    }

    // 5. Create participant record
    const { data: participant, error: pErr } = await supabase
      .from('sauvetage_participants')
      .insert({
        course_id: course.id,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate || null,
        email: email.toLowerCase().trim(),
        user_id: user.id,
      })
      .select('id')
      .single()

    if (pErr || !participant) {
      return json({ error: 'Fehler beim Anlegen des Teilnehmers' })
    }

    return json({ participantId: participant.id, courseId: course.id })
  } catch (err) {
    return json({ error: err?.message ?? String(err) })
  }
})
