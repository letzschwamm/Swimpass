import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import BackButton from '../../components/BackButton'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'

const STRIPE_BADGE_LINK = import.meta.env.VITE_STRIPE_SAUVETAGE_LINK || 'https://buy.stripe.com/aFa9AT2gxeZUfOkbVF7kc01'

const STATUS_LABEL   = { registered: 'Angemeldet', passed_junior: 'JL bestanden', passed_lifesaver: 'LF bestanden', failed: 'Nicht bestanden' }
const STATUS_VARIANT = { registered: 'blue', passed_junior: 'green', passed_lifesaver: 'gold', failed: 'muted' }
const LEVEL_LABEL    = { junior: 'Junior Lifesaver', lifesaver: 'Lifesaver', both: 'JL & Lifesaver' }

const EMPTY_P = { first_name: '', last_name: '', birth_date: '', email: '', address: '' }

const JL_CRITERIA = [
  { key: 'jl_jump',       label: 'Sprung ins Wasser vom Beckenrand' },
  { key: 'jl_swim_back',  label: 'Rückenschwimmen 100m' },
  { key: 'jl_swim_crawl', label: 'Kraulschwimmen 100m' },
  { key: 'jl_dive',       label: 'Tauchen 5m unter Wasser' },
  { key: 'jl_tow',        label: 'Schleppen 10m (Kinnschleppgriff)' },
  { key: 'jl_float',      label: 'Auftreiben lassen (3 Min)' },
  { key: 'jl_rescue',     label: 'Verunfallten aus Wasser holen' },
  { key: 'jl_cpr',        label: 'Herz-Lungen-Wiederbelebung (HLW)' },
]
const LS_CRITERIA = [
  { key: 'ls_swim_200',    label: 'Schwimmen 200m' },
  { key: 'ls_dive',        label: 'Tauchen 10m unter Wasser' },
  { key: 'ls_jump_3m',     label: 'Sprung vom 3m Brett' },
  { key: 'ls_tow',         label: 'Schleppen 25m (Kinnschleppgriff)' },
  { key: 'ls_release',     label: 'Befreien aus Haltegriff' },
  { key: 'ls_rescue_deep', label: 'Bergen aus tiefem Wasser' },
  { key: 'ls_clothed',     label: 'Kleiderschwimmen 100m' },
  { key: 'ls_side_swim',   label: 'Seitenschwimmen 50m' },
  { key: 'ls_first_aid',   label: 'Erste Hilfe inkl. HLW' },
]

export default function SauvetageDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const { showToast } = useApp()
  const navigate = useNavigate()

  const [course, setCourse]           = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm]               = useState(EMPTY_P)
  const [saving, setSaving]           = useState(false)
  const [sendingB1, setSendingB1]     = useState(false)
  const [sendingB2, setSendingB2]     = useState(false)
  const [sendingPay, setSendingPay]   = useState(false)
  const [payResults, setPayResults]   = useState(null)
  const [selectedP, setSelectedP]     = useState(null)   // participant detail modal
  const [editStatus, setEditStatus]   = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  const basePath = profile?.role === 'instructor' ? '/instructor' : '/admin'

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from('sauvetage_courses').select('*').eq('id', id).single(),
      supabase.from('sauvetage_participants').select('*').eq('course_id', id).order('last_name'),
    ])
    setCourse(c)
    setParticipants(p || [])
    setLoading(false)
  }

  async function handleAddParticipant() {
    if (!form.first_name || !form.last_name) return
    setSaving(true)
    const { error } = await supabase.from('sauvetage_participants').insert({
      course_id: id,
      first_name: form.first_name,
      last_name: form.last_name,
      birth_date: form.birth_date || null,
      email: form.email || null,
      address: form.address || null,
    })
    setSaving(false)
    if (error) { showToast('Fehler beim Hinzufügen', 'error'); return }
    showToast(`${form.first_name} ${form.last_name} hinzugefügt`)
    setForm(EMPTY_P)
    setShowAddModal(false)
    load()
  }

  async function handleStatusChange(participantId, newStatus) {
    await supabase.from('sauvetage_participants').update({ status: newStatus }).eq('id', participantId)
    setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, status: newStatus } : p))
  }

  function openParticipant(p) {
    setSelectedP(p)
    setEditStatus(p.status)
  }

  async function handleSaveStatus() {
    setSavingStatus(true)
    await supabase.from('sauvetage_participants').update({ status: editStatus }).eq('id', selectedP.id)
    setParticipants(prev => prev.map(p => p.id === selectedP.id ? { ...p, status: editStatus } : p))
    setSelectedP(prev => ({ ...prev, status: editStatus }))
    setSavingStatus(false)
    showToast('Status gespeichert ✓')
  }

  async function handleCompetencyToggle(key, checked) {
    const updated = { ...(selectedP.competencies || {}), [key]: checked }
    await supabase.from('sauvetage_participants').update({ competencies: updated }).eq('id', selectedP.id)
    setSelectedP(prev => ({ ...prev, competencies: updated }))
    setParticipants(prev => prev.map(p => p.id === selectedP.id ? { ...p, competencies: updated } : p))
  }

  async function handleDeleteParticipant() {
    if (!confirmDelete) return
    await supabase.from('sauvetage_participants').delete().eq('id', confirmDelete.id)
    setParticipants(prev => prev.filter(p => p.id !== confirmDelete.id))
    showToast(`${confirmDelete.name} gelöscht`)
    setConfirmDelete(null)
  }

  async function handleB1() {
    setSendingB1(true)
    const { error, data } = await supabase.functions.invoke('send-b1', { body: { courseId: id } })
    setSendingB1(false)
    if (error || data?.error) { showToast(data?.error || 'Fehler beim Senden', 'error'); return }
    showToast('B1 Formular wurde per E-Mail gesendet ✓')
    load()
  }

  async function handleB2() {
    const passed = participants.filter(p => p.status === 'passed_junior' || p.status === 'passed_lifesaver')
    if (!passed.length) { showToast('Bitte zuerst Teilnehmer als bestanden markieren', 'error'); return }
    setSendingB2(true)
    const { error, data } = await supabase.functions.invoke('send-b2', { body: { courseId: id } })
    setSendingB2(false)
    if (error || data?.error) { showToast(data?.error || 'Fehler beim Senden', 'error'); return }
    showToast(`B2 Formular für ${data.count} Teilnehmer gesendet ✓`)
    load()
  }

  async function handleBadgePayment() {
    const withEmail = participants.filter(p =>
      (p.status === 'passed_junior' || p.status === 'passed_lifesaver') && p.payment_status === 'pending' && p.email
    )
    if (!withEmail.length) { showToast('Keine bestandenen Teilnehmer mit E-Mail und offener Zahlung', 'error'); return }
    setSendingPay(true)
    const { error, data } = await supabase.functions.invoke('send-badge-payment', { body: { courseId: id } })
    setSendingPay(false)
    if (error || data?.error) { showToast(data?.error || 'Fehler beim Senden', 'error'); return }
    setPayResults(data.results)
    load()
  }

  if (loading) return <div className="page-content" style={{ color: 'var(--muted)' }}>Laden...</div>
  if (!course)  return <div className="page-content" style={{ color: 'var(--muted)' }}>Kurs nicht gefunden.</div>

  const passed   = participants.filter(p => p.status === 'passed_junior' || p.status === 'passed_lifesaver')
  const pending  = participants.filter(p => p.status === 'registered')
  const failed   = participants.filter(p => p.status === 'failed')

  return (
    <div className="page-content">
      <BackButton to={`${basePath}/sauvetage`} label="Sauvetage Kurse" />

      {/* Header */}
      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">🏅 {course.name}</div>
          <div className="page-sub">
            {LEVEL_LABEL[course.level]} · {course.location || '—'} · {course.exam_date ? new Date(course.exam_date).toLocaleDateString('de-DE') : 'Kein Datum'}
          </div>
        </div>
      </div>

      {/* Instructor info card */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>
          Instrukteur-Info
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 13 }}>
          {[
            ['Nachname', course.instructor_name],
            ['Vorname', course.instructor_firstname],
            ['E-Mail', course.instructor_email],
            ['Telefon', course.instructor_phone],
            ['Adresse', course.instructor_address],
            ['Schwimmhalle', course.location],
            ['Adresse Schwimmhalle', course.venue_address],
          ].map(([label, val]) => (
            <div key={label}>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{label}: </span>
              <span style={{ fontWeight: 600 }}>{val || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={handleB1} disabled={sendingB1 || !participants.length}>
          {sendingB1 ? <span className="spinner" /> : '📋 B1 senden'}
          {course.b1_sent_at && <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--green)' }}>✓ {new Date(course.b1_sent_at).toLocaleDateString('de-DE')}</span>}
        </button>
        <button className="btn btn-ghost" onClick={handleB2} disabled={sendingB2}>
          {sendingB2 ? <span className="spinner" /> : '✅ B2 senden'}
          {course.b2_sent_at && <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--green)' }}>✓ {new Date(course.b2_sent_at).toLocaleDateString('de-DE')}</span>}
        </button>
        <button className="btn btn-primary" onClick={handleBadgePayment} disabled={sendingPay || !passed.filter(p => p.payment_status === 'pending' && p.email).length}>
          {sendingPay ? <span className="spinner" /> : '💳 Abzeichen bezahlen'}
        </button>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setShowAddModal(true)}>
          + Teilnehmer
        </button>
      </div>

      {/* Payment results */}
      {payResults && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Zahlungslinks gesendet:</div>
          {payResults.map((r, i) => (
            <div key={i} style={{ fontSize: 12, color: r.sent ? 'var(--green)' : 'var(--red)', marginBottom: 4 }}>
              {r.sent ? '✓' : '✗'} {r.name} ({r.email}) {r.error ? `— ${r.error}` : ''}
            </div>
          ))}
          <button className="btn btn-ghost" style={{ fontSize: 11, marginTop: 8 }} onClick={() => setPayResults(null)}>Schließen</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Gesamt', val: participants.length, color: 'var(--aqua)' },
          { label: 'Angemeldet', val: pending.length, color: 'var(--muted)' },
          { label: 'Bestanden', val: passed.length, color: 'var(--green)' },
          { label: 'Nicht bestanden', val: failed.length, color: 'var(--red)' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card" style={{ flex: 1, textAlign: 'center', padding: '12px 8px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'Syne, sans-serif' }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Participant table */}
      <div className="table-wrap">
        {participants.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Noch keine Teilnehmer. Klicke auf "+ Teilnehmer" um jemanden hinzuzufügen.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Geburtsdatum</th>
                <th>E-Mail</th>
                <th>Status</th>
                <th>Zahlung</th>
                <th>Ergebnis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {participants.map(p => (
                <tr key={p.id}>
                  <td>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                      onClick={() => openParticipant(p)}
                      title="Teilnehmer öffnen"
                    >
                      <Avatar name={`${p.first_name} ${p.last_name}`} size={28} radius={8} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.last_name}, {p.first_name}</div>
                        {p.address && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.address}</div>}
                        {(() => { const comp = p.competencies || {}; const keys = Object.keys(comp).filter(k => comp[k]); return keys.length > 0 ? <div style={{ fontSize: 10, color: 'var(--aqua)' }}>✓ {keys.length} Kompetenz{keys.length !== 1 ? 'en' : ''}</div> : null })()}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {p.birth_date ? new Date(p.birth_date).toLocaleDateString('de-DE') : '—'}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{p.email || '—'}</td>
                  <td>
                    <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                  </td>
                  <td>
                    {(p.status === 'passed_junior' || p.status === 'passed_lifesaver') && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: p.payment_status === 'paid' ? 'var(--green)' : 'var(--muted)' }}>
                          {p.payment_status === 'paid' ? '✓ Bezahlt' : '○ Offen'}
                        </span>
                        {p.payment_status !== 'paid' && (
                          <a
                            href={STRIPE_BADGE_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ fontSize: 10, padding: '3px 8px', textDecoration: 'none' }}
                            title="Abzeichen bezahlen"
                          >
                            Abzeichen bezahlen 🏅
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      value={p.status}
                      onChange={e => handleStatusChange(p.id, e.target.value)}
                      style={{
                        fontSize: 11, padding: '4px 8px', background: 'rgba(255,255,255,.07)',
                        border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
                        fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                      }}
                    >
                      <option value="registered">Angemeldet</option>
                      <option value="passed_junior">JL bestanden</option>
                      <option value="passed_lifesaver">LF bestanden</option>
                      <option value="failed">Nicht bestanden</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        title="Teilnehmer öffnen"
                        onClick={() => openParticipant(p)}
                      >
                        ✏️
                      </button>
                      {p.access_token && (
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          title="Teilnehmer-Statuslink kopieren"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/p/${p.access_token}`)
                            showToast('Link kopiert')
                          }}
                        >
                          🔗
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => setConfirmDelete({ id: p.id, name: `${p.first_name} ${p.last_name}` })}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add participant modal */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setForm(EMPTY_P) }}
        title="Teilnehmer hinzufügen"
        subtitle="Person zum Sauvetage-Kurs eintragen"
        actions={<>
          <button className="btn btn-ghost" onClick={() => { setShowAddModal(false); setForm(EMPTY_P) }}>Abbrechen</button>
          <button className="btn btn-primary" onClick={handleAddParticipant} disabled={saving || !form.first_name || !form.last_name}>
            {saving ? <span className="spinner" /> : 'Hinzufügen'}
          </button>
        </>}
      >
        <div className="form-row">
          <div className="form-group half">
            <label>Vorname</label>
            <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Emma" />
          </div>
          <div className="form-group half">
            <label>Nachname</label>
            <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Müller" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group half">
            <label>Geburtsdatum</label>
            <input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} />
          </div>
          <div className="form-group half">
            <label>E-Mail</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="person@email.lu" />
          </div>
        </div>
        <div className="form-group">
          <label>Adresse (optional)</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="1 Rue de la Piscine, L-1234 Luxembourg" />
        </div>
      </Modal>

      {/* Confirm delete */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Teilnehmer löschen"
        subtitle={`Wirklich löschen: ${confirmDelete?.name}?`}
        actions={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Abbrechen</button>
          <button className="btn btn-danger" onClick={handleDeleteParticipant}>Löschen</button>
        </>}
      >
        <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--muted)' }}>
          Diese Aktion kann nicht rückgängig gemacht werden.
        </div>
      </Modal>

      {/* Participant detail modal */}
      {selectedP && (() => {
        const comp = selectedP.competencies || {}
        const level = course?.level
        const criteria = level === 'lifesaver' ? LS_CRITERIA
          : level === 'both' ? [...JL_CRITERIA, ...LS_CRITERIA]
          : JL_CRITERIA
        const checkedCount = criteria.filter(c => comp[c.key]).length
        return (
          <Modal
            open={!!selectedP}
            onClose={() => setSelectedP(null)}
            title={`${selectedP.first_name} ${selectedP.last_name}`}
            subtitle={`${selectedP.birth_date ? new Date(selectedP.birth_date).toLocaleDateString('de-DE') : '—'}${selectedP.email ? ' · ' + selectedP.email : ''}`}
            actions={<button className="btn btn-ghost" onClick={() => setSelectedP(null)}>Schließen</button>}
          >
            {/* Status */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Status</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  style={{
                    flex: 1, fontSize: 13, padding: '8px 12px',
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 10, color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <option value="registered">Angemeldet</option>
                  <option value="passed_junior">JL bestanden</option>
                  <option value="passed_lifesaver">LF bestanden</option>
                  <option value="failed">Nicht bestanden</option>
                </select>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveStatus}
                  disabled={savingStatus || editStatus === selectedP.status}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {savingStatus ? <span className="spinner" /> : 'Speichern'}
                </button>
              </div>
            </div>

            {/* Competencies */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  FLNS Kompetenzen
                </div>
                <div style={{ fontSize: 11, color: 'var(--aqua)', fontWeight: 600 }}>
                  {checkedCount} / {criteria.length}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {criteria.map((c, i) => (
                  <label
                    key={c.key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                      cursor: 'pointer', borderBottom: i < criteria.length - 1 ? '1px solid var(--border)' : 'none',
                      background: comp[c.key] ? 'rgba(34,197,94,.06)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!comp[c.key]}
                      onChange={e => handleCompetencyToggle(c.key, e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--aqua)', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: comp[c.key] ? 'var(--text)' : 'var(--muted)', fontWeight: comp[c.key] ? 600 : 400 }}>
                      {c.label}
                    </span>
                    {comp[c.key] && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 13 }}>✓</span>}
                  </label>
                ))}
              </div>
            </div>
          </Modal>
        )
      })()}
    </div>
  )
}
