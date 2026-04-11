import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { getProgress } from '../../lib/criteria'
import { DEMO_CLASSES, DEMO_CHILDREN } from '../../lib/demo'
import ProgressBar from '../../components/ProgressBar'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function generateParentCode() {
  return 'LETZSCHWAMM' + Math.floor(100000 + Math.random() * 900000)
}

export default function Classes() {
  const { profile, isDemo } = useAuth()
  const { t, showToast } = useApp()
  const ui = t.ui

  const [classes, setClasses]       = useState([])
  const [children, setChildren]     = useState([])
  const [showModal, setShowModal]   = useState(false)
  const [codeModal, setCodeModal]   = useState(null) // { name, code }
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, name }
  const [deleting, setDeleting]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [copied, setCopied]         = useState(false)
  const [form, setForm] = useState({ name: '', day: 'Wednesday', time: '17:00', level: 'bobby' })

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    if (isDemo) { setClasses(DEMO_CLASSES); setChildren(DEMO_CHILDREN); return }
    const schoolId = profile.school_id
    const [{ data: cls }, { data: kids }] = await Promise.all([
      supabase.from('classes').select('*, profiles(id, name)').eq('school_id', schoolId),
      supabase.from('children').select('*, progress(criteria_key)').eq('school_id', schoolId),
    ])
    setClasses(cls || [])
    setChildren(kids || [])
  }

  function classAvgProgress(classId) {
    const kids = children.filter(c => c.class_id === classId)
    if (!kids.length) return 0
    return Math.round(kids.reduce((s, c) => {
      const done = (c.progress || []).map(p => p.criteria_key)
      return s + getProgress(done, c.level)
    }, 0) / kids.length)
  }

  async function handleAdd() {
    if (!form.name) return
    setSaving(true)
    const parentCode = generateParentCode()

    if (isDemo) {
      const newClass = { id: `cls-${Date.now()}`, school_id: profile.school_id, teacher_id: profile.id, name: form.name, day: form.day, time: form.time, level: form.level, parent_code: parentCode, profiles: { name: profile.name } }
      setClasses(prev => [...prev, newClass])
      setShowModal(false)
      setForm({ name: '', day: 'Wednesday', time: '17:00', level: 'bobby' })
      setSaving(false)
      setCodeModal({ name: form.name, code: parentCode })
      return
    }

    const { error } = await supabase.from('classes').insert({
      school_id: profile.school_id,
      teacher_id: profile.id,
      name: form.name,
      day: form.day,
      time: form.time,
      level: form.level,
      parent_code: parentCode,
    })
    setSaving(false)
    if (error) {
      console.error('Klasse erstellen Fehler:', error)
      showToast(error.message || t.toast.error, 'error')
      return
    }
    setShowModal(false)
    setForm({ name: '', day: 'Wednesday', time: '17:00', level: 'bobby' })
    load()
    setCodeModal({ name: form.name, code: parentCode })
  }

  async function handleDeleteClass() {
    if (!confirmDelete) return
    setDeleting(true)
    if (!isDemo) {
      // Unassign children from class, then delete class
      await supabase.from('children').update({ class_id: null }).eq('class_id', confirmDelete.id)
      await supabase.from('classes').delete().eq('id', confirmDelete.id)
    }
    setClasses(prev => prev.filter(c => c.id !== confirmDelete.id))
    showToast(`Kurs "${confirmDelete.name}" wurde gelöscht`)
    setConfirmDelete(null)
    setDeleting(false)
  }

  function handleCopy(code) {
    const msg = `Letzschwamm Anmeldung für Ihren Kurs:\nCode: ${code}\nJetzt anmelden: ${window.location.origin}/onboarding`
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">{ui.allClasses}</div>
          <div className="page-sub">{classes.length} {ui.allClasses.toLowerCase()}</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ {ui.addClass}</button>
        </div>
      </div>

      <div className="grid-3">
        {classes.map(cls => {
          const kids = children.filter(c => c.class_id === cls.id)
          const avg  = classAvgProgress(cls.id)
          return (
            <div key={cls.id} className="class-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div className="cc-name">{cls.name}</div>
                <Badge variant={cls.level === 'lifesaver' ? 'gold' : 'blue'}>{t.levelLabel[cls.level]}</Badge>
              </div>
              <div className="cc-meta">{t.days[cls.day] || cls.day} {cls.time} · {cls.profiles?.name || '—'}</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ui.children}: <strong style={{ color: 'var(--text)' }}>{kids.length}</strong></div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Ø: <strong style={{ color: 'var(--text)' }}>{avg}%</strong></div>
              </div>
              <ProgressBar value={avg} />
              {cls.parent_code && (
                <div
                  style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(0,150,199,.1)', border: '1px solid rgba(0,150,199,.25)', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => setCodeModal({ name: cls.name, code: cls.parent_code })}
                  title="Code anzeigen"
                >
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Eltern-Code</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--aqua)', letterSpacing: '0.5px' }}>{cls.parent_code}</div>
                </div>
              )}
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-danger"
                  style={{ padding: '4px 10px', fontSize: 11 }}
                  onClick={() => setConfirmDelete({ id: cls.id, name: cls.name })}
                >
                  🗑 Kurs löschen
                </button>
              </div>
            </div>
          )
        })}
        {classes.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 13, gridColumn: '1/-1', padding: 24, textAlign: 'center' }}>Noch keine Klassen erstellt.</div>
        )}
      </div>

      {/* Confirm delete class modal */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Kurs löschen"
        subtitle={`Wirklich löschen: ${confirmDelete?.name}?`}
        actions={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Abbrechen</button>
          <button className="btn btn-danger" onClick={handleDeleteClass} disabled={deleting}>
            {deleting ? <span className="spinner" /> : 'Endgültig löschen'}
          </button>
        </>}
      >
        <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--muted)' }}>
          Diese Aktion kann nicht rückgängig gemacht werden. Alle zugewiesenen Kinder werden der Klasse entzogen (aber nicht gelöscht).
        </div>
      </Modal>

      {/* Add class modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={ui.addClass} subtitle="Neuen Kurs anlegen"
        actions={<>
          <button className="btn btn-ghost" onClick={() => setShowModal(false)}>{ui.cancel}</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? <span className="spinner" /> : ui.save}</button>
        </>}
      >
        <div className="form-group"><label>{ui.className}</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Junior Lifesaver A" /></div>
        <div className="form-row">
          <div className="form-group half">
            <label>{ui.weekday}</label>
            <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}>
              {DAYS.map(d => <option key={d} value={d}>{t.days[d]}</option>)}
            </select>
          </div>
          <div className="form-group half"><label>{ui.time}</label><input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
        </div>
        <div className="form-group">
          <label>{ui.selectLevel}</label>
          <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
            <option value="bobby">Bobby</option>
            <option value="seepferdchen">Seepferdchen</option>
            <option value="trixi">Trixi</option>
            <option value="bronze">Bronze</option>
            <option value="silber">Silber</option>
            <option value="gold">Gold</option>
            <option disabled>──────────────</option>
            <option value="junior">Junior Lifesaver</option>
            <option value="lifesaver">Lifesaver</option>
          </select>
        </div>
        <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(0,150,199,.08)', border: '1px solid rgba(0,150,199,.2)', borderRadius: 10, fontSize: 12, color: 'var(--muted)' }}>
          Nach dem Speichern erhalten Sie automatisch einen Eltern-Code zum Teilen via WhatsApp.
        </div>
      </Modal>

      {/* Code reveal modal */}
      {codeModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(2,15,26,.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
        }} onClick={() => { setCodeModal(null); setCopied(false) }}>
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20,
            padding: 32, maxWidth: 400, width: '100%', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Kurs erstellt!</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{codeModal.name}</div>

            <div style={{
              background: 'linear-gradient(135deg,rgba(0,150,199,.18),rgba(72,202,228,.08))',
              border: '1.5px solid rgba(72,202,228,.35)', borderRadius: 14, padding: '20px 16px', marginBottom: 20,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Eltern-Anmeldecode</div>
              <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: 'var(--aqua)', letterSpacing: '1px', wordBreak: 'break-all' }}>{codeModal.code}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Eltern geben diesen Code bei der Anmeldung ein</div>
            </div>

            <button
              className="btn btn-primary btn-full"
              style={{ marginBottom: 10 }}
              onClick={() => handleCopy(codeModal.code)}
            >
              {copied ? '✓ Kopiert!' : '📋 WhatsApp-Nachricht kopieren'}
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => { setCodeModal(null); setCopied(false) }}>Schließen</button>
          </div>
        </div>
      )}
    </div>
  )
}
