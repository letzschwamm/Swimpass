import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function Step1Welcome({ next }) {
  const { t, lang, setLang } = useApp()
  const ob = t.onboarding.welcome
  const navigate = useNavigate()

  const roleActions = [next, next, () => navigate('/onboarding/instructor')]
  const roles = ob.roles.map((r, i) => ({ ...r, action: roleActions[i] }))

  return (
    <div className="ob-step" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="welcome-hero">
        <img src="/Icon_Only_Crown_25_solid.png" alt="SwimPass" style={{ width: 80, height: 80, objectFit: 'contain', display: 'block', margin: '0 auto 12px' }} />
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, textAlign: 'center', background: 'linear-gradient(135deg, #fff, var(--aqua))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>SwimPass</div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>by Letzschwamm</div>
        <div className="welcome-sub">{ob.sub}</div>
      </div>

      <div className="lang-row">
        {[
          { code: 'de', flag: '🇩🇪' },
          { code: 'fr', flag: '🇫🇷' },
          { code: 'lu', flag: '🇱🇺' },
          { code: 'en', flag: '🇬🇧' },
        ].map(({ code, flag }) => (
          <div
            key={code}
            className={`lang-chip${lang === code ? ' active' : ''}`}
            onClick={() => setLang(code)}
          >
            {flag} {code.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="ob-bottom" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {roles.map(({ icon, label, sub, action, primary }) => (
          <button
            key={label}
            onClick={action}
            className={`role-btn${primary ? ' role-btn-primary' : ''}`}
          >
            <span style={{ fontSize: 26, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: primary ? 15 : 14, marginBottom: 2 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, opacity: primary ? 0.85 : 0.6, lineHeight: 1.3 }}>
                {sub}
              </div>
            </div>
            <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 16 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}
