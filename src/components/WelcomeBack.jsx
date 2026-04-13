import { useEffect, useState, useRef, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const MESSAGES = {
  de: (n) => `Willkommen zurück, ${n}! 👋`,
  fr: (n) => `Bon retour, ${n}! 👋`,
  lu: (n) => `Wëllkomm zréck, ${n}! 👋`,
  en: (n) => `Welcome back, ${n}! 👋`,
}

export default function WelcomeBack() {
  const { profile } = useAuth()
  const { lang }    = useApp()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef([])

  // Stable particle positions — re-randomised each time component mounts
  const particles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id:    i,
      left:  `${6 + Math.random() * 88}%`,
      top:   `${10 + Math.random() * 80}%`,
      size:  2.5 + Math.random() * 4.5,
      delay: (Math.random() * 1.4).toFixed(2),
      dur:   (0.9 + Math.random() * 1.1).toFixed(2),
    }))
  , [])

  useEffect(() => {
    if (!profile) return
    const flag = sessionStorage.getItem('swimpass_wb')
    if (!flag) return
    sessionStorage.removeItem('swimpass_wb')

    setVisible(true)
    setLeaving(false)

    const t1 = setTimeout(() => setLeaving(true),  1900)
    const t2 = setTimeout(() => setVisible(false), 2700)
    timers.current = [t1, t2]

    return () => timers.current.forEach(clearTimeout)
  }, [profile])

  if (!visible) return null

  const firstName = (profile?.name || '').split(' ')[0]
                 || (profile?.email || '').split('@')[0]
                 || '…'

  const message = (MESSAGES[lang] || MESSAGES.de)(firstName)

  return (
    <>
      <style>{`
        @keyframes wb-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes wb-fade-out { from { opacity: 1 } to { opacity: 0 } }

        @keyframes wb-rise-in {
          0%   { opacity: 0; transform: scale(.80) translateY(20px) }
          60%  { opacity: 1; transform: scale(1.04) translateY(0) }
          100% { opacity: 1; transform: scale(1) translateY(0) }
        }
        @keyframes wb-rise-out {
          from { opacity: 1; transform: scale(1) translateY(0) }
          to   { opacity: 0; transform: scale(.93) translateY(-14px) }
        }
        @keyframes wb-glow-pulse {
          0%, 100% {
            text-shadow:
              0 0 16px rgba(244,165,26,.80),
              0 0 40px rgba(244,165,26,.45),
              0 0 80px rgba(244,165,26,.25),
              0 2px 8px rgba(0,0,0,.6);
          }
          50% {
            text-shadow:
              0 0 28px rgba(244,165,26,1),
              0 0 60px rgba(244,165,26,.70),
              0 0 120px rgba(244,165,26,.40),
              0 2px 8px rgba(0,0,0,.6);
          }
        }
        @keyframes wb-star {
          0%   { transform: translateY(0)     scale(1);   opacity: .85 }
          100% { transform: translateY(-72px) scale(0.1); opacity: 0 }
        }
      `}</style>

      {/* ── Backdrop ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position:           'fixed',
          inset:               0,
          zIndex:              9999,
          pointerEvents:      'none',
          background:         'rgba(6,16,28,0.72)',
          backdropFilter:     'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          display:            'flex',
          alignItems:         'center',
          justifyContent:     'center',
          animation:          leaving
            ? 'wb-fade-out .8s ease forwards'
            : 'wb-fade-in .35s ease forwards',
        }}
      >
        {/* ── Floating gold particles ─────────────────────────────────── */}
        {particles.map(p => (
          <span
            key={p.id}
            style={{
              position:     'absolute',
              left:          p.left,
              top:           p.top,
              width:         p.size,
              height:        p.size,
              borderRadius: '50%',
              background:   'radial-gradient(circle, #FFE566 20%, #F4A51A 80%)',
              boxShadow:    `0 0 ${p.size * 2.5}px 1px rgba(244,165,26,.75)`,
              animation:    `wb-star ${p.dur}s ${p.delay}s ease-out infinite`,
            }}
          />
        ))}

        {/* ── Welcome text ───────────────────────────────────────────── */}
        <p
          style={{
            margin:      0,
            fontFamily: 'Syne, sans-serif',
            fontWeight:  800,
            fontSize:   'clamp(20px, 5.5vw, 38px)',
            color:      '#F4A51A',
            textAlign:  'center',
            padding:    '0 32px',
            lineHeight:  1.35,
            letterSpacing: '.01em',
            animation:  leaving
              ? 'wb-rise-out .8s ease forwards'
              : 'wb-rise-in .5s ease forwards, wb-glow-pulse 1.6s .5s ease-in-out infinite',
            textShadow: '0 0 16px rgba(244,165,26,.8), 0 0 40px rgba(244,165,26,.45), 0 2px 8px rgba(0,0,0,.6)',
          }}
        >
          {message}
        </p>
      </div>
    </>
  )
}
