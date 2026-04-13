import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useInstructorLevel } from '../hooks/useInstructorLevel'
import Avatar from './Avatar'

const ROUTE_PREFIX = { admin: '/admin', teacher: '/teacher', parent: '/parent', instructor: '/instructor', participant: '/participant' }
const PAGE_ROUTES = {
  dashboard: '',
  children: '/children',
  classes: '/classes',
  sauvetage: '/sauvetage',
  instructors: '/instructors',
  levels: '/levels',
  swim: '/swim',
  settings: '/settings',
  chat: '/chat',
  'my-classes': '',
  'my-child': '',
  'my-status': '',
}

// ── Small level emblem shown next to instructor name ─────────────────────────
function InstructorLevelBadge({ onNavigate }) {
  const { current } = useInstructorLevel()
  return (
    <>
      <style>{`
        @keyframes sidebarLvlPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 ${current.color}44; }
          50%       { transform: scale(1.12); box-shadow: 0 0 0 4px ${current.color}22; }
        }
      `}</style>
      <span
        title={`${current.emoji} ${current.name} · Level ${current.level}`}
        onClick={e => { e.stopPropagation(); onNavigate() }}
        style={{
          cursor: 'pointer',
          fontSize: 13,
          lineHeight: 1,
          width: 22, height: 22,
          borderRadius: '50%',
          border: `1.5px solid ${current.color}66`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: current.bg,
          animation: current.level >= 2 ? 'sidebarLvlPulse 3s ease-in-out infinite' : 'none',
          flexShrink: 0,
          verticalAlign: 'middle',
          marginLeft: 4,
        }}
      >
        {current.emoji}
      </span>
    </>
  )
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
          <div className="sb-user-name" style={{ display: 'flex', alignItems: 'center' }}>
            {profile?.name || profile?.email?.split('@')[0] || '—'}
            {role === 'instructor' && (
              <InstructorLevelBadge onNavigate={() => { navigate('/instructor/levels'); onClose?.() }} />
            )}
          </div>
          <div className="sb-user-role">{t.roleLabels[profile?.role] || ''}</div>
        </div>
        <button className="sb-logout" onClick={signOut} title={t.ui.logout}>⎋</button>
      </div>
    </aside>
  )
}
