import { useEffect, useState, useMemo } from 'react'
import { useInstructorLevel } from '../../hooks/useInstructorLevel'

// ── Confetti (blau + gold, einmalig beim Laden) ──────────────────────────────
function Confetti({ color1, color2 }) {
  const pieces = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${(i * 2) % 100}%`,
      delay: `${(i * 0.09) % 1.8}s`,
      duration: `${2.2 + (i % 5) * 0.35}s`,
      color: [color1, color2, '#fff', color1, color2][i % 5],
      size: `${6 + (i % 5)}px`,
      round: i % 3 === 0,
    }))
  , [color1, color2])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      <style>{`
        @keyframes levelConfettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(600deg); opacity: 0; }
        }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: 0, left: p.left,
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.round ? '50%' : '2px',
          animation: `levelConfettiFall ${p.duration} ${p.delay} forwards`,
        }} />
      ))}
    </div>
  )
}

// ── Animated progress bar ───────────────────────────────────────────────────
function ProgressBar({ value, color1, color2, height = 8 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 150)
    return () => clearTimeout(t)
  }, [value])
  return (
    <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 99, height, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 99,
        background: `linear-gradient(90deg, ${color1}, ${color2})`,
        width: `${width}%`,
        transition: 'width 1.4s cubic-bezier(.4,0,.2,1)',
      }} />
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function InstructorLevels() {
  const { count, totalCourses, loading, current, nextLevel, progressToNext, levels } = useInstructorLevel()
  const [showConfetti, setShowConfetti] = useState(false)

  // Show confetti once on load (for all levels ≥ 1 — celebrating progress!)
  useEffect(() => {
    if (!loading) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 6000)
      return () => clearTimeout(t)
    }
  }, [loading])

  return (
    <div className="page-content">
      <style>{`
        @keyframes lvlCardReveal {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lvlShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes lvlGlow {
          0%, 100% { box-shadow: 0 0 18px rgba(244,165,26,.25), 0 4px 24px rgba(0,0,0,.3); }
          50%       { box-shadow: 0 0 32px rgba(244,165,26,.5),  0 4px 32px rgba(0,0,0,.4); }
        }
        @keyframes lvlPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }
      `}</style>

      {showConfetti && <Confetti color1={current.color} color2="#F4A51A" />}

      {/* Header */}
      <div className="topbar" style={{ padding: 0, marginBottom: 24 }}>
        <div>
          <div className="page-title">🏆 Meine Level</div>
          <div className="page-sub">
            {loading ? 'Laden...' : `${count} Kurs${count !== 1 ? 'e' : ''} abgeschlossen · ${current.emoji} ${current.name}`}
          </div>
        </div>
      </div>

      {!loading && (
        <>
          {/* ── Hero: Aktuelles Level ── */}
          <div style={{
            background: `linear-gradient(135deg, var(--card), ${current.bg})`,
            border: `2px solid ${current.color}55`,
            borderRadius: 22,
            padding: '30px 28px',
            marginBottom: 24,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            animation: current.level === 4
              ? 'lvlCardReveal .5s ease forwards, lvlGlow 3s ease-in-out 1s infinite'
              : 'lvlCardReveal .5s ease forwards',
          }}>
            {/* Gold shimmer overlay */}
            {current.level >= 3 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,.07) 50%, transparent 65%)',
                backgroundSize: '200% 100%',
                animation: 'lvlShimmer 3s linear infinite',
              }} />
            )}

            <div style={{
              fontSize: 72, marginBottom: 12, lineHeight: 1,
              animation: current.level >= 2 ? 'lvlPulse 3s ease-in-out infinite' : 'none',
              display: 'inline-block',
            }}>
              {current.emoji}
            </div>

            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: current.color, marginBottom: 4 }}>
              {current.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: nextLevel ? 22 : 12 }}>
              Level {current.level} · {count} {count !== 1 ? 'Kurse' : 'Kurs'} abgeschlossen
            </div>

            {nextLevel ? (
              <>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
                  Noch <strong style={{ color: current.color }}>{nextLevel.min - count}</strong> Kurs{nextLevel.min - count !== 1 ? 'e' : ''} bis {nextLevel.emoji} <strong>{nextLevel.name}</strong>
                </div>
                <div style={{ maxWidth: 300, margin: '0 auto 6px' }}>
                  <ProgressBar value={progressToNext} color1={current.color} color2={nextLevel.color} />
                </div>
                <div style={{ fontSize: 11, color: current.color, fontWeight: 700 }}>
                  {progressToNext}% zum nächsten Level
                </div>
              </>
            ) : (
              <div style={{ fontSize: 14, color: '#F4A51A', fontWeight: 700, letterSpacing: '.3px' }}>
                🏆 Maximales Level erreicht — du bist ein Wal!
              </div>
            )}
          </div>

          {/* ── Alle Level als Cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {levels.map((lvl, i) => {
              const achieved  = count >= lvl.min
              const isCurrent = lvl.level === current.level
              const nextLvl   = levels.find(l => l.level === lvl.level + 1)

              return (
                <div
                  key={lvl.level}
                  style={{
                    background: achieved
                      ? `linear-gradient(135deg, var(--card) 60%, ${lvl.bg})`
                      : 'rgba(255,255,255,.025)',
                    border: isCurrent
                      ? `2px solid ${lvl.color}77`
                      : achieved
                      ? `1.5px solid ${lvl.color}33`
                      : '1.5px solid rgba(255,255,255,.07)',
                    borderRadius: 16,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    opacity: achieved ? 1 : 0.5,
                    animation: `lvlCardReveal .45s ease ${i * 0.08}s both`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Shimmer für Gold */}
                  {isCurrent && lvl.level === 4 && (
                    <div style={{
                      position: 'absolute', inset: 0, pointerEvents: 'none',
                      background: 'linear-gradient(105deg, transparent 35%, rgba(244,165,26,.08) 50%, transparent 65%)',
                      backgroundSize: '200% 100%',
                      animation: 'lvlShimmer 2.5s linear infinite',
                    }} />
                  )}

                  {/* Emoji */}
                  <div style={{
                    fontSize: 34, width: 46, textAlign: 'center', flexShrink: 0,
                    filter: achieved ? 'none' : 'grayscale(100%) brightness(.6)',
                  }}>
                    {achieved ? lvl.emoji : '🔒'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, color: achieved ? lvl.color : 'var(--muted)' }}>
                        {lvl.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>Level {lvl.level}</div>
                      {isCurrent && (
                        <div style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 99,
                          background: `${lvl.color}22`, color: lvl.color,
                          fontWeight: 700, border: `1px solid ${lvl.color}44`,
                        }}>
                          AKTUELL
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: isCurrent && nextLevel ? 8 : 0 }}>
                      {lvl.level < 4
                        ? `${lvl.min}–${lvl.max} abgeschlossene Kurse`
                        : `${lvl.min}+ abgeschlossene Kurse`}
                    </div>

                    {/* Fortschrittsbalken für aktuelles Level */}
                    {isCurrent && nextLvl && (
                      <div style={{ maxWidth: 200 }}>
                        <ProgressBar value={progressToNext} color1={lvl.color} color2={nextLvl.color} height={5} />
                      </div>
                    )}
                  </div>

                  {/* Status rechts */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    {isCurrent ? (
                      <div style={{ fontSize: 20 }}>{lvl.emoji}</div>
                    ) : achieved ? (
                      <div style={{ fontSize: 16, color: 'var(--green)' }}>✅</div>
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        🔒 ab {lvl.min}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Info footer */}
          <div style={{
            marginTop: 22, padding: '14px 18px',
            background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)',
            borderRadius: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.8,
          }}>
            <strong style={{ color: 'var(--text)' }}>Wie wird das Level berechnet?</strong><br />
            Gezählt werden Kurse mit Status "Abgeschlossen" sowie Kurse mit mindestens einem bestandenen Teilnehmer (JL oder LF bestanden).
            Du hast insgesamt {totalCourses} Kurs{totalCourses !== 1 ? 'e' : ''} erstellt.
          </div>
        </>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontSize: 13 }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: 28, height: 28 }} />
          Level werden berechnet...
        </div>
      )}
    </div>
  )
}
