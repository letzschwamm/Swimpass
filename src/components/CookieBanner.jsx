import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('swimpass_cookies_accepted')) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem('swimpass_cookies_accepted', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
      background: 'linear-gradient(0deg, #0D1F2E, #162535)',
      borderTop: '1px solid rgba(144,220,240,.2)',
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 260, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
        🍪 Diese Website verwendet notwendige Cookies für den Betrieb. Keine Tracking- oder Werbe-Cookies.{' '}
        <button
          onClick={() => navigate('/datenschutz')}
          style={{ background: 'none', border: 'none', color: 'var(--aqua)', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
        >
          Datenschutz
        </button>
      </div>
      <button className="btn btn-primary" style={{ padding: '8px 20px', whiteSpace: 'nowrap' }} onClick={accept}>
        Verstanden
      </button>
    </div>
  )
}
