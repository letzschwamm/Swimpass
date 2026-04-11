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
    // Verify caller is an admin using their JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Get caller's user from JWT
    const callerJwt = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: jwtError } = await supabase.auth.getUser(callerJwt)
    if (jwtError || !caller) return json({ error: 'Invalid token' })

    // Verify caller is admin
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.role !== 'admin') return json({ error: 'Forbidden: only admins can delete instructors' })

    const { userId } = await req.json()
    if (!userId) return json({ error: 'userId required' })

    // Verify target is an instructor in the same school
    const { data: target } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', userId)
      .single()

    if (!target) return json({ error: 'User not found' })
    if (target.role !== 'instructor') return json({ error: 'Can only delete instructors' })
    if (target.school_id !== callerProfile.school_id) return json({ error: 'Forbidden: different school' })

    // Clear FK references in instructor_invites
    await supabase
      .from('instructor_invites')
      .update({ used: false, used_by: null, used_at: null })
      .eq('used_by', userId)

    // Delete profile (cascade should handle most relations)
    await supabase.from('profiles').delete().eq('id', userId)

    // Delete auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteError) return json({ error: `Auth delete failed: ${deleteError.message}` })

    return json({ success: true })
  } catch (err) {
    return json({ error: err?.message ?? String(err) })
  }
})
