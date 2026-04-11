import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import Avatar from '../../components/Avatar'
import Badge from '../../components/Badge'
import Modal from '../../components/Modal'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'INST-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export default function Instructors() {
  const { profile, isDemo } = useAuth()
  const { showToast } = useApp()

  const [instructors, setInstructors] = useState([])
  const [invites, setInvites]         = useState([])
  const [showModal, setShowModal]     = useState(false)
  const [newCode, setNewCode]         = useState(null)
  const [note, setNote]               = useState('')
  const [saving, setSaving]           = useState(false)
  const [copied, setCopied]           = useState(false)

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    if (isDemo) return
    const [{ data: inst }, { data: inv }] = await Promise.all([
      supabase.from('profiles').select('*').eq('school_id', profile.school_id).eq('role', 'instructor').order('name'),
      supabase.from('instructor_invites').select('*, profiles!used_by(name, email)').eq('school_id', profile.school_id).order('created_at', { ascending: false }),
    ])
    setInstructors(inst || [])
    setInvites(inv || [])
  }

  async function handleCreateInvite() {
    setSaving(true)
    const code = generateCode()
    const { error } = await supabase.from('instructor_invites').insert({
      school_id: profile.school_id,
      code,
      note: note || null,
    })
    setSaving(false)
    if (error) { showToast('Fehler beim Erstellen', 'error'); return }
    setNewCode(code)
    setNote('')
    load()
  }

  async function handleDeleteInvite(id) {
    await supabase.from('instructor_invites').delete().eq('id', id)
    setInvites(prev => prev.filter(i => i.id !== id))
    showToast('Code gelöscht')
  }

  function handleCopy(code) {
    const msg = `Letzschwamm Instrukteur-Registrierung:\nCode: ${code}\nRegistrieren: ${window.location.origin}/onboarding/instructor`
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">👨‍🏫 Instrukteure</div>
          <div className="page-sub">{instructors.length} Instrukteure · {invites.filter(i => !i.used).length} offene Codes</div>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Einladungscode</button>
        </div>
      </div>

      {/* Instructors list */}
      {instructors.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>
            Aktive Instrukteure
          </div>
          {instructors.map(inst => (
            <div key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <Avatar name={inst.name || inst.email} size={36} radius={10} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{inst.name || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{inst.email}</div>
              </div>
              <Badge variant={inst.subscription_status === 'active' ? 'green' : inst.subscription_status === 'pending' ? 'gold' : 'muted'}>
                {inst.subscription_status === 'active' ? 'Aktiv' : inst.subscription_status === 'pending' ? 'Zahlung ausstehend' : 'Inaktiv'}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Invite codes */}
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>
        Einladungscodes
      </div>
      {invites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>
          Noch keine Einladungscodes erstellt. Klicke auf "+ Einladungscode".
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Notiz</th>
                <th>Status</th>
                <th>Verwendet von</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invites.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: inv.used ? 'var(--muted)' : 'var(--aqua)', letterSpacing: '1px' }}>
                      {inv.code}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{inv.note || '—'}</td>
                  <td>
                    <Badge variant={inv.used ? 'muted' : 'blue'}>{inv.used ? 'Verwendet' : 'Offen'}</Badge>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {inv.profiles ? `${inv.profiles.name || inv.profiles.email}` : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!inv.used && (
                        <button className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => handleCopy(inv.code)}>
                          {copied ? '✓' : '📋'}
                        </button>
                      )}
                      {!inv.used && (
                        <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => handleDeleteInvite(inv.id)}>🗑</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New invite modal */}
      <Modal
        open={showModal && !newCode}
        onClose={() => { setShowModal(false); setNote('') }}
        title="Einladungscode erstellen"
        subtitle="Für einen neuen Instrukteur"
        actions={<>
          <button className="btn btn-ghost" onClick={() => { setShowModal(false); setNote('') }}>Abbrechen</button>
          <button className="btn btn-primary" onClick={handleCreateInvite} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Code generieren'}
          </button>
        </>}
      >
        <div className="form-group">
          <label>Notiz (optional)</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="z.B. Klaus Müller, Sauvetage-Kurs Mai 2026" />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', padding: '10px 12px', background: 'rgba(0,150,199,.08)', borderRadius: 10, marginTop: 4 }}>
          Der Code ist 49€/Jahr — der Instrukteur bezahlt bei der Registrierung.
        </div>
      </Modal>

      {/* Code reveal */}
      {newCode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,15,26,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👨‍🏫</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Einladungscode erstellt!</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Teile diesen Code mit dem Instrukteur</div>
            <div style={{ background: 'linear-gradient(135deg,rgba(0,150,199,.18),rgba(72,202,228,.08))', border: '1.5px solid rgba(72,202,228,.35)', borderRadius: 14, padding: '20px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Einladungscode</div>
              <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 800, color: 'var(--aqua)', letterSpacing: '2px' }}>{newCode}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Registrierung: {window.location.origin}/onboarding/instructor</div>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginBottom: 10 }} onClick={() => handleCopy(newCode)}>
              {copied ? '✓ Kopiert!' : '📋 Nachricht kopieren'}
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => { setNewCode(null); setShowModal(false) }}>Schließen</button>
          </div>
        </div>
      )}
    </div>
  )
}
