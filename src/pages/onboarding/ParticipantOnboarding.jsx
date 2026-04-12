import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const STEPS = { code: 'code', preview: 'preview', register: 'register' }
const LEVEL_LABEL = { junior: 'Junior Lifesaver', lifesaver: 'Lifesaver', both: 'JL & Lifesaver' }

const STRIPE_PARTICIPANT_LINK = import.meta.env.VITE_STRIPE_PARTICIPANT_LINK || 'https://buy.stripe.com/6oU5kD6wNcRMeKge3N7kc04'

export default function ParticipantOnboarding() {
  const navigate = useNavigate()
  const [step, setStep]         = useState(STEPS.code)
  const [isSauv, setIsSauv]     = useState(false)
  const [code, setCode]         = useState('')
  const [courseData, setCourseData] = useState(null)

  // SAUV registration fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [birthDate, setBirthDate] = useState('')

  // Shared fields (TEST uses name instead of first/last)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function validateCode() {
    const trimmed = code.toUpperCase().trim()
    if (!trimmed) { setError('Bitte Code eingeben.'); return }

    if (trimmed.startsWith('SAUV-')) {
      setLoading(true)
      const { data: rows, error: rpcErr } = await supabase.rpc('get_course_by_participant_code', { p_code: trimmed })
      setLoading(false)
      if (rpcErr || !rows?.length) {
        setError('Ungültiger SAUV-Code. Bitte prüfe den Code und versuche es erneut.')
        return
      }
      setCourseData(rows[0])
      setIsSauv(true)
      setError('')
      setStep(STEPS.preview)
      return
    }

    if (trimmed.startsWith('TEST-')) {
      setLoading(true)
      const { data: testCode } = await supabase
        .from('test_codes').select('*').eq('code', trimmed).eq('type', 'participant').eq('active', true).maybeSingle()
      setLoading(false)
      if (!testCode) { setError('Ungültiger Test-Code für Kursteilnehmer.'); return }
      setIsSauv(false)
      setError('')
      setStep(STEPS.register)
      return
    }

    setError('Ungültiger Code. Bitte gib deinen SAUV-Code (SAUV-XXXXXX) ein.')
  }

  async function handleSauvRegister() {
    if (!firstName || !lastName || !email || password.length < 8) return
    setLoading(true)
    setError('')
    const { data, error: fnError } = await supabase.functions.invoke('register-participant-sauv', {
      body: {
        participantCode: code.toUpperCase().trim(),
        firstName, lastName, email, password,
        birthDate: birthDate || null,
      },
    })
    if (fnError || data?.error) {
      setLoading(false)
      setError(data?.error || 'Registrierung fehlgeschlagen.')
      return
    }
    await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    window.location.href = `${STRIPE_PARTICIPANT_LINK}?client_reference_id=participant_${data.participantId}`
  }

  async function handleTestRegister() {
    if (!name || !email || password.length < 8) return
    setLoading(true)
    setError('')
    const { data, error: fnError } = await supabase.functions.invoke('register-participant', {
      body: { code: code.toUpperCase().trim(), email, password, name },
    })
    setLoading(false)
    if (fnError || data?.error) {
      setError(data?.message || data?.error || 'Registrierung fehlgeschlagen.')
      return
    }
    await supabase.auth.signInWithPassword({ email, password })
    navigate('/')
  }

  // Progress dots — how many steps to show
  const stepList = isSauv ? [STEPS.code, STEPS.preview, STEPS.register] : [STEPS.code, STEPS.register]
  const currentIdx = stepList.indexOf(step)

  return (
    <div className="login-container" style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(0,150,199,.18) 0%, transparent 55%), linear-gradient(160deg, #162535 0%, #1B3348 50%, #1E3A56 100%)' }}>
      <div className="login-card" style={{ maxWidth: 440 }}>

        {/* Logo */}
        <div className="login-logo">
          <div style={{ width: 80, height: 80, borderRadius: 20, overflow: 'hidden', margin: '0 auto 14px', boxShadow: '0 4px 20px rgba(0,0,0,.35)' }}>
            <img src="/swimpass_icon_final.png" alt="SwimPass" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, textAlign: 'center', background: 'linear-gradient(135deg, #fff, var(--aqua))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SwimPass</div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>by Letzschwamm</div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {stepList.map((s, i) => (
            <div key={s} style={{ width: 8, height: 8, borderRadius: '50%', background: currentIdx >= i ? 'var(--aqua)' : 'var(--border)', transition: '.3s' }} />
          ))}
        </div>

        {/* ── Step: Code ── */}
        {step === STEPS.code && (
          <>
            <div className="login-title" style={{ marginBottom: 6 }}>Kurs-Registrierung</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Gib deinen SAUV-Code ein — du erhältst ihn von deinem Instrukteur.
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Kurs-Code</label>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                placeholder="SAUV-XXXXXX"
                style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '2px', textAlign: 'center' }}
                autoCapitalize="characters"
                maxLength={11}
              />
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={validateCode} disabled={loading || !code.trim()}>
              {loading ? <span className="spinner" /> : 'Weiter →'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                Bereits registriert? Anmelden
              </button>
            </div>
          </>
        )}

        {/* ── Step: Preview (SAUV only) ── */}
        {step === STEPS.preview && courseData && (
          <>
            <div className="login-title" style={{ marginBottom: 6 }}>Kurs gefunden ✓</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              Bitte bestätige deinen Kurs vor der Registrierung.
            </div>

            <div style={{ background: 'rgba(0,150,199,.1)', border: '1.5px solid rgba(0,150,199,.3)', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, marginBottom: 6, color: 'var(--aqua)' }}>
                {courseData.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>📚 {LEVEL_LABEL[courseData.level]}</div>
                {courseData.location && <div>📍 {courseData.location}</div>}
                {courseData.exam_date && <div>📅 Examen: {new Date(courseData.exam_date).toLocaleDateString('de-DE')}</div>}
                {(courseData.instructor_firstname || courseData.instructor_name) && (
                  <div>👤 Instrukteur: {courseData.instructor_firstname} {courseData.instructor_name}</div>
                )}
              </div>
            </div>

            <div style={{ background: 'rgba(244,165,26,.08)', border: '1px solid rgba(244,165,26,.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              💳 <strong style={{ color: 'var(--gold)' }}>Jahresgebühr 15€</strong> — nach der Registrierung wirst du zur sicheren Zahlung weitergeleitet.
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={() => setStep(STEPS.register)}>
              Weiter zur Registrierung →
            </button>
            <button onClick={() => setStep(STEPS.code)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', marginTop: 12, display: 'block', textAlign: 'center', width: '100%' }}>
              ← Zurück
            </button>
          </>
        )}

        {/* ── Step: Register ── */}
        {step === STEPS.register && (
          <>
            <div className="login-title" style={{ marginBottom: 6 }}>Konto erstellen</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Code <span style={{ fontFamily: 'monospace', color: 'var(--aqua)', fontWeight: 700 }}>{code}</span> ✓
            </div>
            {error && <div className="error-msg">{error}</div>}

            {isSauv ? (
              /* SAUV: first_name + last_name + birth_date + email + password */
              <>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Vorname</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Emma" autoComplete="given-name" />
                  </div>
                  <div className="form-group half">
                    <label>Nachname</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Müller" autoComplete="family-name" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Geburtsdatum</label>
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>E-Mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="deine@email.lu" autoComplete="email" />
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label>Passwort (min. 8 Zeichen)</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
                </div>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleSauvRegister}
                  disabled={loading || !firstName || !lastName || !email || password.length < 8}
                >
                  {loading ? <span className="spinner" /> : '💳 Registrieren & Bezahlen →'}
                </button>
              </>
            ) : (
              /* TEST: name + email + password */
              <>
                <div className="form-group">
                  <label>Vollständiger Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Emma Müller" autoComplete="name" />
                </div>
                <div className="form-group">
                  <label>E-Mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teilnehmer@email.lu" autoComplete="email" />
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label>Passwort (min. 8 Zeichen)</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
                </div>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleTestRegister}
                  disabled={loading || !name || !email || password.length < 8}
                >
                  {loading ? <span className="spinner" /> : 'Registrieren →'}
                </button>
              </>
            )}

            <button
              onClick={() => setStep(isSauv ? STEPS.preview : STEPS.code)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', marginTop: 12, display: 'block', textAlign: 'center', width: '100%' }}
            >
              ← Zurück
            </button>
          </>
        )}
      </div>
    </div>
  )
}
