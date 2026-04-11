import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { childId, schoolId, teacherName, childName, progress, note } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch parent email from children → profiles
    const { data: child } = await supabase
      .from('children')
      .select('*, profiles!parent_id(email, name)')
      .eq('id', childId)
      .single()

    const parentEmail = child?.profiles?.email
    if (!parentEmail) throw new Error('Parent email not found')

    const progressColor = progress >= 80 ? '#22C55E' : progress >= 50 ? '#00B4D8' : '#F4A51A'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SwimPass <noreply@swimpass.lu>',
        to: parentEmail,
        subject: `📱 SwimPass — Nachricht über ${childName}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#001525;color:#E8F4FD;padding:32px;border-radius:16px;">
            <div style="font-size:32px;margin-bottom:16px;">🌊</div>
            <h1 style="font-size:20px;margin-bottom:4px;">Nachricht von Lehrer ${teacherName}</h1>
            <p style="color:#6EA8C8;font-size:13px;margin-bottom:24px;">Über ${childName}</p>

            <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(144,220,240,0.15);border-radius:12px;padding:16px;margin-bottom:20px;">
              <div style="font-size:12px;color:#6EA8C8;margin-bottom:6px;">Notiz vom Lehrer</div>
              <div style="font-size:14px;line-height:1.6;">${note}</div>
            </div>

            <div style="background:rgba(0,180,216,0.08);border:1px solid rgba(0,180,216,0.2);border-radius:12px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:16px;">
              <div>
                <div style="font-size:11px;color:#6EA8C8;margin-bottom:2px;">Gesamtfortschritt</div>
                <div style="font-size:36px;font-weight:800;color:${progressColor};">${progress}%</div>
              </div>
              <div style="flex:1;height:8px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden;">
                <div style="width:${progress}%;height:100%;background:linear-gradient(90deg,#00B4D8,#48CAE4);border-radius:99px;"></div>
              </div>
            </div>

            <p style="font-size:12px;color:#6EA8C8;line-height:1.5;">
              Sie können den vollständigen Schwimmpass Ihres Kindes jederzeit in der SwimPass-App einsehen.
            </p>

            <hr style="border:none;border-top:1px solid rgba(144,220,240,0.15);margin:20px 0;">
            <p style="font-size:11px;color:#6EA8C8;">Letzschwamm Schwimmschule Luxemburg</p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Resend error: ${err}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
