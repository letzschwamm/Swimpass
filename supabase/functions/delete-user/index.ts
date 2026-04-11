import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  try {
    // Parse body
    let userId: string | undefined
    try {
      const body = await req.json()
      userId = body?.userId
    } catch {
      return ok({ error: 'Invalid JSON body' })
    }

    if (!userId) return ok({ error: 'userId required' })

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return ok({ error: 'Missing environment variables' })
    }

    // Service role client — can verify any JWT and do admin operations
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Verify caller's JWT
    const authHeader = req.headers.get('Authorization') ?? ''
    const callerJwt = authHeader.replace(/^Bearer\s+/i, '')
    if (!callerJwt) return ok({ error: 'Unauthorized: no token' })

    const { data: { user: caller }, error: callerErr } = await admin.auth.getUser(callerJwt)
    if (callerErr || !caller) return ok({ error: 'Unauthorized: invalid token' })

    // Check caller is admin
    const { data: callerProfile, error: cpErr } = await admin
      .from('profiles')
      .select('role, school_id')
      .eq('id', caller.id)
      .single()

    if (cpErr || !callerProfile) return ok({ error: 'Unauthorized: profile not found' })
    if (callerProfile.role !== 'admin') return ok({ error: 'Forbidden: only admins' })

    // Fetch target profile
    const { data: targetProfile, error: tpErr } = await admin
      .from('profiles')
      .select('role, school_id')
      .eq('id', userId)
      .single()

    if (tpErr || !targetProfile) return ok({ error: 'Target user not found' })
    if (targetProfile.school_id !== callerProfile.school_id) return ok({ error: 'Forbidden: different school' })
    if (targetProfile.role === 'admin') return ok({ error: 'Cannot delete admin accounts' })

    // Release invite code if instructor
    if (targetProfile.role === 'instructor') {
      await admin
        .from('instructor_invites')
        .update({ used: false, used_by: null, used_at: null })
        .eq('used_by', userId)
    }

    // Delete profile row, then auth user
    await admin.from('profiles').delete().eq('id', userId)

    const { error: deleteErr } = await admin.auth.admin.deleteUser(userId)
    if (deleteErr) return ok({ error: `Auth delete failed: ${deleteErr.message}` })

    return ok({ success: true })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
