// Professional initials avatar — like Google / Slack
const PALETTE = [
  ['#0077B6', '#00B4D8'], // ocean blue
  ['#6D28D9', '#8B5CF6'], // purple
  ['#047857', '#34D399'], // emerald
  ['#B45309', '#F59E0B'], // amber
  ['#9333EA', '#C084FC'], // violet
  ['#0E7490', '#22D3EE'], // cyan
  ['#BE185D', '#F472B6'], // pink
  ['#0F766E', '#2DD4BF'], // teal
  ['#1D4ED8', '#60A5FA'], // blue
  ['#7C2D12', '#FB923C'], // orange
]

function hashStr(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i)
  return Math.abs(h)
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return '?'
}

export default function Avatar({ name = '', size = 32, radius = 8, style = {} }) {
  const [from, to] = PALETTE[hashStr(name || '?') % PALETTE.length]
  const fontSize = Math.max(10, Math.round(size * 0.38))

  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(135deg, ${from}, ${to})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, color: '#fff',
      flexShrink: 0, letterSpacing: '-0.5px',
      fontFamily: 'Syne, sans-serif',
      userSelect: 'none',
      boxShadow: `0 2px 10px ${from}55`,
      ...style,
    }}>
      {getInitials(name)}
    </div>
  )
}
