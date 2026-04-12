import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Toast from './Toast'

const ROUTE_PREFIX = { admin: '/admin', teacher: '/teacher', parent: '/parent', instructor: '/instructor', participant: '/participant' }
const PAGE_ROUTES = {
  dashboard: '',
  children: '/children',
  classes: '/classes',
  sauvetage: '/sauvetage',
  instructors: '/instructors',
  'my-classes': '',
  'my-child': '',
  'my-status': '',
}

const BOTTOM_NAV = {
  admin:       [{ id: 'dashboard', icon: '📊', label: 'Dashboard' }, { id: 'children', icon: '👶', label: 'Kinder' }, { id: 'classes', icon: '📚', label: 'Klassen' }, { id: 'sauvetage', icon: '🏊', label: 'Sauvetage' }],
  teacher:     [{ id: 'my-classes', icon: '📚', label: 'Klassen' }, { id: 'children', icon: '👶', label: 'Kinder' }],
  instructor:  [{ id: 'sauvetage', icon: '🏊', label: 'Kurse' }],
  parent:      [{ id: 'my-child', icon: '👶', label: 'Mein Kind' }],
  participant: [{ id: 'my-status', icon: '🏅', label: 'Mein Status' }],
}

export default function Layout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const prefix = ROUTE_PREFIX[role]
  const bottomItems = BOTTOM_NAV[role] || []

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
    setSidebarOpen(false)
  }

  return (
    <div className="shell">
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menü">
        <span />
        <span />
        <span />
      </button>

      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main">
        <Outlet />
      </main>

      {bottomItems.length > 0 && (
        <nav className="bottom-nav">
          {bottomItems.map(({ id, icon, label }) => (
            <button
              key={id}
              className={`bn-item${isActive(id) ? ' active' : ''}`}
              onClick={() => handleNav(id)}
            >
              <span className="bn-icon">{icon}</span>
              <span className="bn-label">{label}</span>
            </button>
          ))}
        </nav>
      )}

      <Toast />
    </div>
  )
}
