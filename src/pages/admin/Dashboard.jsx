import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { getProgress } from '../../lib/criteria'
import { DEMO_CHILDREN, DEMO_CLASSES, DEMO_ACTIVITIES } from '../../lib/demo'
import ProgressBar from '../../components/ProgressBar'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'

export default function Dashboard() {
  const { profile, isDemo } = useAuth()
  const { t } = useApp()
  const navigate = useNavigate()
  const ui = t.ui

  const [children, setChildren]   = useState([])
  const [classes, setClasses]     = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    setLoading(true)
    if (isDemo) {
      setChildren(DEMO_CHILDREN)
      setClasses(DEMO_CLASSES)
      setActivities(DEMO_ACTIVITIES)
      setLoading(false)
      return
    }
    const schoolId = profile.school_id
    const [{ data: kids }, { data: cls }, { data: acts }] = await Promise.all([
      supabase.from('children').select('*, progress(criteria_key)').eq('school_id', schoolId),
      supabase.from('classes').select('*, profiles(name)').eq('school_id', schoolId),
      supabase.from('activities').select('*').eq('school_id', schoolId).order('created_at', { ascending: false }).limit(6),
    ])
    setChildren(kids || [])
    setClasses(cls || [])
    setActivities(acts || [])
    setLoading(false)
  }

  function childProgress(child) {
    const done = (child.progress || []).map(p => p.criteria_key)
    return getProgress(done, child.level)
  }

  const avgProgress = children.length
    ? Math.round(children.reduce((s, c) => s + childProgress(c), 0) / children.length)
    : 0

  const teachers = [...new Set(classes.map(c => c.profiles?.name).filter(Boolean))]

  if (loading) return <div className="page-content"><div style={{ color: 'var(--muted)' }}>Laden...</div></div>

  return (
    <div className="page-content">
      {isDemo && (
        <div style={{ background: 'rgba(244,165,26,.08)', border: '1px solid rgba(244,165,26,.2)', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: 'var(--gold)', marginBottom: 16 }}>
          🚀 Demo-Modus — Daten werden nur lokal angezeigt, nichts wird gespeichert
        </div>
      )}

      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">{ui.dashboard}</div>
          <div className="page-sub">Willkommen zurück, {profile?.name || 'Admin'} 👋</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => navigate('/admin/children')}>
            + {ui.addChild}
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card accent">
          <div className="stat-val blue">{children.length}</div>
          <div className="stat-label">{ui.children}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val gold">{classes.length}</div>
          <div className="stat-label">{ui.allClasses}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val green">{teachers.length}</div>
          <div className="stat-label">{ui.teachers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{children.length ? `${avgProgress}%` : '—'}</div>
          <div className="stat-label">{ui.avgProgress}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div>
          <div className="sec-header">
            <div className="sec-title">{ui.recentActivity}</div>
          </div>
          <div className="card">
            {activities.map((act, i) => (
              <div key={act.id || i} className="activity-item">
                <div className={`act-dot ${act.type || 'blue'}`} />
                <div>
                  <div className="act-text" dangerouslySetInnerHTML={{ __html: act.text }} />
                  <div className="act-time">{new Date(act.created_at).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="sec-header">
            <div className="sec-title">{ui.classOverview}</div>
            <button className="sec-link" onClick={() => navigate('/admin/classes')}>{ui.viewAll}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {classes.map(cls => {
              const kids = children.filter(c => c.class_id === cls.id)
              const avg = kids.length
                ? Math.round(kids.reduce((s, c) => s + childProgress(c), 0) / kids.length)
                : 0
              return (
                <div key={cls.id} className="card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{cls.name}</div>
                    <Badge variant="muted">{t.days[cls.day] || cls.day} {cls.time}</Badge>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                    {kids.length} {ui.children} · {cls.profiles?.name || '—'}
                  </div>
                  <ProgressBar value={avg} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="sec-header">
        <div className="sec-title">{ui.allChildren}</div>
        <button className="sec-link" onClick={() => navigate('/admin/children')}>{ui.viewAll}</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{ui.name}</th><th>{ui.level}</th><th>{ui.class}</th><th>{ui.progress}</th><th></th>
            </tr>
          </thead>
          <tbody>
            {children.slice(0, 5).map(child => {
              const pct = childProgress(child)
              const cls = classes.find(c => c.id === child.class_id)
              return (
                <tr key={child.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={`${child.first_name} ${child.last_name}`} size={30} radius={8} />
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{child.first_name} {child.last_name}</div>
                    </div>
                  </td>
                  <td><Badge variant={child.level === 'lifesaver' ? 'gold' : 'blue'}>{t.levelLabel[child.level]}</Badge></td>
                  <td><span style={{ fontSize: 12, color: 'var(--muted)' }}>{cls?.name || '—'}</span></td>
                  <td><ProgressBar value={pct} /></td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => navigate(`/admin/children/${child.id}`)}>
                      {ui.open}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
