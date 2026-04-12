import { useAuth } from '../../context/AuthContext'

export default function MyStatus() {
  const { profile, signOut } = useAuth()

  return (
    <div className="page-content">
      <div className="topbar" style={{ padding: 0, marginBottom: 18 }}>
        <div>
          <div className="page-title">🏅 Mein Kurs-Status</div>
          <div className="page-sub">Kursteilnehmer-Bereich</div>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 20 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏅</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Willkommen, {profile?.name?.split(' ')[0] || 'Teilnehmer'}!
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
          Du bist als Kursteilnehmer registriert.<br />
          Sobald dein Instrukteur deinen Kurs eingerichtet hat, siehst du hier deinen Fortschritt.
        </div>
        {profile?.is_test && (
          <div style={{ marginTop: 20, display: 'inline-block', padding: '4px 12px', borderRadius: 6, background: 'rgba(244,165,26,.15)', border: '1px solid rgba(244,165,26,.3)', fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>
            🧪 TEST-KONTO
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>Konto-Info</div>
        <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Name</span>
            <span style={{ fontWeight: 600 }}>{profile?.name || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>E-Mail</span>
            <span style={{ fontWeight: 600 }}>{profile?.email || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted)' }}>Rolle</span>
            <span style={{ fontWeight: 600 }}>Kursteilnehmer</span>
          </div>
        </div>
      </div>
    </div>
  )
}
