import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { getProgress } from '../../lib/criteria'
import CriteriaList from '../../components/CriteriaList'
import ProgressBar from '../../components/ProgressBar'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'
import BackButton from '../../components/BackButton'
import { BADGE_META } from '../../lib/criteria'

export default function ChildDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const { t, showToast } = useApp()
  const navigate = useNavigate()
  const ui = t.ui

  const [child, setChild]       = useState(null)
  const [classes, setClasses]   = useState([])
  const [doneKeys, setDoneKeys] = useState([])
  const [notes, setNotes]       = useState([])
  const [noteText, setNoteText] = useState('')
  const [loading, setLoading]   = useState(true)
  const [notifying, setNotifying] = useState(false)

  const backPath = profile?.role === 'teacher' ? '/teacher/children' : '/admin/children'

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const [{ data: kid }, { data: cls }, { data: prog }, { data: nts }] = await Promise.all([
      supabase.from('children').select('*').eq('id', id).maybeSingle(),
      supabase.from('classes').select('*').eq('school_id', profile.school_id),
      supabase.from('progress').select('criteria_key').eq('child_id', id),
      supabase.from('notes').select('*, profiles(name)').eq('child_id', id).order('created_at', { ascending: false }),
    ])
    setChild(kid)
    setClasses(cls || [])
    setDoneKeys((prog || []).map(p => p.criteria_key))
    setNotes(nts || [])
    setLoading(false)
  }

  async function handleToggle(key, checked) {
    if (checked) {
      await supabase.from('progress').upsert({ child_id: id, criteria_key: key, teacher_id: profile.id, passed_at: new Date().toISOString() }, { onConflict: 'child_id,criteria_key' })
      setDoneKeys(prev => [...prev, key])
    } else {
      await supabase.from('progress').delete().eq('child_id', id).eq('criteria_key', key)
      setDoneKeys(prev => prev.filter(k => k !== key))
    }
  }

  async function handleSaveNote() {
    if (!noteText.trim()) return
    await supabase.from('notes').insert({ child_id: id, teacher_id: profile.id, content: noteText })
    showToast(t.toast.noteSaved)
    setNoteText('')
    load()
  }

  async function handleNotify() {
    if (!child) return
    setNotifying(true)
    const pct = getProgress(doneKeys, child.level)
    await supabase.functions.invoke('send-email', {
      body: { childId: id, schoolId: profile.school_id, teacherName: profile.name, childName: `${child.first_name} ${child.last_name}`, progress: pct, note: notes[0]?.content || '—' }
    })
    setNotifying(false)
    showToast(t.toast.notified(`${child.first_name} ${child.last_name}`, pct))
  }

  if (loading) return <div className="page-content" style={{ color: 'var(--muted)' }}>Laden...</div>
  if (!child)  return <div className="page-content" style={{ color: 'var(--muted)' }}>Kind nicht gefunden.</div>

  const pct = getProgress(doneKeys, child.level)
  const cls = classes.find(c => c.id === child.class_id)

  return (
    <div className="page-content">
      <BackButton
        to={backPath}
        label={profile?.role === 'teacher' ? 'Alle Kinder' : 'Kinder & Erwachsene'}
      />

      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">{child.first_name} {child.last_name}</div>
          <div className="page-sub">{ui.swimPass}</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={() => navigate(`${profile?.role === 'teacher' ? '/teacher' : '/admin'}/children/${id}/pass`)}>
            🎫 Schwimmpass
          </button>
          <button className="btn btn-success" onClick={handleNotify} disabled={notifying}>
            {notifying ? <span className="spinner" /> : ui.notify}
          </button>
        </div>
      </div>

      <div className="child-detail-header">
        <Avatar name={`${child.first_name} ${child.last_name}`} size={60} radius={16} />
        <div style={{ flex: 1 }}>
          <div className="child-detail-name">{child.first_name} {child.last_name}</div>
          <div className="child-detail-meta">
            {cls?.name || '—'} · {child.birth_date ? new Date(child.birth_date).toLocaleDateString('de-DE') : '—'}
          </div>
          <div style={{ marginTop: 8 }}>
            <Badge level={child.level}>{t.levelLabel[child.level] || child.level}</Badge>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--aqua)' }}>{pct}%</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ui.overallProgress}</div>
        </div>
      </div>

      <ProgressBar value={pct} style={{ marginBottom: 24 }} />

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="sec-header" style={{ marginBottom: 12 }}>
            <div className="sec-title">🏊 {ui.swimPass}</div>
          </div>
          <CriteriaList
            level={child.level}
            doneKeys={doneKeys}
            onToggle={handleToggle}
            readOnly={profile?.role === 'parent'}
          />
        </div>

        <div>
          <div className="sec-header" style={{ marginBottom: 12 }}>
            <div className="sec-title">{ui.noteLabel}</div>
          </div>
          <div className="card" style={{ marginBottom: 14 }}>
            <textarea placeholder={ui.notePlaceholder} value={noteText} onChange={e => setNoteText(e.target.value)} style={{ marginBottom: 10 }} />
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSaveNote} disabled={!noteText.trim()}>
              {ui.sendNote}
            </button>
            {noteText && (
              <div className="notif-preview" style={{ marginTop: 12 }}>
                <div className="notif-preview-title">{ui.notifPreview}</div>
                <div className="notif-preview-text">{profile?.name}: „{noteText}" — {pct}%</div>
              </div>
            )}
          </div>

          <div className="sec-title" style={{ fontSize: 13, marginBottom: 8 }}>Notizen</div>
          {notes.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ui.noNotes}</div>
            : notes.slice(0, 5).map(note => (
              <div key={note.id} className="card" style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 12, lineHeight: 1.5 }}>{note.content}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                  {note.profiles?.name || '—'} · {new Date(note.created_at).toLocaleString('de-DE')}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
