import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CRITERIA } from '../lib/criteria'

export default function CriteriaList({ level, doneKeys, onToggle, readOnly = false }) {
  const { lang, t } = useApp()
  const [activeTab, setActiveTab] = useState('swim')

  const cats = CRITERIA[level]
  if (!cats) return null

  const items = cats[activeTab] || []

  return (
    <div>
      <div className="criteria-tabs">
        {['swim', 'rescue', 'theory'].map(tab => (
          <button
            key={tab}
            className={`ctab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t.tabs[tab]}
          </button>
        ))}
      </div>

      <div className="crit-list">
        {items.map((item) => {
          const done = doneKeys.includes(item.key)
          const text = item[lang] || item.de
          return (
            <div
              key={item.key}
              className={`crit-item${done ? ' done' : ''}`}
              onClick={() => !readOnly && onToggle && onToggle(item.key, !done)}
              style={{ cursor: readOnly ? 'default' : 'pointer' }}
            >
              <div className="crit-check">{done ? '✓' : ''}</div>
              <div className="crit-text">
                <div className="crit-title">{text.title}</div>
                <div className="crit-detail">{text.detail}</div>
              </div>
              <div className="crit-tag">{text.tag}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
