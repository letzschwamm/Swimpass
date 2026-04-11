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
    const { code, email, password, name } = await req.json()

    const missing = ['code', 'email', 'password', 'name'].filter(k => !({ code, email, password, name } as Record<string, string>)[k])
    if (missing.length) return json({ error: `Fehlende Felder: ${missing.join(', ')}` }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Validate invite code
    const { data: invite } = await supabase
      .from('instructor_invites')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('used', false)
      .maybeSingle()

    if (!invite) return json({ error: 'Ungültiger oder bereits verwendeter Einladungscode.' }, 400)

    // Check email not already registered
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      return json({ error: 'EMAIL_EXISTS', message: 'Diese E-Mail ist bereits registriert.' }, 409)
    }

    // Create auth user
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'instructor', school_id: invite.school_id },
    })

    if (createError) return json({ error: `Konto-Erstellung fehlgeschlagen: ${createError.message}` }, 400)

    const userId = createData.user!.id

    // Create profile (subscription_status = 'pending' until paid)
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      name,
      role: 'instructor',
      school_id: invite.school_id,
      subscription_status: 'pending',
    }, { onConflict: 'id' })

    if (profileError) return json({ error: `Profil-Fehler: ${profileError.message}` }, 500)

    // Mark invite as used
    await supabase.from('instructor_invites').update({
      used: true,
      used_by: userId,
      used_at: new Date().toISOString(),
    }).eq('id', invite.id)

    return json({ success: true, userId })
  } catch (err) {
    return json({ error: err?.message ?? String(err) }, 500)
  }
})
