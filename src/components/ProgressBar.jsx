export default function ProgressBar({ value, className = '' }) {
  return (
    <div className={`prog-wrap ${className}`}>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${value}%` }} />
      </div>
      <div className="prog-pct">{value}%</div>
    </div>
  )
}
