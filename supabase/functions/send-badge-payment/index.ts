import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/aFa9AT2gxeZUfOkbVF7kc01'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const { courseId } = await req.json()
    if (!courseId) return json({ error: 'courseId fehlt' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: course } = await supabase
      .from('sauvetage_courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (!course) return json({ error: 'Kurs nicht gefunden' }, 404)

    const { data: participants } = await supabase
      .from('sauvetage_participants')
      .select('*')
      .eq('course_id', courseId)
      .in('status', ['passed_junior', 'passed_lifesaver'])
      .eq('payment_status', 'pending')

    if (!participants?.length) return json({ error: 'Keine bestandenen Teilnehmer mit offener Zahlung' }, 400)

    const results: Array<{ name: string; email: string; sent: boolean; error?: string }> = []

    for (const p of participants) {
      if (!p.email) {
        results.push({ name: `${p.first_name} ${p.last_name}`, email: '—', sent: false, error: 'Keine E-Mail hinterlegt' })
        continue
      }

      const levelLabel = p.status === 'passed_lifesaver' ? 'Lifesaver' : 'Junior Lifesaver'

      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#001525;color:#E8F4FD;padding:32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:56px;margin-bottom:8px;">🏅</div>
            <h1 style="font-size:22px;margin:0 0 6px;">Herzlichen Glückwunsch!</h1>
            <p style="color:#6EA8C8;font-size:14px;margin:0;">
              ${p.first_name}, Sie haben das <strong style="color:#48CAE4;">${levelLabel}</strong> Abzeichen bestanden!
            </p>
          </div>

          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(144,220,240,0.2);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
            <div style="font-size:12px;color:#6EA8C8;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase;">Nächster Schritt</div>
            <div style="font-size:14px;line-height:1.6;margin-bottom:16px;">
              Um Ihr offizielles FLNS ${levelLabel} Abzeichen zu erhalten,<br>
              bitten wir Sie, die Abzeichen-Gebühr zu bezahlen.
            </div>
            <a href="${STRIPE_PAYMENT_LINK}" style="display:inline-block;background:linear-gradient(135deg,#0096C7,#48CAE4);color:white;text-align:center;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;">
              💳 Abzeichen-Gebühr bezahlen →
            </a>
          </div>

          <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:14px;font-size:12px;color:#6EA8C8;line-height:1.6;margin-bottom:20px;">
            <strong style="color:#22C55E;">✓ Sicher:</strong> Zahlung via Stripe · Alle Karten akzeptiert<br>
            <strong style="color:#22C55E;">✓ Weitergeleitet:</strong> Letzschwamm kümmert sich um die Weiterleitung an die FLNS<br>
            <strong style="color:#22C55E;">✓ Kurs:</strong> ${course.name}
          </div>

          <p style="font-size:11px;color:#6EA8C8;text-align:center;line-height:1.5;">
            Bei Fragen wenden Sie sich bitte an Letzschwamm.<br>
            Dieser Link ist für ${p.first_name} ${p.last_name} bestimmt.
          </p>

          <hr style="border:none;border-top:1px solid rgba(144,220,240,0.15);margin:20px 0;">
          <p style="font-size:11px;color:#6EA8C8;text-align:center;">
            Letzschwamm Schwimmschule Luxemburg · FLNS anerkannt
          </p>
        </div>
      `

      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Letzschwamm <sauvetage@letzschwamm.lu>',
            to: p.email,
            subject: `🏅 ${levelLabel} bestanden — Abzeichen-Gebühr bezahlen`,
            html: emailHtml,
          }),
        })

        if (!resendRes.ok) throw new Error(await resendRes.text())
        results.push({ name: `${p.first_name} ${p.last_name}`, email: p.email, sent: true })
      } catch (e) {
        results.push({ name: `${p.first_name} ${p.last_name}`, email: p.email, sent: false, error: e.message })
      }
    }

    return json({ success: true, results })
  } catch (err) {
    return json({ error: err?.message ?? String(err) }, 500)
  }
})
