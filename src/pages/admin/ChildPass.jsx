import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { CRITERIA, BADGE_META, ALL_LEVELS, LEGACY_LEVELS, getProgress } from '../../lib/criteria'
import { getAllDemoChildren, DEMO_PROGRESS } from '../../lib/demo'
import Avatar from '../../components/Avatar'

const ORDERED_LEVELS = [...ALL_LEVELS, ...LEGACY_LEVELS]

export default function ChildPass() {
  const { id } = useParams()
  const { profile, isDemo } = useAuth()
  const { t } = useApp()
  const navigate = useNavigate()
  const printRef = useRef()

  const [child, setChild]     = useState(null)
  const [doneKeys, setDoneKeys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    if (isDemo) {
      const kid = getAllDemoChildren().find(c => c.id === id)
      setChild(kid || null)
      setDoneKeys(DEMO_PROGRESS[id] || [])
      setLoading(false)
      return
    }
    const [{ data: kid }, { data: prog }] = await Promise.all([
      supabase.from('children').select('*').eq('id', id).maybeSingle(),
      supabase.from('progress').select('criteria_key').eq('child_id', id),
    ])
    setChild(kid)
    setDoneKeys((prog || []).map(p => p.criteria_key))
    setLoading(false)
  }

  function handlePrint() {
    window.print()
  }

  if (loading) return <div className="page-content" style={{ color: 'var(--muted)' }}>Laden...</div>
  if (!child)  return <div className="page-content" style={{ color: 'var(--muted)' }}>Kind nicht gefunden.</div>

  const childLevel = child.level || 'bobby'
  const meta = BADGE_META[childLevel]
  const pct  = getProgress(doneKeys, childLevel)

  // Build earned badges: a badge is "earned" if 100% done
  const earnedBadges = ORDERED_LEVELS.filter(lvl => {
    const total = Object.values(CRITERIA[lvl] || {}).reduce((s, a) => s + a.length, 0)
    if (!total) return false
    const allKeys = Object.values(CRITERIA[lvl]).flatMap(arr => arr.map(c => c.key))
    return allKeys.every(k => doneKeys.includes(k))
  })

  // Current badge criteria breakdown
  const cats = CRITERIA[childLevel] || {}

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .sidebar, .topbar, .no-print { display: none !important; }
          .page-content { padding: 0 !important; }
          .pass-card { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>

      <div className="page-content" style={{ maxWidth: 780 }}>
        {/* Toolbar */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Zurück</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ Drucken / PDF</button>
        </div>

        {/* Pass card */}
        <div ref={printRef} className="pass-card" style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 20, overflow: 'hidden',
        }}>
          {/* Header band */}
          <div style={{
            background: `linear-gradient(135deg, ${meta?.color || '#0096C7'}, ${meta?.color || '#00B4D8'}88)`,
            padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 20,
          }}>
            <Avatar name={`${child.first_name} ${child.last_name}`} size={72} radius={18} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 4 }}>
                Digitaler Letzschwamm Schwimmpass
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                {child.first_name} {child.last_name}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>
                {child.birth_date ? `Geb. ${new Date(child.birth_date).toLocaleDateString('de-DE')}` : ''}
                {child.birth_date && ' · '}
                Aktuelles Abzeichen: <strong>{t.levelLabel[childLevel] || childLevel}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>Fortschritt</div>
            </div>
          </div>

          <div style={{ padding: '24px 32px' }}>
            {/* Progress bar */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                <span>Fortschritt: {t.levelLabel[childLevel]}</span>
                <span>{doneKeys.filter(k => Object.values(cats).flatMap(a => a).some(c => c.key === k)).length} / {Object.values(cats).reduce((s, a) => s + a.length, 0)} Kriterien</span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,.1)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 10, transition: 'width .6s ease',
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${meta?.color || '#0096C7'}, ${meta?.color || '#00B4D8'}88)`,
                }} />
              </div>
            </div>

            {/* Earned badges / stamps */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                Erreichte Abzeichen
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {ORDERED_LEVELS.map(lvl => {
                  const m = BADGE_META[lvl]
                  const allKeys = Object.values(CRITERIA[lvl] || {}).flatMap(arr => arr.map(c => c.key))
                  const total = allKeys.length
                  if (!total) return null
                  const done = allKeys.filter(k => doneKeys.includes(k)).length
                  const earned = done === total
                  const inProgress = done > 0 && !earned
                  return (
                    <div key={lvl} style={{
                      width: 80, textAlign: 'center', opacity: earned ? 1 : inProgress ? 0.6 : 0.25,
                      transition: 'opacity .2s',
                    }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 6px',
                        background: earned ? `linear-gradient(135deg, ${m.color}, ${m.color}99)` : 'rgba(255,255,255,.06)',
                        border: `2.5px solid ${earned ? m.color : 'rgba(255,255,255,.12)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                        boxShadow: earned ? `0 4px 20px ${m.color}55` : 'none',
                        position: 'relative',
                      }}>
                        {m.icon}
                        {earned && (
                          <div style={{
                            position: 'absolute', bottom: -2, right: -2, width: 20, height: 20,
                            background: '#22C55E', borderRadius: '50%', fontSize: 11,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--deep)',
                          }}>✓</div>
                        )}
                        {inProgress && (
                          <div style={{
                            position: 'absolute', bottom: -2, right: -2, width: 20, height: 20,
                            background: 'var(--mid)', borderRadius: '50%', fontSize: 9,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--deep)', color: '#fff', fontWeight: 700,
                          }}>{Math.round(done/total*100)}%</div>
                        )}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: earned ? m.color : 'var(--muted)' }}>
                        {m.label}
                      </div>
                      {inProgress && (
                        <div style={{ fontSize: 9, color: 'var(--muted)' }}>{done}/{total}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Current badge criteria */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
                Kriterien: {t.levelLabel[childLevel]}
              </div>
              {Object.entries(cats).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                    {cat === 'swim' ? '🏊 Schwimmen' : cat === 'rescue' ? '🛟 Rettung' : '📚 Theorie'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {items.map(item => {
                      const done = doneKeys.includes(item.key)
                      return (
                        <div key={item.key} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                          background: done ? `${meta?.color || '#0096C7'}15` : 'rgba(255,255,255,.04)',
                          border: `1px solid ${done ? `${meta?.color || '#0096C7'}40` : 'rgba(255,255,255,.08)'}`,
                          borderRadius: 8,
                        }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                            background: done ? meta?.color || '#0096C7' : 'rgba(255,255,255,.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, color: '#fff', fontWeight: 700,
                          }}>
                            {done ? '✓' : ''}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: done ? 600 : 400, color: done ? 'var(--text)' : 'var(--muted)' }}>
                              {item.de.title}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                              {item.de.detail}
                            </div>
                          </div>
                          <div style={{
                            fontSize: 10, padding: '2px 6px', borderRadius: 6,
                            background: 'rgba(255,255,255,.06)', color: 'var(--muted)',
                          }}>
                            {item.de.tag}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 11, color: 'var(--muted)',
            }}>
              <div>Letzschwamm Schwimmschule Luxemburg</div>
              {child.access_code && (
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--aqua)' }}>
                  {child.access_code}
                </div>
              )}
              <div>{new Date().toLocaleDateString('de-DE')}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
