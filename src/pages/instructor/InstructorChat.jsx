import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'
import ChatThread from '../../components/ChatThread'

// ── helpers ──────────────────────────────────────────────────────────────────
function convTime(ts) {
  if (!ts) return ''
  const d   = new Date(ts)
  const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  if (diff === 1) return 'Gestern'
  if (diff < 7)  return d.toLocaleDateString('de-DE', { weekday: 'short' })
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}
function nameInitials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?'
}
function displayName(p) {
  return p?.name || p?.email?.split('@')[0] || 'Unbekannt'
}

const PAGE_CSS = `
  .ic-shell {
    display:flex; height:100%; overflow:hidden;
  }
  /* ── Conversation list ── */
  .ic-list {
    width:295px; flex-shrink:0;
    border-right:1px solid var(--border);
    display:flex; flex-direction:column; overflow:hidden;
    background:rgba(0,0,0,.06);
  }
  .ic-list-hdr {
    padding:14px 16px; border-bottom:1px solid var(--border);
    display:flex; align-items:center; gap:8px; flex-shrink:0;
  }
  .ic-list-hdr h2 { font-size:15px; font-weight:700; margin:0; flex:1; }
  .ic-list-body { flex:1; overflow-y:auto; }
  .ic-list-body::-webkit-scrollbar { width:4px; }
  .ic-list-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,.12); border-radius:2px; }

  .ic-conv {
    display:flex; align-items:center; gap:10px;
    padding:12px 14px; cursor:pointer;
    border-bottom:1px solid rgba(255,255,255,.04);
    transition:background .15s;
  }
  .ic-conv:hover { background:rgba(255,255,255,.06); }
  .ic-conv.active { background:rgba(72,202,228,.1); }
  .ic-conv-avatar {
    width:42px; height:42px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,var(--blue),var(--light));
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:700; color:var(--deep);
  }
  .ic-conv-info { flex:1; min-width:0; }
  .ic-conv-name { font-size:13px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ic-conv-preview { font-size:11px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
  .ic-conv-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
  .ic-conv-time { font-size:10px; color:var(--muted); }
  .ic-unread { background:var(--red); color:#fff; border-radius:9px; font-size:10px; font-weight:800; padding:1px 5px; min-width:16px; text-align:center; line-height:16px; }
  .ic-del-conv {
    background:none; border:none; color:var(--muted); cursor:pointer;
    padding:2px 4px; border-radius:4px; font-size:12px;
    opacity:.5; transition:opacity .15s, color .15s;
  }
  .ic-del-conv:hover { opacity:1; color:var(--red); }

  /* ── Thread pane ── */
  .ic-thread { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .ic-empty {
    flex:1; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    opacity:.3; gap:10px;
  }

  /* ── Mobile: show one panel at a time ── */
  @media (max-width:768px) {
    .ic-list { width:100%; border-right:none; }
    .ic-list.mob-hidden { display:none; }
    .ic-thread { display:none; }
    .ic-thread.mob-show { display:flex; }
  }
`

// ── InstructorChat ────────────────────────────────────────────────────────────
export default function InstructorChat() {
  const { profile } = useAuth()
  const [convs,        setConvs]        = useState([])
  const [userProfiles, setUserProfiles] = useState({})  // userId → profile
  const [unreadMap,    setUnreadMap]    = useState({})  // convId → count
  const [activeConv,   setActiveConv]   = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [mobileView,   setMobileView]   = useState('list') // 'list' | 'thread'
  const [confirmDel,   setConfirmDel]   = useState(null)

  // ── load conversations ──────────────────────────────────────────────────────
  const loadConvs = useCallback(async () => {
    if (!profile) return

    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('instructor_id', profile.id)
      .order('last_message_at', { ascending: false })
    const rows = data || []
    setConvs(rows)
    setLoading(false)

    if (!rows.length) return

    // Load all user profiles in one query
    const ids = [...new Set(rows.map(c => c.user_id))]
    const { data: profs } = await supabase
      .from('profiles').select('id, name, email, role').in('id', ids)
    const pm = {}
    profs?.forEach(p => { pm[p.id] = p })
    setUserProfiles(pm)

    // Count unread messages per conversation
    const { data: unread } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', rows.map(c => c.id))
      .neq('sender_id', profile.id)
      .eq('read', false)
    const um = {}
    unread?.forEach(r => { um[r.conversation_id] = (um[r.conversation_id] || 0) + 1 })
    setUnreadMap(um)
  }, [profile?.id])

  useEffect(() => { loadConvs() }, [loadConvs])

  // Realtime: conversation list updates (new convs or last_message_at changes)
  useEffect(() => {
    if (!profile) return
    const ch = supabase
      .channel(`ic-convs-${profile.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'conversations',
        filter: `instructor_id=eq.${profile.id}`,
      }, loadConvs)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [profile?.id, loadConvs])

  // ── select conversation ─────────────────────────────────────────────────────
  function selectConv(conv) {
    setActiveConv(conv)
    setMobileView('thread')
    setUnreadMap(prev => ({ ...prev, [conv.id]: 0 }))
  }

  // ── delete conversation ─────────────────────────────────────────────────────
  async function deleteConv(conv) {
    await supabase.from('conversations').delete().eq('id', conv.id)
    setConvs(prev => prev.filter(c => c.id !== conv.id))
    if (activeConv?.id === conv.id) { setActiveConv(null); setMobileView('list') }
    setConfirmDel(null)
  }

  // ── callbacks from ChatThread ───────────────────────────────────────────────
  function handleMsgSent(ts) {
    if (!activeConv) return
    setConvs(prev =>
      prev.map(c => c.id === activeConv.id ? { ...c, last_message_at: ts } : c)
        .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
    )
  }

  function handleNewMsg(msg) {
    if (!activeConv) return
    setConvs(prev =>
      prev.map(c => c.id === activeConv.id ? { ...c, last_message_at: msg.created_at } : c)
        .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
    )
    if (msg.sender_id !== profile.id && activeConv?.id !== msg.conversation_id) {
      setUnreadMap(prev => ({ ...prev, [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1 }))
    }
  }

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0)
  const activeUserProfile = activeConv ? userProfiles[activeConv.user_id] : null

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{PAGE_CSS}</style>
      <div className="ic-shell">

        {/* ── Conversation list ── */}
        <div className={`ic-list${mobileView === 'thread' ? ' mob-hidden' : ''}`}>
          <div className="ic-list-hdr">
            <h2>💬 Nachrichten</h2>
            {totalUnread > 0 && (
              <span className="ic-unread">{totalUnread > 99 ? '99+' : totalUnread}</span>
            )}
          </div>
          <div className="ic-list-body">
            {loading && (
              <div style={{ padding: 24, textAlign: 'center', opacity: .45, fontSize: 13 }}>Lädt…</div>
            )}
            {!loading && !convs.length && (
              <div style={{ padding: 28, textAlign: 'center', opacity: .35, lineHeight: 1.7 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Noch keine Gespräche</div>
                <div style={{ fontSize: 11 }}>Sobald dir jemand schreibt, erscheint es hier.</div>
              </div>
            )}
            {convs.map(conv => {
              const up      = userProfiles[conv.user_id]
              const name    = displayName(up)
              const unread  = unreadMap[conv.id] || 0
              const preview = conv.last_message_preview
                || (conv.user_role === 'parent' ? '👨‍👩‍👧 Elternteil' : '🏅 Teilnehmer')
              return (
                <div
                  key={conv.id}
                  className={`ic-conv${activeConv?.id === conv.id ? ' active' : ''}`}
                  onClick={() => selectConv(conv)}
                >
                  <div className="ic-conv-avatar">{nameInitials(name)}</div>
                  <div className="ic-conv-info">
                    <div className="ic-conv-name" style={{ fontWeight: unread ? 700 : 600 }}>{name}</div>
                    <div className="ic-conv-preview">{preview}</div>
                  </div>
                  <div className="ic-conv-meta">
                    <span className="ic-conv-time">{convTime(conv.last_message_at)}</span>
                    {unread > 0 && (
                      <span className="ic-unread">{unread > 9 ? '9+' : unread}</span>
                    )}
                    <button
                      className="ic-del-conv"
                      onClick={e => { e.stopPropagation(); setConfirmDel(conv) }}
                      title="Gespräch löschen"
                    >🗑</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Chat thread ── */}
        <div className={`ic-thread${mobileView === 'thread' ? ' mob-show' : ''}`}>
          {activeConv ? (
            <ChatThread
              convId={activeConv.id}
              profile={profile}
              counterpartName={displayName(activeUserProfile)}
              counterpartRole={activeConv.user_role}
              onBack={() => setMobileView('list')}
              onDelete={() => setConfirmDel(activeConv)}
              onMsgSent={handleMsgSent}
              onNewMsg={handleNewMsg}
            />
          ) : (
            <div className="ic-empty">
              <div style={{ fontSize: 52 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Gespräch wählen</div>
              <div style={{ fontSize: 12 }}>Klicke links auf ein Gespräch</div>
            </div>
          )}
        </div>

      </div>

      {/* ── Delete confirmation ── */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)}>
        <div style={{ padding: '8px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
          <p style={{ marginBottom: 6 }}>
            Gespräch mit{' '}
            <strong>{confirmDel && displayName(userProfiles[confirmDel.user_id])}</strong>{' '}
            löschen?
          </p>
          <p style={{ fontSize: 12, opacity: .6, marginBottom: 20 }}>
            Alle Nachrichten werden unwiderruflich entfernt.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Abbrechen</button>
            <button className="btn btn-danger" onClick={() => deleteConv(confirmDel)}>Löschen</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
