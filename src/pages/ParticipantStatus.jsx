import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STRIPE_BADGE_LINK = 'https://buy.stripe.com/aFa9AT2gxeZUfOkbVF7kc01'

const STATUS_INFO = {
  registered:       { label: 'Angemeldet',        color: 'var(--aqua)',   icon: '📋' },
  passed_junior:    { label: 'Junior Lifesaver ✓', color: 'var(--green)',  icon: '🏅' },
  passed_lifesaver: { label: 'Lifesaver ✓',        color: '#F4A51A',       icon: '🏆' },
  failed:           { label: 'Nicht bestanden',    color: 'var(--muted)',  icon: '—'  },
}

export default function ParticipantStatus() {
  const { token } = useParams()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    async function load() {
      const { data: rows, error: err } = await supabase.rpc('get_participant_by_token', { p_token: token })
      setLoading(false)
      if (err || !rows?.length) { setError('Teilnehmer nicht gefunden.'); return }
      setData(rows[0])
    }
    if (token) load()
  }, [token])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#162535,#1E3A56)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      Laden...
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#162535,#1E3A56)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{error}</div>
      </div>
    </div>
  )

  const statusInfo = STATUS_INFO[data.status] || STATUS_INFO.registered
  const passed = data.status === 'passed_junior' || data.status === 'passed_lifesaver'
  const levelLabel = data.course_level === 'lifesaver' ? 'Lifesaver' : data.course_level === 'both' ? 'JL & Lifesaver' : 'Junior Lifesaver'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#162535 0%,#1B3045 50%,#1E3A56 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'DM Sans, sans-serif', color: '#F0F6FF' }}>
      <div style={{ maxWidth: 400, width: '100%' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/Icon_Only_Crown_25_solid.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 8 }} />
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg,#fff,#48CAE4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Letzschwamm
          </div>
        </div>

        {/* Status card */}
        <div style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(144,220,240,.2)', borderRadius: 20, padding: 28, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{statusInfo.icon}</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
            {data.first_name} {data.last_name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            {data.course_name} · {levelLabel}
          </div>

          <div style={{ background: passed ? 'rgba(34,197,94,.1)' : 'rgba(255,255,255,.05)', border: `1.5px solid ${passed ? 'rgba(34,197,94,.3)' : 'rgba(144,220,240,.15)'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Status</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: statusInfo.color }}>{statusInfo.label}</div>
          </div>

          {data.exam_date && (
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Examen: {new Date(data.exam_date).toLocaleDateString('de-DE')}
            </div>
          )}
        </div>

        {/* Badge payment — only for passed participants */}
        {passed && data.payment_status === 'pending' && (
          <div style={{ background: 'rgba(244,165,26,.1)', border: '1px solid rgba(244,165,26,.3)', borderRadius: 16, padding: 20, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#F4A51A' }}>🏅 Abzeichen sichern</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Herzlichen Glückwunsch! Bezahle jetzt die Abzeichen-Gebühr um dein offizielles FLNS-Abzeichen zu erhalten.
            </div>
            <a
              href={STRIPE_BADGE_LINK}
              style={{ display: 'block', background: 'linear-gradient(135deg,#0096C7,#48CAE4)', color: '#fff', textDecoration: 'none', padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15 }}
            >
              💳 Abzeichen-Gebühr bezahlen →
            </a>
          </div>
        )}

        {passed && data.payment_status === 'paid' && (
          <div style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 16, padding: 20, textAlign: 'center', color: 'var(--green)', fontSize: 14, fontWeight: 600 }}>
            ✓ Abzeichen-Gebühr bezahlt — Abzeichen wird zugestellt
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--muted)' }}>
          Letzschwamm Schwimmschule Luxemburg
        </div>
      </div>
    </div>
  )
}
