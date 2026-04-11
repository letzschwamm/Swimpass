import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

const ROUTE_PREFIX = { admin: '/admin', teacher: '/teacher', parent: '/parent', instructor: '/instructor' }
const PAGE_ROUTES = {
  dashboard: '',
  children: '/children',
  classes: '/classes',
  sauvetage: '/sauvetage',
  instructors: '/instructors',
  'my-classes': '',
  'my-child': '',
}

export default function Sidebar({ role, isOpen, onClose }) {
  const { lang, setLang, t } = useApp()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const prefix = ROUTE_PREFIX[role]
  const navItems = t.nav[role] || []

  function getPath(id) {
    return prefix + (PAGE_ROUTES[id] ?? '')
  }

  function isActive(id) {
    const path = getPath(id)
    if (path === prefix || path === prefix + '/') {
      return location.pathname === prefix || location.pathname === prefix + '/'
    }
    return location.pathname.startsWith(path)
  }

  function handleNav(id) {
    navigate(getPath(id))
  }

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sb-logo">
        <div className="sb-logo-icon"><img src="/swimpass_icon_final.png" alt="SwimPass" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></div>
        <div className="sb-logo-text">SwimPass</div>
        {onClose && (
          <button onClick={onClose} className="sb-close" aria-label="Schließen">✕</button>
        )}
      </div>

      <nav className="sb-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sb-item${isActive(item.id) ? ' active' : ''}`}
            onClick={() => { handleNav(item.id); onClose?.() }}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sb-lang">
        <div className="sb-lang-label">Sprache / Langue</div>
        <div className="lang-pills">
          {['de', 'fr', 'lu', 'en'].map(l => (
            <button
              key={l}
              className={`lang-pill${lang === l ? ' active' : ''}`}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="sb-user">
        <Avatar name={profile?.name || profile?.email?.split('@')[0] || '?'} size={32} radius={9} />
        <div className="sb-user-info">
          <div className="sb-user-name">{profile?.name || profile?.email?.split('@')[0] || '—'}</div>
          <div className="sb-user-role">{t.roleLabels[profile?.role] || ''}</div>
        </div>
        <button className="sb-logout" onClick={signOut} title={t.ui.logout}>⎋</button>
      </div>
    </aside>
  )
}
