import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'

const LEVELS = [
  { value: 'beginner',      label: 'Anfänger' },
  { value: 'seepferdchen',  label: 'Seepferdchen' },
  { value: 'bobby',         label: 'Bobby' },
  { value: 'trixi',         label: 'Trixi' },
  { value: 'bronze',        label: 'Bronze' },
  { value: 'silber',        label: 'Silber' },
  { value: 'gold',          label: 'Gold' },
]

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

function generateSwimCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'SWIM-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function InstructorSwimCourses() {
  const { profile } = useAuth()
  const [courses,    setCourses]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showKids,   setShowKids]   = useState(null)   // course whose kids are shown
  const [kids,       setKids]       = useState([])
  const [kidsLoading, setKidsLoading] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)   // course to delete
  const [copiedId,   setCopiedId]   = useState(null)

  // ── Create form state ──────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', level: 'beginner', weekday: 'Montag',
    time: '', location: '', swim_code: generateSwimCode(),
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { if (profile) loadCourses() }, [profile?.id])

  async function loadCourses() {
    setLoading(true)
    const { data } = await supabase
      .from('swim_courses')
      .select('*')
      .eq('instructor_id', profile.id)
      .order('created_at', { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  async function handleCreate() {
    if (!form.name.trim()) { setFormError('Kursname fehlt.'); return }
    setSaving(true)
    setFormError('')
    const { error } = await supabase.from('swim_courses').insert({
      instructor_id: profile.id,
      name:      form.name.trim(),
      level:     form.level,
      weekday:   form.weekday,
      time:      form.time.trim(),
      location:  form.location.trim(),
      swim_code: form.swim_code,
    })
    if (error) {
      setFormError(error.message)
      setSaving(false)
      return
    }
    setShowCreate(false)
    setForm({ name: '', level: 'beginner', weekday: 'Montag', time: '', location: '', swim_code: generateSwimCode() })
    loadCourses()
    setSaving(false)
  }

  async function handleDelete(course) {
    await supabase.from('swim_courses').delete().eq('id', course.id)
    setConfirmDel(null)
    loadCourses()
  }

  async function openKids(course) {
    setShowKids(course)
    setKidsLoading(true)
    const { data } = await supabase
      .from('children')
      .select('id, first_name, last_name, swim_payment_status, created_at')
      .eq('swim_course_id', course.id)
      .order('created_at', { ascending: true })
    setKids(data || [])
    setKidsLoading(false)
  }

  function copyCode(code, id) {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function shareWhatsApp(course) {
    const text = `🏊 Schwimmkurs: *${course.name}*\n📅 ${course.weekday}${course.time ? ' ' + course.time : ''}${course.location ? '\n📍 ' + course.location : ''}\n\nAnmeldecode: *${course.swim_code}*\n\nJetzt unter swimpass.lu anmelden!`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-content">
      <style>{`
        .sc-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .sc-title  { font-size:20px; font-weight:700; color:var(--text); }
        .sc-card   { background:var(--card); border:1px solid var(--border); border-radius:16px;
                     padding:16px 18px; margin-bottom:12px; }
        .sc-course-name { font-size:16px; font-weight:700; color:var(--text); margin-bottom:4px; }
        .sc-meta        { font-size:12px; color:var(--muted); margin-bottom:12px; display:flex; flex-wrap:wrap; gap:6px; }
        .sc-meta-chip   { background:rgba(255,255,255,.06); border:1px solid var(--border);
                          border-radius:20px; padding:2px 10px; white-space:nowrap; }
        .sc-code-row    { display:flex; align-items:center; gap:8px; margin-bottom:10px;
                          background:rgba(0,150,199,.12); border:1px solid rgba(72,202,228,.3);
                          border-radius:10px; padding:10px 12px; }
        .sc-code-value  { font-family:monospace; font-size:15px; font-weight:700; color:var(--aqua);
                          letter-spacing:1px; flex:1; }
        .sc-action-row  { display:flex; gap:8px; flex-wrap:wrap; }
        .sc-btn         { font-size:12px; padding:6px 12px; border-radius:8px; border:1px solid var(--border);
                          background:rgba(255,255,255,.06); color:var(--text); cursor:pointer;
                          display:flex; align-items:center; gap:5px; transition:background .15s; }
        .sc-btn:hover   { background:rgba(255,255,255,.12); }
        .sc-btn.danger  { border-color:rgba(239,68,68,.4); color:#EF4444; }
        .sc-btn.danger:hover { background:rgba(239,68,68,.12); }
        .sc-btn.whatsapp { border-color:rgba(37,211,102,.4); color:#25D366; }
        .sc-btn.whatsapp:hover { background:rgba(37,211,102,.1); }
        .sc-empty { text-align:center; padding:48px 20px; opacity:.5; }
        .sc-kids-row  { display:flex; align-items:center; justify-content:space-between;
                        padding:10px 0; border-bottom:1px solid var(--border); }
        .sc-kids-row:last-child { border-bottom:none; }
        .sc-badge-paid    { background:rgba(34,197,94,.15); color:#22C55E; border:1px solid rgba(34,197,94,.3);
                            border-radius:20px; padding:2px 8px; font-size:11px; font-weight:600; }
        .sc-badge-pending { background:rgba(244,165,26,.12); color:var(--gold); border:1px solid rgba(244,165,26,.3);
                            border-radius:20px; padding:2px 8px; font-size:11px; font-weight:600; }
      `}</style>

      <div className="sc-header">
        <div className="sc-title">🏊 Schwimmkurse</div>
        <button
          className="btn btn-primary"
          style={{ fontSize:13, padding:'8px 14px' }}
          onClick={() => setShowCreate(true)}
        >
          + Kurs erstellen
        </button>
      </div>

      {loading ? (
        <div className="sc-empty">Lädt…</div>
      ) : courses.length === 0 ? (
        <div className="sc-empty">
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏊</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Noch keine Schwimmkurse</div>
          <div style={{ fontSize: 13 }}>Erstelle deinen ersten Kurs und teile den Code mit Eltern.</div>
        </div>
      ) : (
        courses.map(course => (
          <div key={course.id} className="sc-card">
            <div className="sc-course-name">{course.name}</div>
            <div className="sc-meta">
              {course.level && <span className="sc-meta-chip">📊 {LEVELS.find(l => l.value === course.level)?.label || course.level}</span>}
              {course.weekday && <span className="sc-meta-chip">📅 {course.weekday}{course.time ? ' · ' + course.time : ''}</span>}
              {course.location && <span className="sc-meta-chip">📍 {course.location}</span>}
            </div>

            <div className="sc-code-row">
              <span className="sc-code-value">{course.swim_code}</span>
              <button
                className="sc-btn"
                onClick={() => copyCode(course.swim_code, course.id)}
                title="Kopieren"
              >
                {copiedId === course.id ? '✓ Kopiert' : '📋 Kopieren'}
              </button>
              <button
                className="sc-btn whatsapp"
                onClick={() => shareWhatsApp(course)}
                title="WhatsApp"
              >
                📲 WhatsApp
              </button>
            </div>

            <div className="sc-action-row">
              <button className="sc-btn" onClick={() => openKids(course)}>
                👧 Teilnehmer
              </button>
              <button className="sc-btn danger" onClick={() => setConfirmDel(course)}>
                🗑 Löschen
              </button>
            </div>
          </div>
        ))
      )}

      {/* ── Create modal ─────────────────────────────────────────────────────── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>🏊 Neuer Schwimmkurs</div>

          <div className="form-group" style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Kursname *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="z.B. Anfängerkurs Montag"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Stufe</label>
              <select
                value={form.level}
                onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                style={{ width: '100%' }}
              >
                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Wochentag</label>
              <select
                value={form.weekday}
                onChange={e => setForm(f => ({ ...f, weekday: e.target.value }))}
                style={{ width: '100%' }}
              >
                {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Uhrzeit</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>Ort</label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="z.B. Hallenbad Kockelscheuer"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Code preview */}
          <div style={{
            background: 'rgba(0,150,199,.1)', border: '1px solid rgba(72,202,228,.25)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Einladungscode</div>
              <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--aqua)', letterSpacing: 1 }}>{form.swim_code}</div>
            </div>
            <button
              className="sc-btn"
              onClick={() => setForm(f => ({ ...f, swim_code: generateSwimCode() }))}
              style={{ fontSize: 11 }}
            >
              🔄 Neu
            </button>
          </div>

          {formError && <div className="error-msg" style={{ marginBottom: 10 }}>{formError}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Abbrechen</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={saving}>
              {saving ? 'Speichern…' : 'Kurs erstellen'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Kids modal ───────────────────────────────────────────────────────── */}
      <Modal open={!!showKids} onClose={() => setShowKids(null)}>
        <div style={{ padding: '4px 0', minWidth: 260 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            👧 Teilnehmer
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            {showKids?.name}
          </div>
          {kidsLoading ? (
            <div style={{ textAlign: 'center', padding: 20, opacity: .5 }}>Lädt…</div>
          ) : kids.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, opacity: .5, fontSize: 13 }}>
              Noch keine Teilnehmer angemeldet.
            </div>
          ) : (
            kids.map(kid => (
              <div key={kid.id} className="sc-kids-row">
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {kid.first_name} {kid.last_name}
                </div>
                <span className={kid.swim_payment_status === 'paid' ? 'sc-badge-paid' : 'sc-badge-pending'}>
                  {kid.swim_payment_status === 'paid' ? '✓ Bezahlt' : '⏳ Ausstehend'}
                </span>
              </div>
            ))
          )}
          <button className="btn btn-ghost btn-full" style={{ marginTop: 14 }} onClick={() => setShowKids(null)}>
            Schließen
          </button>
        </div>
      </Modal>

      {/* ── Delete confirm modal ─────────────────────────────────────────────── */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)}>
        <div style={{ padding: '8px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
          <p style={{ marginBottom: 6 }}>Kurs <strong>{confirmDel?.name}</strong> löschen?</p>
          <p style={{ fontSize: 12, opacity: .6, marginBottom: 20 }}>
            Der Code wird ungültig. Bereits angemeldete Kinder bleiben erhalten.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Abbrechen</button>
            <button className="btn btn-danger" onClick={() => handleDelete(confirmDel)}>Löschen</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
