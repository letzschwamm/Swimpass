export default function RainEffect() {
  return (
    <>
      <style>{`
        @keyframes wave-flow {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position:      'fixed',
          bottom:         0,
          left:           0,
          width:         '100%',
          height:         120,
          zIndex:        -1,
          pointerEvents: 'none',
          overflow:      'hidden',
          opacity:        0.22,
        }}
      >
        {/* Wave 1 — back layer, deep blue, slowest */}
        <svg
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          style={{
            position:   'absolute',
            bottom:      0,
            left:        0,
            width:      '200%',
            height:     '100%',
            willChange: 'transform',
            animation:  'wave-flow 16s linear infinite',
          }}
        >
          <path
            d="M0,80 C240,50 480,110 720,80 C960,50 1200,110 1440,80 C1680,50 1920,110 2160,80 C2400,50 2640,110 2880,80 L2880,120 L0,120 Z"
            fill="#0077B6"
          />
        </svg>

        {/* Wave 2 — middle layer, light blue, medium speed, opposite phase */}
        <svg
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          style={{
            position:   'absolute',
            bottom:      0,
            left:        0,
            width:      '200%',
            height:     '88%',
            willChange: 'transform',
            animation:  'wave-flow 10s linear -3s infinite',
          }}
        >
          <path
            d="M0,70 C240,95 480,45 720,70 C960,95 1200,45 1440,70 C1680,95 1920,45 2160,70 C2400,95 2640,45 2880,70 L2880,120 L0,120 Z"
            fill="#00B4D8"
          />
        </svg>

        {/* Wave 3 — front layer, aqua, fastest, tighter oscillation */}
        <svg
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          style={{
            position:   'absolute',
            bottom:      0,
            left:        0,
            width:      '200%',
            height:     '72%',
            willChange: 'transform',
            animation:  'wave-flow 7s linear -1s infinite',
          }}
        >
          <path
            d="M0,90 C120,70 240,110 360,90 C480,70 600,110 720,90 C840,70 960,110 1080,90 C1200,70 1320,110 1440,90 C1560,70 1680,110 1800,90 C1920,70 2040,110 2160,90 C2280,70 2400,110 2520,90 C2640,70 2760,110 2880,90 L2880,120 L0,120 Z"
            fill="#48CAE4"
          />
        </svg>
      </div>
    </>
  )
}
