import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { getProgress } from '../../lib/criteria'
import { getAllDemoChildren, addDemoPerson, DEMO_CLASSES } from '../../lib/demo'
import ProgressBar from '../../components/ProgressBar'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'
import Avatar from '../../components/Avatar'

const EMPTY_FORM = {
  personType: 'child',
  firstName: '', lastName: '', birthDate: '',
  level: 'bobby', classId: '', contactEmail: '',
}

export default function Children() {
  const { profile, isDemo } = useAuth()
  const { t, showToast } = useApp()
  const navigate = useNavigate()
  const ui = t.ui

  const [persons, setPersons]     = useState([])
  const [classes, setClasses]     = useState([])
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    if (isDemo) { setPersons(getAllDemoChildren()); setClasses(DEMO_CLASSES); return }
    const schoolId = profile.school_id
    const [{ data: kids }, { data: cls }] = await Promise.all([
      supabase.from('children').select('*, progress(criteria_key)').eq('school_id', schoolId).order('first_name'),
      supabase.from('classes').select('*').eq('school_id', schoolId),
    ])
    setPersons(kids || [])
    setClasses(cls || [])
  }

  function personProgress(p) {
    return getProgress((p.progress || []).map(x => x.criteria_key), p.level)
  }

  const filtered = persons
    .filter(p => typeFilter === 'all' || (p.person_type || 'child') === typeFilter)
    .filter(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()))

  const childCount = persons.filter(p => (p.person_type || 'child') === 'child').length
  const adultCount = persons.filter(p => p.person_type === 'adult').length

  const [confirmDelete, setConfirmDelete] = useState(null) // { id, name }
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    if (!isDemo) {
      await supabase.from('progress').delete().eq('child_id', confirmDelete.id)
      await supabase.from('notes').delete().eq('child_id', confirmDelete.id)
      await supabase.from('children').delete().eq('id', confirmDelete.id)
    } else {
      // demo: remove from local state
    }
    setPersons(prev => prev.filter(p => p.id !== confirmDelete.id))
    showToast(`${confirmDelete.name} wurde gelöscht`)
    setConfirmDelete(null)
    setDeleting(false)
  }

  async function handleAdd() {
    if (!form.firstName || !form.lastName) return
    setSaving(true)

    const newPerson = {
      school_id: profile.school_id,
      first_name: form.firstName, last_name: form.lastName,
      birth_date: form.birthDate || null, level: form.level,
      class_id: form.personType === 'child' ? (form.classId || null) : null,
      person_type: form.personType,
      contact_email: form.personType === 'adult' ? (form.contactEmail || null) : null,
    }

    if (isDemo) {
      const demo = { ...newPerson, id: `person-${Date.now()}`, parent_id: null, progress: [] }
      addDemoPerson(demo)
      setPersons(getAllDemoChildren())
      showToast(t.toast.childAdded(`${form.firstName} ${form.lastName}`))
      setShowModal(false)
      setForm(EMPTY_FORM)
      setSaving(false)
      return
    }

    const { error } = await supabase.from('children').insert(newPerson)
    setSaving(false)
    if (error) { showToast(t.toast.error, 'error'); return }
    showToast(t.toast.childAdded(`${form.firstName} ${form.lastName}`))
    setShowModal(false)
    setForm(EMPTY_FORM)
    load()
  }

  function openModal(personType = 'child') {
    setForm({ ...EMPTY_FORM, personType })
    setShowModal(true)
  }

  return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 16 }}>
        <div>
          <div className="page-title">{ui.allChildren}</div>
          <div className="page-sub">{childCount} Kinder · {adultCount} Erwachsene</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={() => openModal('adult')}>
            + Erwachsener
          </button>
          <button className="btn btn-primary" onClick={() => openModal('child')}>
            + {ui.addChild}
          </button>
        </div>
      </div>

      {/* Type filter + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div className="type-tabs">
          {[
            { key: 'all', label: `Alle (${persons.length})` },
            { key: 'child', label: `Kinder (${childCount})` },
            { key: 'adult', label: `Erwachsene (${adultCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`type-tab${typeFilter === key ? ' active' : ''}`}
              onClick={() => setTypeFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>🔍</span>
        <input
          type="text"
          placeholder={ui.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        {filtered.length === 0
          ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              <div style={{ marginBottom: 12 }}><img src="/Icon_Only_Crown_25_solid.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', opacity: 0.4 }} /></div>
              {ui.noChildren}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{ui.name}</th>
                  <th>Typ</th>
                  <th>{ui.level}</th>
                  <th>{ui.class}</th>
                  <th>{ui.progress}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(person => {
                  const pct = personProgress(person)
                  const cls = classes.find(c => c.id === person.class_id)
                  const isAdult = person.person_type === 'adult'
                  const fullName = `${person.first_name} ${person.last_name}`
                  return (
                    <tr key={person.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={fullName} size={32} radius={9} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{fullName}</div>
                            {person.contact_email && (
                              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{person.contact_email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant={isAdult ? 'muted' : 'blue'}>
                          {isAdult ? 'Erwachsen' : 'Kind'}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={person.level === 'lifesaver' ? 'gold' : 'blue'}>
                          {t.levelLabel[person.level]}
                        </Badge>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {cls?.name || '—'}
                        </span>
                      </td>
                      <td><ProgressBar value={pct} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '5px 12px', fontSize: 11 }}
                            onClick={() => navigate(`/admin/children/${person.id}`)}
                          >
                            {ui.open}
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 10px', fontSize: 11 }}
                            onClick={() => setConfirmDelete({ id: person.id, name: fullName })}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }
      </div>

      {/* Confirm delete modal */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Eintrag löschen"
        subtitle={`Wirklich löschen: ${confirmDelete?.name}?`}
        actions={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Abbrechen</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <span className="spinner" /> : 'Endgültig löschen'}
          </button>
        </>}
      >
        <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--muted)' }}>
          Diese Aktion kann nicht rückgängig gemacht werden. Alle Fortschritte und Notizen werden ebenfalls gelöscht.
        </div>
      </Modal>

      {/* Add person modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setForm(EMPTY_FORM) }}
        title={form.personType === 'adult' ? 'Erwachsener hinzufügen' : ui.addChild}
        subtitle={form.personType === 'adult' ? 'Erwachsenen Teilnehmer eintragen' : 'Neues Kind eintragen'}
        actions={<>
          <button className="btn btn-ghost" onClick={() => { setShowModal(false); setForm(EMPTY_FORM) }}>
            {ui.cancel}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={saving || !form.firstName || !form.lastName}
          >
            {saving ? <span className="spinner" /> : ui.save}
          </button>
        </>}
      >
        {/* Person type toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: 'rgba(0,0,0,.2)', borderRadius: 10, padding: 3 }}>
          {[
            { key: 'child', label: '👦 Kind' },
            { key: 'adult', label: '👤 Erwachsener' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setForm(f => ({ ...f, personType: key }))}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 7, border: 'none',
                background: form.personType === key ? 'rgba(0,180,216,.2)' : 'transparent',
                color: form.personType === key ? 'var(--aqua)' : 'var(--muted)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: '.2s',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>{ui.firstName}</label>
            <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Emma" />
          </div>
          <div className="form-group half">
            <label>{ui.lastName}</label>
            <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Müller" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group half">
            <label>{ui.birthDate}</label>
            <input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
          </div>
          <div className="form-group half">
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
        </div>

        {form.personType === 'child' && (
          <div className="form-group">
            <label>{ui.selectClass}</label>
            <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}>
              <option value="">— {ui.selectClass} —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {form.personType === 'adult' && (
          <div className="form-group">
            <label>E-Mail (optional)</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
              placeholder="person@example.com"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
