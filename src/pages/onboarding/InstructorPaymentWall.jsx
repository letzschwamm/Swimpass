import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const STRIPE_LINK = import.meta.env.VITE_STRIPE_INSTRUCTOR_LINK || 'https://buy.stripe.com/28E9AT6wN5pk31y4td7kc02'

export default function InstructorPaymentWall() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="login-container" style={{
      background: 'radial-gradient(ellipse at 20% 80%, rgba(0,150,199,.18) 0%, transparent 55%), linear-gradient(160deg, #0D1F30 0%, #112840 50%, #163558 100%)'
    }}>
      <div className="login-card">
        <div className="login-logo">
          <div style={{ width: 80, height: 80, borderRadius: 20, overflow: 'hidden', margin: '0 auto 14px', boxShadow: '0 4px 20px rgba(0,0,0,.35)' }}>
            <img src="/swimpass_icon_final.png" alt="SwimPass" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, textAlign: 'center', background: 'linear-gradient(135deg, #fff, var(--aqua))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SwimPass</div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>by Letzschwamm</div>
        </div>

        <div style={{ marginTop: 28, marginBottom: 20, background: 'linear-gradient(135deg, rgba(0,150,199,.15), rgba(72,202,228,.08))', border: '1.5px solid rgba(72,202,228,.3)', borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>Instrukteur-Zugang</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, color: 'var(--aqua)' }}>49€</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>pro Jahr · inkl. 17% TVA</div>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            ✓ Unbegrenzte Sauvetage-Kurse<br />
            ✓ B1 & B2 Formulare automatisch<br />
            ✓ Teilnehmerverwaltung
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
          Dein Konto wurde erstellt. Um die App zu nutzen, musst du zuerst das Jahresabo bezahlen.
        </div>

        <a
          href={STRIPE_LINK}
          className="btn btn-primary btn-full btn-lg"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: 10 }}
        >
          💳 Jetzt bezahlen — 49€/Jahr
        </a>

        <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginBottom: 20 }}>
          🔒 Sichere Zahlung via Stripe
        </div>

        <button className="btn btn-ghost btn-full" onClick={handleLogout} style={{ fontSize: 12 }}>
          Abmelden
        </button>
      </div>
    </div>
  )
}
