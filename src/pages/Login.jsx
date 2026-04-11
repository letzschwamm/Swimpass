import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { signIn } = useAuth()
  const { t, lang, setLang } = useApp()
  const navigate = useNavigate()

  // Refs read the real DOM value — iOS autofill bypasses React onChange
  const emailRef    = useRef(null)
  const passwordRef = useRef(null)
  const forgotRef   = useRef(null)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent]   = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  async function handleForgot(e) {
    e.preventDefault()
    const addr = forgotRef.current?.value || forgotEmail
    if (!addr) return
    setForgotLoading(true)
    await supabase.auth.resetPasswordForEmail(addr, {
      redirectTo: `${window.location.origin}/login`,
    })
    setForgotLoading(false)
    setForgotSent(true)
  }

  async function handleLogin(e) {
    e.preventDefault()
    // Read directly from DOM — catches iOS autofill that skips onChange
    const emailVal    = emailRef.current?.value    || email
    const passwordVal = passwordRef.current?.value || password
    if (!emailVal || !passwordVal) {
      setError('Bitte E-Mail und Passwort eingeben.')
      return
    }
    setError('')
    setLoading(true)
    const { error } = await signIn(emailVal, passwordVal)
    setLoading(false)
    if (error) {
      if (error.message?.includes('Invalid login credentials')) {
        setError('E-Mail oder Passwort falsch.')
      } else {
        setError(error.message)
      }
    } else {
      navigate('/')
    }
  }

  return (
    <div className="login-container" style={{
      background: 'radial-gradient(ellipse at 20% 80%, rgba(0,150,199,.18) 0%, transparent 55%), linear-gradient(160deg, #0D1F30 0%, #112840 50%, #163558 100%)'
    }}>
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img src="/Icon_Only_Crown_25_solid.png" alt="SwimPass" style={{ width: 80, height: 80, objectFit: 'contain', display: 'block', margin: '0 auto 14px' }} />
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, textAlign: 'center', background: 'linear-gradient(135deg, #fff, var(--aqua))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SwimPass</div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>by Letzschwamm</div>
        </div>

        {/* Language */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          {['de', 'fr', 'lu', 'en'].map(l => (
            <button key={l} className={`lang-pill${lang === l ? ' active' : ''}`} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="login-title">{t.ui.loginTitle}</div>
        <div className="login-sub" style={{ marginBottom: 24 }}>{t.ui.loginSub}</div>

        {forgotMode ? (
          forgotSent ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📧</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>E-Mail gesendet!</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                Bitte prüfen Sie Ihr Postfach und klicken Sie auf den Link zum Zurücksetzen.
              </div>
              <button className="btn btn-ghost btn-full" onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail('') }}>
                ← Zurück zum Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgot} noValidate>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Passwort zurücksetzen</div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>{t.ui.email}</label>
                <input
                  ref={forgotRef}
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  onBlur={e => setForgotEmail(e.target.value)}
                  placeholder="ihre@email.com"
                  autoComplete="email"
                  autoFocus
                  inputMode="email"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={forgotLoading}
                style={{ marginBottom: 10 }}
              >
                {forgotLoading ? <span className="spinner" /> : 'Reset-Link senden'}
              </button>
              <button type="button" className="btn btn-ghost btn-full" onClick={() => setForgotMode(false)}>
                ← Zurück zum Login
              </button>
            </form>
          )
        ) : (
          <>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label>{t.ui.email}</label>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onBlur={e => setEmail(e.target.value)}
                  placeholder={t.ui.emailPlaceholder}
                  autoComplete="email"
                  autoFocus
                  inputMode="email"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>{t.ui.password}</label>
                <input
                  ref={passwordRef}
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onBlur={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Passwort vergessen?
                </button>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : t.ui.login}
              </button>
            </form>
            <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>{t.ui.noAccount} </span>
              <button onClick={() => navigate('/onboarding')} style={{ background: 'none', border: 'none', color: 'var(--aqua)', fontSize: 13, cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                {t.ui.registerHere}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
