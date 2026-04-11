import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'

const STATUS_LABEL = { open: 'Offen', exam_done: 'Examen absolviert', completed: 'Abgeschlossen' }
const STATUS_VARIANT = { open: 'blue', exam_done: 'gold', completed: 'green' }
const LEVEL_LABEL = { junior: 'Junior Lifesaver', lifesaver: 'Lifesaver', both: 'JL & Lifesaver' }

const EMPTY_FORM = {
  name: '', level: 'junior', location: '', exam_date: '',
  instructor_name: '', instructor_firstname: '', instructor_email: '',
  instructor_phone: '', instructor_address: '',
}

export default function Sauvetage() {
  const { profile, isDemo } = useAuth()
  const { showToast } = useApp()
  const navigate = useNavigate()
  const isInstructor = profile?.role === 'instructor'

  const [courses, setCourses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    if (isDemo) { setCourses([]); return }
    let q = supabase.from('sauvetage_courses').select('*, profiles(name)').eq('school_id', profile.school_id).order('created_at', { ascending: false })
    if (isInstructor) q = q.eq('instructor_id', profile.id)
    const { data } = await q
    setCourses(data || [])
  }

  async function handleCreate() {
    if (!form.name) return
    setSaving(true)
    const { error } = await supabase.from('sauvetage_courses').insert({
      school_id: profile.school_id,
      instructor_id: profile.id,
      name: form.name,
      level: form.level,
      location: form.location || null,
      exam_date: form.exam_date || null,
      instructor_name: form.instructor_name || null,
      instructor_firstname: form.instructor_firstname || null,
      instructor_email: form.instructor_email || null,
      instructor_phone: form.instructor_phone || null,
      instructor_address: form.instructor_address || null,
    })
    setSaving(false)
    if (error) { showToast('Fehler beim Erstellen', 'error'); return }
    showToast(`Kurs "${form.name}" erstellt`)
    setShowModal(false)
    setForm(EMPTY_FORM)
    load()
  }

  const basePath = isInstructor ? '/instructor' : '/admin'

  return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">🏅 Sauvetage</div>
          <div className="page-sub">{courses.length} Kurse · FLNS Rettungsschwimmen</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Kurs erstellen</button>
        </div>
      </div>

      {/* Download blank forms */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <a href="/Sauvetage_Formulaire_B1.xlsx" download className="btn btn-ghost" style={{ fontSize: 12 }}>
          ⬇ Formulaire B1 (leer)
        </a>
        <a href="/Sauvetage_Formulaire_B2.xlsx" download className="btn btn-ghost" style={{ fontSize: 12 }}>
          ⬇ Formulaire B2 (leer)
        </a>
      </div>

      {courses.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏅</div>
          Noch keine Sauvetage-Kurse erstellt.
        </div>
      ) : (
        <div className="grid-3">
          {courses.map(c => (
            <div key={c.id} className="class-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`${basePath}/sauvetage/${c.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div className="cc-name">{c.name}</div>
                <Badge variant={STATUS_VARIANT[c.status] || 'blue'}>{STATUS_LABEL[c.status]}</Badge>
              </div>
              <div className="cc-meta">
                {LEVEL_LABEL[c.level]} · {c.location || '—'}<br />
                {c.exam_date ? new Date(c.exam_date).toLocaleDateString('de-DE') : 'Kein Datum'}
              </div>
              {c.instructor_name && (
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                  Instrukteur: {c.instructor_firstname} {c.instructor_name}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {c.b1_sent_at && <span style={{ fontSize: 10, background: 'rgba(0,180,216,.1)', color: 'var(--aqua)', padding: '2px 8px', borderRadius: 99 }}>B1 ✓</span>}
                {c.b2_sent_at && <span style={{ fontSize: 10, background: 'rgba(34,197,94,.1)', color: 'var(--green)', padding: '2px 8px', borderRadius: 99 }}>B2 ✓</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create course modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setForm(EMPTY_FORM) }}
        title="Sauvetage Kurs erstellen"
        subtitle="Neuen Rettungsschwimm-Kurs anlegen"
        actions={<>
          <button className="btn btn-ghost" onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }}>Abbrechen</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !form.name}>
            {saving ? <span className="spinner" /> : 'Erstellen'}
          </button>
        </>}
      >
        <div className="form-group">
          <label>Kursname</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Junior Lifesaver Kurs 2026" />
        </div>
        <div className="form-row">
          <div className="form-group half">
            <label>Niveau</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
              <option value="junior">Junior Lifesaver</option>
              <option value="lifesaver">Lifesaver</option>
              <option value="both">JL & Lifesaver</option>
            </select>
          </div>
          <div className="form-group half">
            <label>Datum Examen</label>
            <input type="date" value={form.exam_date} onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label>Ort</label>
          <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Schwimmbad Bonnevoie" />
        </div>

        <div style={{ marginTop: 4, marginBottom: 10, fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Instrukteur-Info (für B1/B2 Formulare)
        </div>
        <div className="form-row">
          <div className="form-group half">
            <label>Nachname</label>
            <input value={form.instructor_name} onChange={e => setForm(f => ({ ...f, instructor_name: e.target.value }))} placeholder="Müller" />
          </div>
          <div className="form-group half">
            <label>Vorname</label>
            <input value={form.instructor_firstname} onChange={e => setForm(f => ({ ...f, instructor_firstname: e.target.value }))} placeholder="Klaus" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group half">
            <label>E-Mail</label>
            <input type="email" value={form.instructor_email} onChange={e => setForm(f => ({ ...f, instructor_email: e.target.value }))} placeholder="instrukteur@email.lu" />
          </div>
          <div className="form-group half">
            <label>Telefon</label>
            <input value={form.instructor_phone} onChange={e => setForm(f => ({ ...f, instructor_phone: e.target.value }))} placeholder="+352 621 000 000" />
          </div>
        </div>
        <div className="form-group">
          <label>Adresse</label>
          <input value={form.instructor_address} onChange={e => setForm(f => ({ ...f, instructor_address: e.target.value }))} placeholder="1 Rue de la Piscine, L-1234 Luxembourg" />
        </div>
      </Modal>
    </div>
  )
}
