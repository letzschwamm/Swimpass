import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { getProgress } from '../../lib/criteria'
import CriteriaList from '../../components/CriteriaList'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'

const BADGE_LEVELS = ['bobby', 'seepferdchen', 'trixi', 'bronze', 'silber', 'gold']
const STRIPE_BADGE_LINK = import.meta.env.VITE_STRIPE_BADGE_LINK || 'https://buy.stripe.com/9B6dR9dZf7xs7hO0cX7kc03'

export default function MyChild() {
  const { profile } = useAuth()
  const { t } = useApp()
  const ui = t.ui

  const [child, setChild]     = useState(null)
  const [cls, setCls]         = useState(null)
  const [doneKeys, setDoneKeys] = useState([])
  const [notes, setNotes]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    setLoading(true)
    console.log('[MyChild] load() called — profile.id:', profile?.id, 'role:', profile?.role)

    const { data: kids, error: kidsError } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', profile.id)
      .limit(1)

    console.log('[MyChild] children query result:', { kids, error: kidsError, parentId: profile.id })

    if (kidsError) {
      console.error('[MyChild] children query error:', kidsError)
      setLoading(false)
      return
    }
    if (!kids?.length) {
      console.warn('[MyChild] no children found for parent_id:', profile.id)
      setLoading(false)
      return
    }
    const kid = kids[0]
    console.log('[MyChild] child found:', kid.id, kid.first_name, kid.level)
    setChild(kid)
    const [{ data: prog }, { data: clsData }, { data: nts }] = await Promise.all([
      supabase.from('progress').select('criteria_key').eq('child_id', kid.id),
      kid.class_id ? supabase.from('classes').select('*, profiles(name)').eq('id', kid.class_id).single() : Promise.resolve({ data: null }),
      supabase.from('notes').select('*, profiles(name)').eq('child_id', kid.id).order('created_at', { ascending: false }).limit(5),
    ])
    setDoneKeys((prog || []).map(p => p.criteria_key))
    setCls(clsData)
    setNotes(nts || [])
    setLoading(false)
  }

  if (loading) return <div className="page-content" style={{ color: 'var(--muted)' }}>Laden...</div>

  if (!child) return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}><div className="page-title">{ui.myChild}</div></div>
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ marginBottom: 16 }}><img src="/swimpass_icon_final.png" alt="" style={{ width: 56, height: 56, objectFit: 'contain', opacity: 0.5, borderRadius: 14, background: 'transparent' }} /></div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Noch kein Kind registriert</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Registrieren Sie Ihr Kind über den Link Ihrer Schwimmschule.</div>
      </div>
    </div>
  )

  const pct = getProgress(doneKeys, child.level)

  return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">{ui.myChild}</div>
          <div className="page-sub">{ui.swimPass}</div>
        </div>
      </div>

      <div className="parent-pass" style={{ marginBottom: 20 }}>
        <div className="pass-header">
          <Avatar name={`${child.first_name} ${child.last_name}`} size={64} radius={18} />
          <div>
            <div className="pass-name">{child.first_name} {child.last_name}</div>
            <div className="pass-meta">{cls?.name || '—'} · {child.birth_date ? new Date(child.birth_date).toLocaleDateString('de-DE') : '—'}</div>
            <div style={{ marginTop: 6 }}>
              <Badge variant={child.level === 'lifesaver' ? 'gold' : 'blue'}>{t.levelLabel[child.level]}</Badge>
            </div>
          </div>
        </div>
        <div className="pass-progress-big">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
            <div>
              <div className="pass-pct-label">{ui.overallProgress}</div>
              <div className="pass-pct">{pct}%</div>
            </div>
            {cls?.profiles?.name && (
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>
                {ui.teacher}: <strong style={{ color: 'var(--text)' }}>{cls.profiles.name}</strong>
              </div>
            )}
          </div>
          <div className="pass-bar"><div className="pass-bar-fill" style={{ width: `${pct}%` }} /></div>
        </div>
        {pct === 100 && BADGE_LEVELS.includes(child.level) && (
          <div style={{ marginTop: 14, padding: '12px 16px', background: 'linear-gradient(135deg, rgba(244,165,26,.12), rgba(244,165,26,.06))', border: '1px solid rgba(244,165,26,.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>🎉 Abzeichen erreicht!</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Jetzt das physische Abzeichen bestellen — 30€</div>
            </div>
            <a
              href={STRIPE_BADGE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: 12, padding: '8px 14px', textDecoration: 'none', flexShrink: 0 }}
            >
              Abzeichen kaufen 🏅
            </a>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="sec-header" style={{ marginBottom: 12 }}><div className="sec-title">🏊 {ui.swimPass}</div></div>
          <CriteriaList level={child.level} doneKeys={doneKeys} readOnly />
        </div>
        <div>
          <div className="sec-header" style={{ marginBottom: 12 }}><div className="sec-title">📝 {ui.lastTeacherNote}</div></div>
          {notes.length === 0
            ? <div className="card" style={{ color: 'var(--muted)', fontSize: 13 }}>{ui.noNotes}</div>
            : notes.map(note => (
              <div key={note.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>{note.content}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
                  {note.profiles?.name || '—'} · {new Date(note.created_at).toLocaleString('de-DE')}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
