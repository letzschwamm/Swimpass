import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Always return 200 so supabase.functions.invoke populates `data` (not `error`)
  const json = (body: unknown) =>
    new Response(JSON.stringify(body), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const { code, email, password, name, phone } = await req.json()

    const missing = ['code', 'email', 'password', 'name'].filter(k => !({ code, email, password, name } as Record<string, string>)[k])
    if (missing.length) return json({ error: `Fehlende Felder: ${missing.join(', ')}` })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const upperCode = code.toUpperCase().trim()

    // ── Test code path ─────────────────────────────────────────
    if (upperCode.startsWith('TEST-')) {
      const { data: testCode } = await supabase
        .from('test_codes').select('*').eq('code', upperCode).eq('active', true).maybeSingle()
      if (!testCode) return json({ error: 'Ungültiger Test-Code.' })

      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()
      if (existingProfile) return json({ error: 'Diese E-Mail ist bereits registriert.' })

      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { name, role: 'instructor', school_id: testCode.school_id },
      })
      if (createError) return json({ error: `Konto-Erstellung fehlgeschlagen: ${createError.message}` })

      const userId = createData.user!.id
      await supabase.from('profiles').upsert({
        id: userId, email, name, role: 'instructor',
        school_id: testCode.school_id,
        subscription_status: 'active',
        is_test: true,
        phone: phone || null,
      }, { onConflict: 'id' })

      return json({ success: true, userId })
    }

    // ── Normal invite code path ────────────────────────────────
    const { data: invite } = await supabase
      .from('instructor_invites')
      .select('*')
      .eq('code', upperCode)
      .eq('used', false)
      .maybeSingle()

    if (!invite) return json({ error: 'Ungültiger oder bereits verwendeter Einladungscode.' })

    // Check email not already registered
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      return json({ error: 'Diese E-Mail ist bereits registriert.' })
    }

    // Create auth user
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'instructor', school_id: invite.school_id },
    })

    if (createError) return json({ error: `Konto-Erstellung fehlgeschlagen: ${createError.message}` })

    const userId = createData.user!.id

    // Create profile (subscription_status = 'pending' until paid)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      name,
      role: 'instructor',
      school_id: invite.school_id,
      subscription_status: 'pending',
      phone: phone || null,
    }, { onConflict: 'id' })

    if (profileError) return json({ error: `Profil-Fehler: ${profileError.message}` })

    // Mark invite as used
    await supabase.from('instructor_invites').update({
      used: true,
      used_by: userId,
      used_at: new Date().toISOString(),
    }).eq('id', invite.id)

    return json({ success: true, userId })
  } catch (err) {
    return json({ error: err?.message ?? String(err) })
  }
})
