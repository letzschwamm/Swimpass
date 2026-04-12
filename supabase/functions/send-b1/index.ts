import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  try {
    const { courseId } = await req.json()
    if (!courseId) return json({ error: 'courseId fehlt' })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: course } = await supabase
      .from('sauvetage_courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (!course) return json({ error: 'Kurs nicht gefunden' })

    const { data: participants } = await supabase
      .from('sauvetage_participants')
      .select('*')
      .eq('course_id', courseId)
      .order('last_name')

    const levelLabel = course.level === 'lifesaver' ? 'Lifesaver'
      : course.level === 'both' ? 'Junior Lifesaver & Lifesaver'
      : 'Junior Lifesaver'
    const examDate = course.exam_date ? new Date(course.exam_date).toLocaleDateString('fr-LU') : '—'

    // ── Build Excel ────────────────────────────────────────────
    const rows: unknown[][] = [
      ['FÉDÉRATION LUXEMBOURGEOISE DE NATATION ET DE SAUVETAGE'],
      ['Formulaire B1 — Anmeldung Examen'],
      [],
      [`${course.name} · ${levelLabel}`],
      [],
      ['Instrukteur — Nom:', course.instructor_name || '—', 'Prénom:', course.instructor_firstname || '—'],
      ['École:', 'Letzschwamm Schwimmschule', 'Adresse instrukteur:', course.instructor_address || '—'],
      ['Tél.:', course.instructor_phone || '—', 'E-Mail:', course.instructor_email || '—'],
      ['Piscine:', course.location || '—', 'Adresse piscine:', course.venue_address || '—'],
      ['Date prévue examen:', examDate, 'Niveau:', levelLabel],
      [],
      ['N°', 'Nom', 'Prénom', 'Date de naissance', 'Adresse e-mail'],
    ]

    for (let i = 0; i < (participants || []).length; i++) {
      const p = participants![i]
      rows.push([
        i + 1,
        p.last_name,
        p.first_name,
        p.birth_date ? new Date(p.birth_date).toLocaleDateString('fr-LU') : '—',
        p.email || '—',
      ])
    }

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 32 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Formulaire B1')

    const xlsxBuf: Uint8Array = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    const bytes = new Uint8Array(xlsxBuf)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const base64 = btoa(binary)

    const safeName = course.name.replace(/[^a-z0-9_\-]/gi, '_')
    const filename = `B1_${safeName}_${examDate.replace(/\//g, '-')}.xlsx`

    // ── HTML email body ────────────────────────────────────────
    const participantRows = (participants || []).map((p, i) => `
      <tr style="border-bottom:1px solid #ddd;">
        <td style="padding:8px;text-align:center;">${i + 1}</td>
        <td style="padding:8px;">${p.last_name}</td>
        <td style="padding:8px;">${p.first_name}</td>
        <td style="padding:8px;">${p.birth_date ? new Date(p.birth_date).toLocaleDateString('fr-LU') : '—'}</td>
        <td style="padding:8px;">${p.email || '—'}</td>
      </tr>
    `).join('')

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#111;padding:24px;">
        <div style="background:#003366;color:white;padding:20px 24px;border-radius:8px 8px 0 0;margin-bottom:0;">
          <div style="font-size:11px;letter-spacing:2px;opacity:.7;margin-bottom:4px;">FÉDÉRATION LUXEMBOURGEOISE DE NATATION ET DE SAUVETAGE</div>
          <div style="font-size:22px;font-weight:700;">Formulaire B1 — Anmeldung Examen</div>
          <div style="font-size:13px;opacity:.8;margin-top:4px;">${course.name} · ${levelLabel}</div>
        </div>

        <div style="background:#f5f5f5;border:1px solid #ddd;border-top:none;padding:20px 24px;margin-bottom:20px;border-radius:0 0 8px 8px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;width:200px;color:#666;font-size:13px;">Instrukteur — Nom:</td>
              <td style="padding:6px 0;font-weight:600;">${course.instructor_name || '—'}</td>
              <td style="padding:6px 0;width:200px;color:#666;font-size:13px;">Prénom:</td>
              <td style="padding:6px 0;font-weight:600;">${course.instructor_firstname || '—'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#666;font-size:13px;">École:</td>
              <td style="padding:6px 0;font-weight:600;">Letzschwamm Schwimmschule</td>
              <td style="padding:6px 0;color:#666;font-size:13px;">Adresse instrukteur:</td>
              <td style="padding:6px 0;font-weight:600;">${course.instructor_address || '—'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#666;font-size:13px;">Tél.:</td>
              <td style="padding:6px 0;font-weight:600;">${course.instructor_phone || '—'}</td>
              <td style="padding:6px 0;color:#666;font-size:13px;">E-Mail:</td>
              <td style="padding:6px 0;font-weight:600;">${course.instructor_email || '—'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#666;font-size:13px;">Piscine:</td>
              <td style="padding:6px 0;font-weight:600;">${course.location || '—'}</td>
              <td style="padding:6px 0;color:#666;font-size:13px;">Adresse piscine:</td>
              <td style="padding:6px 0;font-weight:600;">${course.venue_address || '—'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#666;font-size:13px;">Date prévue examen:</td>
              <td style="padding:6px 0;font-weight:700;color:#003366;font-size:15px;">${examDate}</td>
              <td style="padding:6px 0;color:#666;font-size:13px;">Niveau:</td>
              <td style="padding:6px 0;font-weight:600;">${levelLabel}</td>
            </tr>
          </table>
        </div>

        <div style="font-weight:700;font-size:15px;margin-bottom:12px;">
          Participants (${(participants || []).length})
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#003366;color:white;">
              <th style="padding:10px;text-align:center;width:40px;">N°</th>
              <th style="padding:10px;text-align:left;">Nom</th>
              <th style="padding:10px;text-align:left;">Prénom</th>
              <th style="padding:10px;text-align:left;">Date de naissance</th>
              <th style="padding:10px;text-align:left;">Adresse e-mail</th>
            </tr>
          </thead>
          <tbody>
            ${participantRows || '<tr><td colspan="5" style="padding:12px;text-align:center;color:#666;">Keine Teilnehmer</td></tr>'}
          </tbody>
        </table>

        <div style="margin-top:24px;padding:16px;background:#e8f0fe;border:1px solid #c5d8f7;border-radius:8px;font-size:13px;color:#1a3a6e;">
          <strong>📎 Anhang:</strong> Das ausgefüllte Formulaire B1 ist als Excel-Datei beigefügt.
        </div>

        <div style="margin-top:20px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:16px;">
          Letzschwamm Schwimmschule Luxemburg · Gesendet via Letzschwamm-Plattform
        </div>
      </div>
    `

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Letzschwamm <info@letzschwamm.com>',
        to: 'info@letzschwamm.com',
        subject: `FLNS Formulaire B1 — ${course.name} — Examen ${examDate}`,
        html,
        attachments: [{ filename, content: base64 }],
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.text()
      throw new Error(`Resend error: ${err}`)
    }

    await supabase.from('sauvetage_courses').update({ b1_sent_at: new Date().toISOString() }).eq('id', courseId)

    return json({ success: true })
  } catch (err) {
    return json({ error: err?.message ?? String(err) })
  }
})
