import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const TYPE_OPTIONS = [
  {
    value: 'sauvetage',
    icon: '🏅',
    title: 'Sauvetage',
    sub: 'Nur Rettungskurse (FLNS Lifesaver)',
  },
  {
    value: 'swimming',
    icon: '🏊',
    title: 'Schwimmkurse',
    sub: 'Nur Schwimmkurse für Kinder',
  },
  {
    value: 'both',
    icon: '🏅🏊',
    title: 'Beides',
    sub: 'Sauvetage- und Schwimmkurse',
  },
]

export default function InstructorSettings() {
  const { profile } = useAuth()
  const [name,         setName]         = useState(profile?.name || '')
  const [instrType,    setInstrType]    = useState(profile?.instructor_type || 'sauvetage')
  const [loading,      setLoading]      = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [error,        setError]        = useState('')

  useEffect(() => {
    if (!profile) return
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('name, instructor_type')
        .eq('id', profile.id)
        .maybeSingle()
      if (data) {
        setName(data.name || '')
        setInstrType(data.instructor_type || 'sauvetage')
      }
      setLoading(false)
    }
    load()
  }, [profile?.id])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    const { error: err } = await supabase
      .from('profiles')
      .update({ name: name.trim(), instructor_type: instrType })
      .eq('id', profile.id)
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="page-content">
      <div style={{ padding: 40, textAlign: 'center', opacity: .5 }}>Lädt…</div>
    </div>
  )

  return (
    <div className="page-content">
      <style>{`
        .is-section    { margin-bottom:28px; }
        .is-label      { font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
                         color:var(--muted); margin-bottom:10px; }
        .is-type-cards { display:flex; flex-direction:column; gap:8px; }
        .is-type-card  { display:flex; align-items:center; gap:14px; padding:14px 16px;
                         border:1.5px solid var(--border); border-radius:14px;
                         background:var(--card); cursor:pointer; transition:border-color .15s, background .15s; }
        .is-type-card.active { border-color:var(--blue); background:rgba(0,119,182,.12); }
        .is-type-icon  { font-size:22px; width:40px; text-align:center; flex-shrink:0; }
        .is-type-title { font-size:14px; font-weight:700; color:var(--text); }
        .is-type-sub   { font-size:12px; color:var(--muted); margin-top:2px; }
        .is-radio      { width:18px; height:18px; border-radius:50%;
                         border:2px solid var(--border); flex-shrink:0; margin-left:auto;
                         background:transparent; transition:border-color .15s, background .15s; }
        .is-radio.active { border-color:var(--blue); background:var(--blue); }
      `}</style>

      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
        ⚙️ Einstellungen
      </div>

      {/* ── Profile ──────────────────────────────────────────────────────────── */}
      <div className="is-section">
        <div className="is-label">Profil</div>
        <div className="form-group">
          <label style={{ fontSize: 13 }}>Angezeigter Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Dein Name"
          />
        </div>
        <div className="form-group">
          <label style={{ fontSize: 13 }}>E-Mail</label>
          <input value={profile?.email || ''} disabled style={{ opacity: .5 }} />
        </div>
      </div>

      {/* ── Instructor type ──────────────────────────────────────────────────── */}
      <div className="is-section">
        <div className="is-label">Ich biete an</div>
        <div className="is-type-cards">
          {TYPE_OPTIONS.map(opt => (
            <div
              key={opt.value}
              className={`is-type-card${instrType === opt.value ? ' active' : ''}`}
              onClick={() => setInstrType(opt.value)}
            >
              <div className="is-type-icon">{opt.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="is-type-title">{opt.title}</div>
                <div className="is-type-sub">{opt.sub}</div>
              </div>
              <div className={`is-radio${instrType === opt.value ? ' active' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>
      )}

      <button
        className="btn btn-primary btn-full"
        onClick={handleSave}
        disabled={saving}
        style={{ marginBottom: 8 }}
      >
        {saving ? 'Speichern…' : saved ? '✓ Gespeichert!' : 'Einstellungen speichern'}
      </button>
    </div>
  )
}
