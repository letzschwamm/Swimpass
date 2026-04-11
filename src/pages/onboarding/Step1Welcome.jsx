import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function Step1Welcome({ next }) {
  const { t, lang, setLang } = useApp()
  const ob = t.onboarding.welcome
  const navigate = useNavigate()

  const roles = [
    {
      icon: '👨‍👩‍👧',
      label: 'Ich bin Elternteil',
      sub: 'Mein Kind nimmt an einem Schwimmkurs teil',
      action: next,
      primary: true,
    },
    {
      icon: '🏅',
      label: 'Ich mache einen Kurs',
      sub: 'Ich mache selbst einen Lifesaver Kurs',
      action: next,
      primary: false,
    },
    {
      icon: '🏊',
      label: 'Ich bin Instruktor',
      sub: 'Ich leite Schwimm- und Rettungskurse',
      action: () => navigate('/onboarding/instructor'),
      primary: false,
    },
  ]

  return (
    <div className="ob-step" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="welcome-hero">
        <div className="welcome-logo"><img src="/Icon_Only_Crown_25_solid.png" alt="Letzschwamm" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
        <div className="welcome-title">Letzschwamm</div>
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
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: primary
                ? 'linear-gradient(135deg, var(--mid), var(--aqua))'
                : 'rgba(255,255,255,0.07)',
              color: primary ? '#fff' : 'var(--text)',
              textAlign: 'left', width: '100%',
              boxShadow: primary ? '0 4px 20px rgba(0,180,216,.35)' : 'none',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = primary ? '0 8px 28px rgba(0,180,216,.45)' : '0 4px 16px rgba(0,0,0,.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = primary ? '0 4px 20px rgba(0,180,216,.35)' : 'none' }}
          >
            <span style={{ fontSize: 26, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
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
