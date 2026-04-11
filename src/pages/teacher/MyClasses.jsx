import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { getProgress } from '../../lib/criteria'
import { DEMO_CHILDREN, DEMO_CLASSES } from '../../lib/demo'
import ProgressBar from '../../components/ProgressBar'
import Badge from '../../components/Badge'

export default function MyClasses() {
  const { profile, isDemo } = useAuth()
  const { t } = useApp()
  const navigate = useNavigate()
  const ui = t.ui

  const [classes, setClasses]     = useState([])
  const [children, setChildren]   = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    setLoading(true)
    if (isDemo) {
      const myCls = DEMO_CLASSES.filter(c => c.teacher_id === profile.id)
      setClasses(myCls.length ? myCls : DEMO_CLASSES)
      setChildren(DEMO_CHILDREN)
      if (myCls.length) setSelectedClass(myCls[0].id)
      else setSelectedClass(DEMO_CLASSES[0]?.id)
      setLoading(false)
      return
    }
    const [{ data: cls }, { data: kids }] = await Promise.all([
      supabase.from('classes').select('*').eq('teacher_id', profile.id),
      supabase.from('children').select('*, progress(criteria_key)').eq('school_id', profile.school_id),
    ])
    setClasses(cls || [])
    setChildren(kids || [])
    if (cls?.length) setSelectedClass(cls[0].id)
    setLoading(false)
  }

  function childProgress(child) {
    return getProgress((child.progress || []).map(p => p.criteria_key), child.level)
  }

  const activeClass    = classes.find(c => c.id === selectedClass)
  const classChildren  = children.filter(c => c.class_id === selectedClass)

  if (loading) return <div className="page-content" style={{ color: 'var(--muted)' }}>Laden...</div>

  return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">{ui.myClasses}</div>
          <div className="page-sub">{profile?.name}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {classes.map(cls => (
          <button key={cls.id} className={`btn${selectedClass === cls.id ? ' btn-primary' : ' btn-ghost'}`} onClick={() => setSelectedClass(cls.id)}>
            {cls.name}
          </button>
        ))}
      </div>

      {activeClass && (
        <div className="sec-title" style={{ marginBottom: 14 }}>
          🗓 {t.days[activeClass.day] || activeClass.day} {activeClass.time} — {activeClass.name}
        </div>
      )}

      <div className="table-wrap">
        {classChildren.length === 0
          ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{ui.noChildren}</div>
          : (
            <table>
              <thead><tr><th>{ui.name}</th><th>{ui.level}</th><th>{ui.progress}</th><th>{ui.action}</th></tr></thead>
              <tbody>
                {classChildren.map(child => {
                  const pct = childProgress(child)
                  return (
                    <tr key={child.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,var(--blue),var(--light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{child.avatar}</div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{child.first_name} {child.last_name}</div>
                        </div>
                      </td>
                      <td><Badge variant={child.level === 'lifesaver' ? 'gold' : 'blue'}>{t.levelLabel[child.level]}</Badge></td>
                      <td><ProgressBar value={pct} /></td>
                      <td>
                        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => navigate(`/teacher/children/${child.id}`)}>
                          {ui.enterProgress}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  )
}
