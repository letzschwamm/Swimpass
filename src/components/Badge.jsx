import { BADGE_META } from '../lib/criteria'

export default function Badge({ children, variant = 'blue', level }) {
  // If a level is passed, use BADGE_META for coloring
  if (level && BADGE_META[level]) {
    const meta = BADGE_META[level]
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 20,
        background: meta.bg, border: `1px solid ${meta.border}`,
        color: meta.color, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.3px',
      }}>
        {children}
      </span>
    )
  }
  return <span className={`badge badge-${variant}`}>{children}</span>
}
