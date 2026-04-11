import { useApp } from '../../context/AppContext'
import Avatar from '../../components/Avatar'

export default function Step5Success({ data, onDone }) {
  const { t } = useApp()
  const ob = t.onboarding.success

  const childName = `${data.firstName} ${data.lastName}`.trim() || '—'
  const classInfo = data.classInfo
    ? `${data.classInfo.name} · ${data.classInfo.day} ${data.classInfo.time}`
    : '—'

  return (
    <div className="ob-step" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="success-screen">
        <div className="success-anim">🎉</div>
        <div className="success-title">{ob.title}</div>
        <div className="success-sub">{ob.sub}</div>

        <div className="success-child-card">
          <Avatar name={childName} size={48} radius={14} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700 }}>{childName}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{classInfo}</div>
          </div>
          <div className="success-badge">{ob.active}</div>
        </div>

        <div className="admin-notif">
          <Avatar name="Letzschwamm" size={36} radius={10} />
          <div className="admin-notif-text">
            <strong>Letzschwamm</strong><br />
            {ob.adminNotif}
          </div>
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={onDone}>
          {ob.done}
        </button>
      </div>
    </div>
  )
}
