import { useNavigate } from 'react-router-dom'

export default function BackButton({ to, label = 'Zurück' }) {
  const navigate = useNavigate()
  const handleBack = () => to ? navigate(to) : navigate(-1)

  return (
    <button className="back-btn" onClick={handleBack}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {label}
    </button>
  )
}
