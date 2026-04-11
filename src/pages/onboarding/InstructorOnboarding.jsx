import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const STRIPE_INSTRUCTOR_LINK = import.meta.env.VITE_STRIPE_INSTRUCTOR_LINK || 'https://buy.stripe.com/instructor_placeholder'

const STEPS = { code: 'code', register: 'register', payment: 'payment', success: 'success' }

export default function InstructorOnboarding() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(STEPS.code)
  const [code, setCode]       = useState('')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function validateCode() {
    const trimmed = code.toUpperCase().trim()
    if (!trimmed) { setError('Bitte Code eingeben.'); return }
    // Format check only — real validation happens server-side in register-instructor
    setStep(STEPS.register)
  }

  async function handleRegister() {
    if (!name || !email || password.length < 8) return
    setLoading(true)
    setError('')
    const { data, error: fnError } = await supabase.functions.invoke('register-instructor', {
      body: { code: code.toUpperCase().trim(), email, password, name },
    })
    setLoading(false)
    if (fnError || data?.error) {
      setError(data?.message || data?.error || 'Registrierung fehlgeschlagen.')
      return
    }
    // Sign in immediately
    await supabase.auth.signInWithPassword({ email, password })
    setStep(STEPS.payment)
  }

  return (
    <div className="login-container" style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(0,150,199,.18) 0%, transparent 55%), linear-gradient(160deg, #162535 0%, #1B3348 50%, #1E3A56 100%)' }}>
      <div className="login-card" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <div className="login-logo">
          <img src="/Icon_Only_Crown_25_solid.png" alt="SwimPass" style={{ width: 80, height: 80, objectFit: 'contain', display: 'block', margin: '0 auto 14px' }} />
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, textAlign: 'center', background: 'linear-gradient(135deg, #fff, var(--aqua))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SwimPass</div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>by Letzschwamm</div>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {[STEPS.code, STEPS.register, STEPS.payment].map((s, i) => (
            <div key={s} style={{ width: 8, height: 8, borderRadius: '50%', background: [STEPS.code, STEPS.register, STEPS.payment].indexOf(step) >= i ? 'var(--aqua)' : 'var(--border)', transition: '.3s' }} />
          ))}
        </div>

        {/* Step: Code */}
        {step === STEPS.code && (
          <>
            <div className="login-title" style={{ marginBottom: 6 }}>Instrukteur-Registrierung</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Gib deinen Einladungscode ein — du erhältst ihn vom Administrator der Schwimmschule.</div>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Einladungscode</label>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                placeholder="INST-XXXXXX"
                style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '2px', textAlign: 'center' }}
                autoCapitalize="characters"
                maxLength={11}
              />
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={validateCode} disabled={!code.trim()}>
              Weiter →
            </button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                Bereits registriert? Anmelden
              </button>
            </div>
          </>
        )}

        {/* Step: Register */}
        {step === STEPS.register && (
          <>
            <div className="login-title" style={{ marginBottom: 6 }}>Konto erstellen</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Code <span style={{ fontFamily: 'monospace', color: 'var(--aqua)', fontWeight: 700 }}>{code}</span> ✓
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label>Vollständiger Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Klaus Müller" autoComplete="name" />
            </div>
            <div className="form-group">
              <label>E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="instrukteur@email.lu" autoComplete="email" />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Passwort (min. 8 Zeichen)</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleRegister} disabled={loading || !name || !email || password.length < 8}>
              {loading ? <span className="spinner" /> : 'Registrieren →'}
            </button>
            <button onClick={() => setStep(STEPS.code)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', marginTop: 12, display: 'block', textAlign: 'center', width: '100%' }}>
              ← Zurück
            </button>
          </>
        )}

        {/* Step: Payment */}
        {step === STEPS.payment && (
          <>
            <div className="login-title" style={{ marginBottom: 6 }}>Jahresgebühr bezahlen</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Um die Letzschwamm-Plattform als Instrukteur zu nutzen, ist eine Jahresgebühr fällig.
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(0,150,199,.15), rgba(72,202,228,.08))', border: '1.5px solid rgba(72,202,228,.3)', borderRadius: 16, padding: '24px 20px', marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Instrukteur-Zugang</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, color: 'var(--aqua)' }}>49€</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>pro Jahr · inkl. 17% TVA</div>
              <div style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                ✓ Unbegrenzte Sauvetage-Kurse<br />
                ✓ B1 & B2 Formulare automatisch<br />
                ✓ Teilnehmerverwaltung
              </div>
            </div>
            <a href={STRIPE_INSTRUCTOR_LINK} className="btn btn-primary btn-full btn-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: 10 }}>
              💳 Jetzt bezahlen — 49€/Jahr
            </a>
            <button className="btn btn-ghost btn-full" onClick={() => navigate('/instructor')}>
              Später bezahlen (eingeschränkter Zugang)
            </button>
            <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 12 }}>
              🔒 Sichere Zahlung via Stripe
            </div>
          </>
        )}
      </div>
    </div>
  )
}
