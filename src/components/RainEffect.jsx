import { useEffect, useRef } from 'react'

const N = 18  // simultaneous drops

export default function RainEffect() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width  = W
    canvas.height = H

    function onResize() {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width  = W
      canvas.height = H
    }
    window.addEventListener('resize', onResize)

    // ── Drop factory ─────────────────────────────────────────────────────────
    function mkDrop(stagger = false) {
      return {
        x:    Math.random() * W,
        y:    stagger ? Math.random() * H * 0.75 : -(20 + Math.random() * 40),
        vy:   3 + Math.random() * 5,
        len:  10 + Math.random() * 18,
        lw:   0.6 + Math.random() * 0.6,
        a:    0.55 + Math.random() * 0.45,
        hitY: H * 0.48 + Math.random() * H * 0.48,
        phase: 'fall',
        rr:    0,
        rrMax: 10 + Math.random() * 16,
        ra:    0,
      }
    }

    const drops = Array.from({ length: N }, () => mkDrop(true))

    // ── Animation loop ────────────────────────────────────────────────────────
    function tick() {
      ctx.clearRect(0, 0, W, H)

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]

        if (d.phase === 'fall') {
          // Rain streak with gradient fade-in from top
          const grd = ctx.createLinearGradient(d.x, d.y - d.len, d.x, d.y)
          grd.addColorStop(0, `rgba(190,230,248,0)`)
          grd.addColorStop(1, `rgba(190,230,248,${d.a})`)

          ctx.beginPath()
          ctx.moveTo(d.x + 0.4, d.y - d.len)
          ctx.lineTo(d.x,       d.y)
          ctx.strokeStyle = grd
          ctx.lineWidth   = d.lw
          ctx.stroke()

          d.y += d.vy

          if (d.y >= d.hitY) {
            d.phase = 'ripple'
            d.rr    = 0
            d.ra    = d.a
          }

        } else {
          // Ripple — expanding ellipses (perspective foreshortening on glass)
          d.rr += 0.85
          d.ra -= 0.021

          if (d.ra > 0 && d.rr < d.rrMax) {
            // Outer ring
            ctx.beginPath()
            ctx.ellipse(d.x, d.hitY, d.rr, d.rr * 0.36, 0, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(144,220,240,${d.ra})`
            ctx.lineWidth   = 0.9
            ctx.stroke()

            // Inner ring — trails slightly behind
            if (d.rr > 5) {
              ctx.beginPath()
              ctx.ellipse(d.x, d.hitY, d.rr * 0.52, d.rr * 0.52 * 0.36, 0, 0, Math.PI * 2)
              ctx.strokeStyle = `rgba(144,220,240,${d.ra * 0.42})`
              ctx.lineWidth   = 0.5
              ctx.stroke()
            }
          } else {
            drops[i] = mkDrop(false)
          }
        }
      }

      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:          0,
        width:         '100%',
        height:        '100%',
        zIndex:        -1,
        pointerEvents: 'none',
        opacity:        0.25,
      }}
    />
  )
}
