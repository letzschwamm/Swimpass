import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown) =>
    new Response(JSON.stringify(body), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const { code, email, password, name } = await req.json()

    const missing = ['code', 'email', 'password', 'name'].filter(k => !({ code, email, password, name } as Record<string, string>)[k])
    if (missing.length) return json({ error: `Fehlende Felder: ${missing.join(', ')}` })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const upperCode = code.toUpperCase().trim()

    // Only TEST codes are valid for participant onboarding (no real payment flow yet)
    if (!upperCode.startsWith('TEST-')) {
      return json({ error: 'Ungültiger Code. Bitte verwende deinen Test-Code.' })
    }

    const { data: testCode } = await supabase
      .from('test_codes')
      .select('*')
      .eq('code', upperCode)
      .eq('type', 'participant')
      .eq('active', true)
      .maybeSingle()

    if (!testCode) return json({ error: 'Ungültiger oder falscher Test-Code (Kursteilnehmer).' })

    // Check email not already registered
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()
    if (existingProfile) return json({ error: 'Diese E-Mail ist bereits registriert.' })

    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name, role: 'participant', school_id: testCode.school_id },
    })
    if (createError) return json({ error: `Konto-Erstellung fehlgeschlagen: ${createError.message}` })

    const userId = createData.user!.id

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId, email, name, role: 'participant',
      school_id: testCode.school_id,
      subscription_status: 'active',
      is_test: true,
    }, { onConflict: 'id' })

    if (profileError) return json({ error: `Profil-Fehler: ${profileError.message}` })

    return json({ success: true, userId })
  } catch (err) {
    return json({ error: err?.message ?? String(err) })
  }
})
