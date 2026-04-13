import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function ConsentModal({ onAccept, onDecline }) {
  const { t } = useApp()
  const c = t.consent
  const [checked, setChecked] = useState(false)

  return (
    <>
      <style>{`
        .cm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 15, 26, 0.88);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .cm-card {
          background: linear-gradient(160deg, #1E3448 0%, #162535 100%);
          border: 1px solid rgba(144, 220, 240, 0.20);
          border-radius: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        .cm-top {
          flex-shrink: 0;
          padding: 28px 28px 0;
          text-align: center;
        }
        .cm-logo-icon {
          width: 56px; height: 56px;
          border-radius: 14px;
          overflow: hidden;
          margin: 0 auto 10px;
          box-shadow: 0 4px 16px rgba(0,0,0,.35);
        }
        .cm-logo-name {
          font-family: Syne, sans-serif;
          font-weight: 800;
          font-size: 22px;
          background: linear-gradient(135deg, #fff, var(--aqua));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 4px;
        }
        .cm-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          margin: 14px 0 0;
          line-height: 1.3;
        }
        .cm-divider {
          flex-shrink: 0;
          height: 1px;
          background: var(--border);
          margin: 16px 0 0;
        }
        .cm-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 28px;
          -webkit-overflow-scrolling: touch;
        }
        .cm-body::-webkit-scrollbar { width: 4px; }
        .cm-body::-webkit-scrollbar-track { background: transparent; }
        .cm-body::-webkit-scrollbar-thumb { background: rgba(144,220,240,.25); border-radius: 2px; }
        .cm-intro {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.65;
          margin-bottom: 16px;
        }
        .cm-section-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--aqua);
          letter-spacing: .5px;
          text-transform: uppercase;
          margin: 14px 0 6px;
        }
        .cm-section-text {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.6;
        }
        .cm-list {
          margin: 0;
          padding-left: 18px;
          list-style: none;
        }
        .cm-list li {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 3px;
          position: relative;
        }
        .cm-list li::before {
          content: '·';
          position: absolute;
          left: -12px;
          color: var(--aqua);
          font-size: 14px;
        }
        .cm-bottom {
          flex-shrink: 0;
          padding: 16px 28px 24px;
          border-top: 1px solid var(--border);
          background: linear-gradient(160deg, #1E3448 0%, #162535 100%);
        }
        .cm-checkbox-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 16px;
          cursor: pointer;
        }
        .cm-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 2px solid var(--border);
          flex-shrink: 0;
          margin-top: 1px;
          transition: border-color .15s, background .15s;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          cursor: pointer;
        }
        .cm-checkbox.checked {
          border-color: var(--blue);
          background: var(--blue);
        }
        .cm-checkbox-label {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.5;
          user-select: none;
        }
        .cm-buttons {
          display: flex;
          gap: 10px;
        }
        .cm-btn-decline {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,.06);
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background .15s;
        }
        .cm-btn-decline:hover { background: rgba(255,255,255,.1); }
        .cm-btn-accept {
          flex: 2;
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, var(--blue), var(--mid));
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity .15s;
        }
        .cm-btn-accept:disabled {
          opacity: .35;
          cursor: not-allowed;
        }
        .cm-btn-accept:not(:disabled):hover { opacity: .9; }
      `}</style>

      <div className="cm-overlay">
        <div className="cm-card">

          {/* ── Top: logo + title ─────────────────────────────────────── */}
          <div className="cm-top">
            <div className="cm-logo-icon">
              <img src="/swimpass_icon_final.png" alt="SwimPass" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div className="cm-logo-name">SwimPass</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>by Letzschwamm</div>
            <div className="cm-title">{c.title}</div>
          </div>
          <div className="cm-divider" />

          {/* ── Scrollable body ───────────────────────────────────────── */}
          <div className="cm-body">
            <p className="cm-intro">{c.intro}</p>

            {c.sections.map((sec, i) => (
              <div key={i}>
                <div className="cm-section-title">{sec.title}</div>
                {sec.items
                  ? <ul className="cm-list">{sec.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
                  : <p className="cm-section-text">{sec.text}</p>
                }
              </div>
            ))}
          </div>

          {/* ── Footer: checkbox + buttons ────────────────────────────── */}
          <div className="cm-bottom">
            <label className="cm-checkbox-row" onClick={() => setChecked(v => !v)}>
              <div className={`cm-checkbox${checked ? ' checked' : ''}`}>
                {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="cm-checkbox-label">{c.checkboxLabel}</span>
            </label>

            <div className="cm-buttons">
              <button className="cm-btn-decline" onClick={onDecline}>{c.decline}</button>
              <button className="cm-btn-accept" onClick={onAccept} disabled={!checked}>{c.accept}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
