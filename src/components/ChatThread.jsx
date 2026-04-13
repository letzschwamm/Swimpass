import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── helpers ──────────────────────────────────────────────────────────────────
function msgTime(ts) {
  return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}
function nameInitials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?'
}

const ROLE_LABEL = {
  parent: 'Elternteil', participant: 'Teilnehmer',
  instructor: 'Instrukteur', teacher: 'Lehrer', admin: 'Admin',
}

const THREAD_CSS = `
  .ct-shell { display:flex; flex-direction:column; height:100%; overflow:hidden; }
  .ct-header {
    padding:11px 16px; border-bottom:1px solid var(--border);
    display:flex; align-items:center; gap:10px;
    background:rgba(0,0,0,.08); flex-shrink:0;
  }
  .ct-hdr-avatar {
    width:36px; height:36px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,var(--blue),var(--light));
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:700; color:var(--deep);
  }
  .ct-back-btn {
    background:none; border:none; color:var(--muted); cursor:pointer;
    font-size:20px; padding:0 6px 0 0; line-height:1; transition:color .15s;
  }
  .ct-back-btn:hover { color:var(--text); }
  .ct-del-btn {
    background:none; border:none; color:var(--muted); cursor:pointer;
    font-size:16px; padding:4px 6px; border-radius:6px;
    margin-left:auto; transition:color .15s, background .15s;
  }
  .ct-del-btn:hover { color:var(--red); background:rgba(239,68,68,.1); }

  .ct-msgs {
    flex:1; overflow-y:auto; padding:14px 16px;
    display:flex; flex-direction:column; gap:3px;
  }
  .ct-msgs::-webkit-scrollbar { width:4px; }
  .ct-msgs::-webkit-scrollbar-thumb { background:rgba(255,255,255,.15); border-radius:2px; }

  .ct-row { display:flex; }
  .ct-row.mine { justify-content:flex-end; }

  .ct-bubble {
    max-width:75%; padding:8px 13px; border-radius:18px;
    font-size:13.5px; line-height:1.46; word-break:break-word;
    animation:ctBubbleIn .18s ease;
  }
  @keyframes ctBubbleIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
  .ct-bubble.mine {
    background:linear-gradient(135deg,var(--mid),var(--light));
    color:var(--deep); border-bottom-right-radius:4px;
  }
  .ct-bubble.theirs {
    background:var(--card); color:var(--text);
    border:1px solid var(--border); border-bottom-left-radius:4px;
  }
  .ct-meta { font-size:9.5px; opacity:.55; margin-top:3px; display:block; }
  .ct-row.mine .ct-meta { text-align:right; }
  .ct-row:not(.mine) .ct-meta { text-align:left; }

  .ct-date-sep {
    text-align:center; font-size:10px; color:var(--muted);
    margin:10px 0 6px; opacity:.65;
  }

  .ct-input-bar {
    padding:10px 12px; border-top:1px solid var(--border);
    display:flex; gap:8px; align-items:flex-end;
    background:rgba(0,0,0,.1); flex-shrink:0;
  }
  .ct-textarea {
    flex:1; background:rgba(255,255,255,.07);
    border:1px solid var(--border); border-radius:18px;
    padding:9px 14px; color:var(--text); font-size:13.5px;
    outline:none; resize:none; min-height:38px; max-height:100px;
    font-family:inherit; line-height:1.42; transition:border-color .15s;
  }
  .ct-textarea:focus { border-color:var(--aqua); }
  .ct-textarea::placeholder { color:var(--muted); }
  .ct-send-btn {
    width:38px; height:38px; border-radius:50%;
    background:linear-gradient(135deg,var(--mid),var(--light));
    border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:15px; color:var(--deep); flex-shrink:0;
    transition:transform .15s, opacity .15s;
  }
  .ct-send-btn:hover:not(:disabled) { transform:scale(1.1); }
  .ct-send-btn:disabled { opacity:.3; cursor:default; }
`

// ── date separator helper ─────────────────────────────────────────────────────
function dateSep(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return 'Heute'
  if (diff === 1) return 'Gestern'
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── ChatThread ────────────────────────────────────────────────────────────────
/**
 * Props:
 *   convId          – UUID of the conversation
 *   profile         – current user's profile object (id, role)
 *   counterpartName – display name of the other person
 *   counterpartRole – role string of the other person
 *   onBack          – optional () => void  (shows ← button on mobile)
 *   onDelete        – optional () => void  (shows 🗑 button)
 *   onMsgSent       – optional (ts: string) => void  (after message sent)
 *   onNewMsg        – optional (msg: object) => void (on realtime INSERT)
 */
export default function ChatThread({
  convId, profile, counterpartName, counterpartRole,
  onBack, onDelete, onMsgSent, onNewMsg,
}) {
  const [msgs, setMsgs]     = useState([])
  const [text, setText]     = useState('')
  const [sending, setSending] = useState(false)
  const endRef    = useRef(null)
  const chanRef   = useRef(null)
  const taRef     = useRef(null)

  // ── load + subscribe ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!convId) return
    let mounted = true

    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
      if (!mounted) return
      setMsgs(data || [])

      // Mark unread messages from the other side as read
      if (data?.some(m => m.sender_id !== profile.id && !m.read)) {
        await supabase.from('messages')
          .update({ read: true })
          .eq('conversation_id', convId)
          .neq('sender_id', profile.id)
          .eq('read', false)
      }
    }
    load()

    // Realtime: new messages
    if (chanRef.current) supabase.removeChannel(chanRef.current)
    chanRef.current = supabase
      .channel(`ct-${convId}-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${convId}`,
      }, ({ new: msg }) => {
        if (!mounted) return
        setMsgs(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        onNewMsg?.(msg)
        // Auto-mark as read if it's from the other side
        if (msg.sender_id !== profile.id) {
          supabase.from('messages').update({ read: true }).eq('id', msg.id)
        }
      })
      .subscribe()

    return () => {
      mounted = false
      if (chanRef.current) { supabase.removeChannel(chanRef.current); chanRef.current = null }
    }
  }, [convId])

  // Auto-scroll when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  // ── send ────────────────────────────────────────────────────────────────────
  async function send() {
    const content = text.trim()
    if (!content || !convId || sending) return
    setText('')
    if (taRef.current) { taRef.current.style.height = 'auto' }
    setSending(true)
    const now = new Date().toISOString()
    await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: profile.id,
      sender_role: profile.role,
      content,
    })
    await supabase.from('conversations').update({
      last_message_at: now,
      last_message_preview: content.slice(0, 80),
    }).eq('id', convId)
    onMsgSent?.(now)
    setSending(false)
    taRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function handleInput(e) {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
  }

  // ── render helpers ──────────────────────────────────────────────────────────
  function renderMessages() {
    const items = []
    let lastDate = null
    msgs.forEach(m => {
      const dayStr = new Date(m.created_at).toDateString()
      if (dayStr !== lastDate) {
        items.push(
          <div key={`sep-${m.id}`} className="ct-date-sep">{dateSep(m.created_at)}</div>
        )
        lastDate = dayStr
      }
      const mine = m.sender_id === profile.id
      items.push(
        <div key={m.id} className={`ct-row${mine ? ' mine' : ''}`}>
          <div className={`ct-bubble${mine ? ' mine' : ' theirs'}`}>
            {m.content}
            <span className="ct-meta">
              {msgTime(m.created_at)}
              {mine && <span>{m.read ? ' ✓✓' : ' ✓'}</span>}
            </span>
          </div>
        </div>
      )
    })
    return items
  }

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{THREAD_CSS}</style>
      <div className="ct-shell">

        {/* Header */}
        <div className="ct-header">
          {onBack && (
            <button className="ct-back-btn" onClick={onBack} aria-label="Zurück">←</button>
          )}
          <div className="ct-hdr-avatar">{nameInitials(counterpartName)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {counterpartName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {ROLE_LABEL[counterpartRole] || counterpartRole}
            </div>
          </div>
          {onDelete && (
            <button className="ct-del-btn" onClick={onDelete} title="Gespräch löschen">🗑</button>
          )}
        </div>

        {/* Messages */}
        <div className="ct-msgs">
          {msgs.length === 0 && (
            <div style={{ textAlign: 'center', opacity: .35, fontSize: 13, marginTop: 32, lineHeight: 1.6 }}>
              👋 Noch keine Nachrichten<br />
              <span style={{ fontSize: 11 }}>Schreib als Erstes!</span>
            </div>
          )}
          {renderMessages()}
          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <div className="ct-input-bar">
          <textarea
            ref={taRef}
            className="ct-textarea"
            placeholder="Nachricht schreiben…"
            value={text}
            rows={1}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
          />
          <button
            className="ct-send-btn"
            onClick={send}
            disabled={!text.trim() || sending}
            aria-label="Senden"
          >➤</button>
        </div>

      </div>
    </>
  )
}
