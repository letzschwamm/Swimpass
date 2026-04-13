import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'
import ChatThread from '../../components/ChatThread'

export default function ParticipantChat() {
  const { profile } = useAuth()
  const [convId,     setConvId]     = useState(null)
  const [staffName,  setStaffName]  = useState('')
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  useEffect(() => {
    if (!profile) return
    init()
  }, [profile?.id])

  async function init() {
    setLoading(true)

    // Find course instructor via sauvetage_participants → sauvetage_courses
    const { data: parts } = await supabase
      .from('sauvetage_participants').select('course_id')
      .eq('user_id', profile.id).limit(1)
    const courseId = parts?.[0]?.course_id
    if (!courseId) { setNotFound(true); setLoading(false); return }

    const { data: course } = await supabase
      .from('sauvetage_courses').select('instructor_id').eq('id', courseId).maybeSingle()
    const staffId = course?.instructor_id
    if (!staffId) { setNotFound(true); setLoading(false); return }

    // Get staff name
    const { data: sp } = await supabase
      .from('profiles').select('name, email').eq('id', staffId).maybeSingle()
    setStaffName(sp?.name || sp?.email?.split('@')[0] || 'Instrukteur')

    // Get or create conversation
    let { data: conv } = await supabase
      .from('conversations').select('id')
      .eq('instructor_id', staffId).eq('user_id', profile.id)
      .maybeSingle()

    if (!conv) {
      const { data: newConv } = await supabase.from('conversations')
        .insert({ instructor_id: staffId, user_id: profile.id, user_role: 'participant' })
        .select('id').maybeSingle()
      conv = newConv
    }

    if (!conv?.id) { setNotFound(true); setLoading(false); return }
    setConvId(conv.id)
    setLoading(false)
  }

  async function handleDelete() {
    if (!convId) return
    await supabase.from('conversations').delete().eq('id', convId)
    setConvId(null)
    setConfirmDel(false)
  }

  // ── render ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="page-content">
      <div style={{ padding: 40, textAlign: 'center', opacity: .5 }}>Lädt…</div>
    </div>
  )

  if (notFound || !convId) return (
    <div className="page-content">
      <div style={{ padding: 40, textAlign: 'center', opacity: .45, lineHeight: 1.7 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
        <div style={{ fontWeight: 600 }}>Kein Instrukteur gefunden</div>
        <div style={{ fontSize: 13 }}>Bitte kontaktiere deinen Kursleiter.</div>
      </div>
    </div>
  )

  return (
    <>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ChatThread
          convId={convId}
          profile={profile}
          counterpartName={staffName}
          counterpartRole="instructor"
          onDelete={() => setConfirmDel(true)}
        />
      </div>

      <Modal open={confirmDel} onClose={() => setConfirmDel(false)}>
        <div style={{ padding: '8px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
          <p style={{ marginBottom: 6 }}>Chat mit <strong>{staffName}</strong> löschen?</p>
          <p style={{ fontSize: 12, opacity: .6, marginBottom: 20 }}>
            Alle Nachrichten werden unwiderruflich entfernt.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setConfirmDel(false)}>Abbrechen</button>
            <button className="btn btn-danger" onClick={handleDelete}>Löschen</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
