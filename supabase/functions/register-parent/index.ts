import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    // ── Parse body ────────────────────────────────────────────
    let payload: Record<string, unknown>
    try {
      payload = await req.json()
    } catch {
      return json({ error: 'Ungültiges JSON im Request-Body.' }, 400)
    }

    const { email, password, schoolId, classId, firstName, lastName, birthDate, level, avatar, isTest } = payload as Record<string, string>

    // ── Validate required fields ──────────────────────────────
    const missing = ['email', 'password', 'schoolId', 'firstName', 'lastName'].filter(k => !payload[k])
    if (missing.length > 0) {
      return json({ error: `Fehlende Pflichtfelder: ${missing.join(', ')}` }, 400)
    }

    // ── Service-role client ───────────────────────────────────
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'Server-Konfigurationsfehler: Umgebungsvariablen fehlen.' }, 500)
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // ── 1. Check for existing email ───────────────────────────
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      return json({ error: 'EMAIL_EXISTS', message: 'Diese E-Mail ist bereits registriert. Bitte melden Sie sich an.' }, 409)
    }

    // ── 2. Create auth user ───────────────────────────────────
    let userId: string

    const { data: createData, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: `${firstName} ${lastName}`,
          role: 'parent',
          school_id: schoolId,
        },
      })

    if (createError) {
      return json({ error: `Konto-Erstellung fehlgeschlagen: ${createError.message}` }, 400)
    } else {
      userId = createData.user!.id
    }

    // ── 3. Upsert profile ─────────────────────────────────────
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email,
        name: `${firstName} ${lastName}`,
        role: 'parent',
        school_id: schoolId,
        avatar: '👨‍👩‍👧',
        is_test: isTest === 'true' || isTest === true,
      },
      { onConflict: 'id' }
    )
    if (profileError) {
      return json({ error: `Profil-Fehler: ${profileError.message}` }, 500)
    }

    // ── 4. Resolve class for test mode (seepferdchen) ────────────
    const isTestBool = isTest === 'true' || isTest === true
    let resolvedClassId = classId || null

    if (isTestBool) {
      // Find existing seepferdchen class in this school
      const { data: existingClass } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', schoolId)
        .eq('level', 'seepferdchen')
        .limit(1)
        .maybeSingle()

      if (existingClass) {
        resolvedClassId = existingClass.id
      } else {
        // Create a test class if none exists
        const { data: newClass } = await supabase
          .from('classes')
          .insert({
            school_id: schoolId,
            name: 'Test-Klasse Seepferdchen',
            level: 'seepferdchen',
            day: 'Saturday',
            time: '10:00',
          })
          .select('id')
          .single()
        if (newClass) resolvedClassId = newClass.id
      }
    }

    // ── 5. Insert child ───────────────────────────────────────
    const { data: child, error: childError } = await supabase
      .from('children')
      .insert({
        school_id:  schoolId,
        class_id:   resolvedClassId,
        parent_id:  userId,
        first_name: firstName,
        last_name:  lastName,
        birth_date: birthDate || null,
        level:      isTestBool ? 'seepferdchen' : (level || 'junior'),
        avatar:     avatar || '👦',
        is_test:    isTestBool,
      })
      .select()
      .single()

    if (childError) {
      return json({ error: `Kind-Fehler: ${childError.message}` }, 500)
    }

    return json({ userId, childId: child.id })

  } catch (err) {
    return json({ error: `Unbekannter Fehler: ${err?.message ?? String(err)}` }, 500)
  }
})
