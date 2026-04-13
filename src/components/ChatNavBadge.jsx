import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

/**
 * Shows an unread-message count badge for the chat nav item.
 * Queries the DB and subscribes to realtime updates.
 * Renders nothing if count === 0.
 */
export default function ChatNavBadge() {
  const { profile } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!profile) return
    const isStaff = ['instructor', 'teacher', 'admin'].includes(profile.role)

    async function load() {
      // Step 1: get my conversation IDs
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .eq(isStaff ? 'instructor_id' : 'user_id', profile.id)

      if (!convs?.length) { setCount(0); return }

      // Step 2: count unread messages from the other side
      const { count: n } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convs.map(c => c.id))
        .neq('sender_id', profile.id)
        .eq('read', false)

      setCount(n || 0)
    }

    load()

    // Realtime: refresh on any message change (insert/update)
    const ch = supabase
      .channel(`chat-badge-${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, load)
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [profile?.id])

  if (!count) return null

  return (
    <span style={{
      position: 'absolute',
      top: 3, right: '50%',
      transform: 'translateX(150%)',
      background: 'var(--red)',
      color: '#fff',
      borderRadius: 9,
      fontSize: 9,
      fontWeight: 800,
      padding: '1px 4px',
      minWidth: 14,
      textAlign: 'center',
      lineHeight: '14px',
      pointerEvents: 'none',
    }}>
      {count > 9 ? '9+' : count}
    </span>
  )
}
