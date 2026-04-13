import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

function generateAccessCode(): string {
  const digits = Math.floor(100000 + Math.random() * 900000).toString()
  return `LETZSCHWAMM${digits}`
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('No signature', { status: 400 })

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const clientRef = session.client_reference_id || ''

    // ── Sauvetage badge payment (50€) ───────────────────────
    if (clientRef.startsWith('badge_')) {
      const participantId = clientRef.replace('badge_', '')
      await supabase
        .from('sauvetage_participants')
        .update({ badge_payment_status: 'paid' })
        .eq('id', participantId)
      return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
    }

    // ── Sauvetage participant registration fee (15€) ─────────
    if (clientRef.startsWith('participant_')) {
      const participantId = clientRef.replace('participant_', '')
      await supabase
        .from('sauvetage_participants')
        .update({ payment_status: 'paid' })
        .eq('id', participantId)
      return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
    }

    // ── Swim course parent registration fee (15€) ────────────
    if (clientRef.startsWith('swim_')) {
      const swimChildId = clientRef.replace('swim_', '')
      await supabase
        .from('children')
        .update({ swim_payment_status: 'paid' })
        .eq('id', swimChildId)
      return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
    }

    const { childId, parentId, schoolId } = session.metadata || {}

    // ── 1. Update payment status ──────────────────
    await supabase
      .from('payments')
      .update({
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('stripe_session_id', session.id)

    // ── 2. Generate unique access code ────────────
    let accessCode = generateAccessCode()

    // Ensure uniqueness (retry once on collision)
    const { data: existing } = await supabase
      .from('children')
      .select('id')
      .eq('access_code', accessCode)
      .maybeSingle()
    if (existing) accessCode = generateAccessCode()

    if (childId) {
      await supabase
        .from('children')
        .update({ access_code: accessCode })
        .eq('id', childId)
    }

    // ── 3. Fetch names for email + activity ───────
    const { data: child } = await supabase
      .from('children')
      .select('first_name, last_name, level')
      .eq('id', childId)
      .single()

    const { data: parent } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', parentId)
      .single()

    // ── 4. Activity log ───────────────────────────
    if (schoolId && child) {
      await supabase.from('activities').insert({
        school_id: schoolId,
        text: `Zahlung eingegangen für <b>${child.first_name} ${child.last_name}</b> ✅`,
        type: 'green',
      })
    }

    // ── 5. Confirmation email with access code ────
    if (parent?.email && child) {
      const levelLabel = child.level === 'lifesaver' ? 'Lifesaver' : 'Junior Lifesaver'

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SwimPass <noreply@swimpass.lu>',
          to: parent.email,
          subject: `🌊 SwimPass — Ihr Zugangscode für ${child.first_name}`,
          html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#020F1A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;background:linear-gradient(135deg,#0096C7,#48CAE4);border-radius:18px;font-size:32px;margin-bottom:16px;">🌊</div>
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#EEF4FD;letter-spacing:-0.5px;">SwimPass</h1>
      <p style="margin:6px 0 0;font-size:14px;color:#7BA8C4;">Digitaler Letzschwamm Schwimmpass</p>
    </div>

    <!-- Main card -->
    <div style="background:rgba(255,255,255,0.07);border:1px solid rgba(144,220,240,0.18);border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:14px;color:#7BA8C4;">Liebe Familie ${parent.name || ''},</p>
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#EEF4FD;">Zahlung bestätigt ✅</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#B0C8DC;line-height:1.6;">
        Ihre Anmeldung für <strong style="color:#48CAE4">${child.first_name} ${child.last_name}</strong>
        (${levelLabel}) wurde erfolgreich abgeschlossen.
      </p>

      <!-- Access code box -->
      <div style="background:linear-gradient(135deg,rgba(0,150,199,0.2),rgba(72,202,228,0.1));border:1.5px solid rgba(72,202,228,0.4);border-radius:16px;padding:24px;text-align:center;margin-bottom:8px;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#7BA8C4;">Ihr persönlicher Zugangscode</p>
        <div style="font-family:'Courier New',monospace;font-size:22px;font-weight:800;color:#48CAE4;letter-spacing:2px;word-break:break-all;">${accessCode}</div>
        <p style="margin:10px 0 0;font-size:11px;color:#7BA8C4;">Einmalig · Nur für ${child.first_name}</p>
      </div>
      <p style="margin:8px 0 0;font-size:11px;color:#7BA8C4;text-align:center;">
        Bewahren Sie diesen Code sicher auf. Er identifiziert die Anmeldung Ihres Kindes.
      </p>
    </div>

    <!-- What's next -->
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(144,220,240,0.12);border-radius:16px;padding:20px;margin-bottom:20px;">
      <h3 style="margin:0 0 14px;font-size:14px;font-weight:700;color:#EEF4FD;">Was passiert als nächstes?</h3>
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
        <div style="width:28px;height:28px;background:rgba(0,180,216,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">📱</div>
        <div>
          <p style="margin:0;font-size:13px;font-weight:600;color:#EEF4FD;">Benachrichtigungen nach jeder Stunde</p>
          <p style="margin:2px 0 0;font-size:12px;color:#7BA8C4;">Ihr Lehrer trägt den Fortschritt nach jeder Unterrichtsstunde ein.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
        <div style="width:28px;height:28px;background:rgba(0,180,216,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">📊</div>
        <div>
          <p style="margin:0;font-size:13px;font-weight:600;color:#EEF4FD;">Fortschritt in Echtzeit</p>
          <p style="margin:2px 0 0;font-size:12px;color:#7BA8C4;">Verfolgen Sie alle FLNS-Kriterien digital im SwimPass Portal.</p>
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div style="width:28px;height:28px;background:rgba(0,180,216,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">🏅</div>
        <div>
          <p style="margin:0;font-size:13px;font-weight:600;color:#EEF4FD;">Digitaler Schwimmpass</p>
          <p style="margin:2px 0 0;font-size:12px;color:#7BA8C4;">${levelLabel} — offiziell nach FLNS-Standard.</p>
        </div>
      </div>
    </div>

    <!-- Login -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://swimpass.lu" style="display:inline-block;background:linear-gradient(135deg,#0096C7,#00B4D8);color:#020F1A;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        Zum SwimPass Portal →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid rgba(144,220,240,0.12);padding-top:20px;">
      <p style="margin:0;font-size:11px;color:#506070;line-height:1.6;">
        Letzschwamm Schwimmschule Luxemburg<br>
        Bei Fragen: <a href="mailto:info@swimpass.lu" style="color:#7BA8C4;">info@swimpass.lu</a>
      </p>
    </div>

  </div>
</body>
</html>
          `,
        }),
      })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { childId } = pi.metadata || {}
    if (childId) {
      await supabase.from('payments').update({ status: 'failed' }).eq('stripe_payment_intent_id', pi.id)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
