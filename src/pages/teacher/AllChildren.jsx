import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { getProgress } from '../../lib/criteria'
import ProgressBar from '../../components/ProgressBar'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'

export default function AllChildren() {
  const { profile } = useAuth()
  const { t } = useApp()
  const navigate = useNavigate()
  const ui = t.ui

  const [children, setChildren] = useState([])
  const [classes, setClasses] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    const [{ data: kids }, { data: cls }] = await Promise.all([
      supabase.from('children').select('*, progress(criteria_key)').eq('school_id', profile.school_id).order('first_name'),
      supabase.from('classes').select('*').eq('school_id', profile.school_id),
    ])
    setChildren(kids || [])
    setClasses(cls || [])
  }

  const filtered = children.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 16 }}>
        <div>
          <div className="page-title">{ui.allChildren}</div>
          <div className="page-sub">{filtered.length} {ui.children}</div>
        </div>
      </div>

      <div className="search-bar">
        <span style={{ fontSize: 14 }}>🔍</span>
        <input type="text" placeholder={ui.search} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>{ui.noChildren}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{ui.name}</th>
                <th>{ui.level}</th>
                <th>{ui.class}</th>
                <th>{ui.progress}</th>
                <th>{ui.action}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(child => {
                const done = (child.progress || []).map(p => p.criteria_key)
                const pct = getProgress(done, child.level)
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
                      <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => navigate(`/teacher/children/${child.id}`)}>
                        {ui.enterProgress}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
