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
    const { userId } = await req.json()
    if (!userId) return json({ error: 'userId required' })

    // Caller's JWT (sent automatically by supabase.functions.invoke)
    const authHeader = req.headers.get('Authorization') ?? ''
    const callerJwt  = authHeader.replace(/^Bearer\s+/i, '')

    const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const SUPABASE_ANON_KEY         = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verify caller identity using anon client + their JWT
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${callerJwt}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: { user: caller }, error: authErr } = await anonClient.auth.getUser()
    if (authErr || !caller) return json({ error: 'Unauthorized' })

    // Check caller is admin in the same school as the target
    const { data: callerProfile } = await anonClient.from('profiles').select('role, school_id').eq('id', caller.id).single()
    if (callerProfile?.role !== 'admin') return json({ error: 'Forbidden: only admins can delete users' })

    // Service role client for destructive operations
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Verify target user is in the same school
    const { data: targetProfile } = await adminClient.from('profiles').select('role, school_id').eq('id', userId).single()
    if (!targetProfile) return json({ error: 'User not found' })
    if (targetProfile.school_id !== callerProfile.school_id) return json({ error: 'Forbidden: different school' })
    if (targetProfile.role === 'admin') return json({ error: 'Cannot delete admin accounts' })

    // Clear FK references in instructor_invites if applicable
    if (targetProfile.role === 'instructor') {
      await adminClient.from('instructor_invites').update({ used: false, used_by: null, used_at: null }).eq('used_by', userId)
    }

    // Delete profile first (FK), then auth user
    await adminClient.from('profiles').delete().eq('id', userId)
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteErr) return json({ error: `Delete failed: ${deleteErr.message}` })

    return json({ success: true })
  } catch (err) {
    return json({ error: err?.message ?? String(err) })
  }
})
