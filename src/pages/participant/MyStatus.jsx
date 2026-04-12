import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const STRIPE_BADGE_LINK = import.meta.env.VITE_STRIPE_SAUVETAGE_LINK || 'https://buy.stripe.com/aFa9AT2gxeZUfOkbVF7kc01'

const STATUS_LABEL = {
  registered:       'Angemeldet',
  passed_junior:    'Junior Lifesaver ✓',
  passed_lifesaver: 'Lifesaver ✓',
  failed:           'Nicht bestanden',
}
const STATUS_COLOR = {
  registered:       'var(--aqua)',
  passed_junior:    'var(--green)',
  passed_lifesaver: '#F4A51A',
  failed:           'var(--muted)',
}
const LEVEL_LABEL = { junior: 'Junior Lifesaver', lifesaver: 'Lifesaver', both: 'JL & Lifesaver' }

export default function MyStatus() {
  const { profile } = useAuth()
  const [participant, setParticipant] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      const { data: rows } = await supabase.rpc('get_my_participant_data')
      setParticipant(rows?.[0] || null)
      setLoadingData(false)
    }
    load()
  }, [profile])

  const passed = participant?.status === 'passed_junior' || participant?.status === 'passed_lifesaver'

  return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">🏅 Mein Kurs-Status</div>
          <div className="page-sub">Kursteilnehmer-Bereich</div>
        </div>
      </div>

      {loadingData ? (
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Laden...
        </div>
      ) : !participant ? (
        /* No sauvetage course linked yet */
        <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 20 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏅</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            Willkommen, {profile?.name?.split(' ')[0] || 'Teilnehmer'}!
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
            Du bist als Kursteilnehmer registriert.<br />
            Sobald dein Instrukteur deinen Kurs eingerichtet hat, siehst du hier deinen Fortschritt.
          </div>
          {profile?.is_test && (
            <div style={{ marginTop: 20, display: 'inline-block', padding: '4px 12px', borderRadius: 6, background: 'rgba(244,165,26,.15)', border: '1px solid rgba(244,165,26,.3)', fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>
              🧪 TEST-KONTO
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Course status card */}
          <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>Kurs</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{participant.course_name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
              {LEVEL_LABEL[participant.course_level]}
              {participant.location && ` · ${participant.location}`}
              {participant.exam_date && ` · Examen: ${new Date(participant.exam_date).toLocaleDateString('de-DE')}`}
            </div>

            <div style={{
              background: passed ? 'rgba(34,197,94,.08)' : 'rgba(255,255,255,.03)',
              border: `1.5px solid ${passed ? 'rgba(34,197,94,.25)' : 'var(--border)'}`,
              borderRadius: 12, padding: '14px 18px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Status</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: STATUS_COLOR[participant.status] || 'var(--text)' }}>
                {STATUS_LABEL[participant.status] || participant.status}
              </div>
            </div>
          </div>

          {/* Instructor */}
          {(participant.instructor_firstname || participant.instructor_name) && (
            <div className="card" style={{ marginBottom: 18, padding: '14px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>Instrukteur</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{participant.instructor_firstname} {participant.instructor_name}</div>
            </div>
          )}

          {/* Badge purchase */}
          {passed && participant.badge_payment_status !== 'paid' && (
            <div className="card" style={{ marginBottom: 18, background: 'rgba(244,165,26,.07)', border: '1px solid rgba(244,165,26,.25)', textAlign: 'center', padding: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🏅</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, marginBottom: 6, color: '#F4A51A' }}>
                Herzlichen Glückwunsch!
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.6 }}>
                Du hast bestanden! Kaufe jetzt dein offizielles FLNS-Abzeichen für 50€.
              </div>
              <a
                href={`${STRIPE_BADGE_LINK}?client_reference_id=badge_${participant.id}`}
                style={{ display: 'block', background: 'linear-gradient(135deg,#0096C7,#48CAE4)', color: '#fff', textDecoration: 'none', padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, marginBottom: 10 }}
              >
                🏅 Abzeichen kaufen — 50€
              </a>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                Dein Abzeichen wird dir von der FLNS per Post zugeschickt.
              </div>
            </div>
          )}

          {passed && participant.badge_payment_status === 'paid' && (
            <div className="card" style={{ marginBottom: 18, background: 'rgba(34,197,94,.07)', border: '1px solid rgba(34,197,94,.25)', textAlign: 'center', padding: 20, color: 'var(--green)', fontSize: 14, fontWeight: 600 }}>
              ✓ Abzeichen bezahlt — wird von der FLNS per Post zugestellt
            </div>
          )}
        </>
      )}

      {/* Account info */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>Konto-Info</div>
        <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Name</span>
            <span style={{ fontWeight: 600 }}>{profile?.name || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>E-Mail</span>
            <span style={{ fontWeight: 600 }}>{profile?.email || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Rolle</span>
            <span style={{ fontWeight: 600 }}>Kursteilnehmer</span>
          </div>
        </div>
      </div>
    </div>
  )
}
