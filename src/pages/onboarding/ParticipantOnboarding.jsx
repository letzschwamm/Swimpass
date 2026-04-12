import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const STEPS = { code: 'code', register: 'register', success: 'success' }

export default function ParticipantOnboarding() {
  const navigate = useNavigate()
  const [step, setStep]       = useState(STEPS.code)
  const [code, setCode]       = useState('')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function validateCode() {
    const trimmed = code.toUpperCase().trim()
    if (!trimmed) { setError('Bitte Code eingeben.'); return }

    if (!trimmed.startsWith('TEST-')) {
      setError('Bitte gib deinen Test-Code ein (beginnt mit TEST-).')
      return
    }

    setLoading(true)
    const { data: testCode } = await supabase
      .from('test_codes').select('*').eq('code', trimmed).eq('type', 'participant').eq('active', true).maybeSingle()
    setLoading(false)

    if (!testCode) { setError('Ungültiger Test-Code für Kursteilnehmer.'); return }
    setError('')
    setStep(STEPS.register)
  }

  async function handleRegister() {
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
    navigate('/participant')
  }

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
          {[STEPS.code, STEPS.register].map((s, i) => (
            <div key={s} style={{ width: 8, height: 8, borderRadius: '50%', background: [STEPS.code, STEPS.register].indexOf(step) >= i ? 'var(--aqua)' : 'var(--border)', transition: '.3s' }} />
          ))}
        </div>

        {/* Step: Code */}
        {step === STEPS.code && (
          <>
            <div className="login-title" style={{ marginBottom: 6 }}>Kurs-Registrierung</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Gib deinen Test-Code ein — du erhältst ihn vom Administrator.
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Test-Code</label>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                placeholder="TEST-XXXXXX"
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
            <button className="btn btn-primary btn-full btn-lg" onClick={handleRegister} disabled={loading || !name || !email || password.length < 8}>
              {loading ? <span className="spinner" /> : 'Registrieren →'}
            </button>
            <button onClick={() => setStep(STEPS.code)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', marginTop: 12, display: 'block', textAlign: 'center', width: '100%' }}>
              ← Zurück
            </button>
          </>
        )}
      </div>
    </div>
  )
}
