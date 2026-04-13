import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CRITERIA } from '../lib/criteria'

// Category metadata — icon + multilingual label
const CAT_META = {
  admin:  { icon: '📋', label: { de: 'Administrativ', fr: 'Administratif',      lu: 'Administrativ',   en: 'Administrative'   } },
  prereq: { icon: '✅', label: { de: 'Voraussetzungen', fr: 'Prérequis',        lu: 'Viraussetzungen', en: 'Prerequisites'    }, optional: true },
  swim:   { icon: '🏊', label: { de: 'Schwimmen',       fr: 'Natation',         lu: 'Schwammen',       en: 'Swimming'         } },
  rescue: { icon: '🛟', label: { de: 'Rettung',         fr: 'Sauvetage',        lu: 'Rettung',         en: 'Rescue'           } },
  theory: { icon: '📚', label: { de: 'Erste Hilfe',     fr: 'Premiers secours', lu: 'Éischt Hëllef',   en: 'First aid'        } },
}

const CAT_ORDER = ['admin', 'prereq', 'swim', 'rescue', 'theory']

export default function CriteriaList({ level, doneKeys, onToggle, readOnly = false }) {
  const { lang } = useApp()

  const cats = CRITERIA[level]
  if (!cats) return null

  // Only show categories that exist for this level, in defined order
  const categories = CAT_ORDER.filter(c => cats[c]?.length > 0)

  // Accordion state: first category open, rest open by default for usability
  const [open, setOpen] = useState(() =>
    Object.fromEntries(categories.map(c => [c, true]))
  )

  function toggleCat(cat) {
    setOpen(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div className="ca-root">
      {categories.map(catKey => {
        const items   = cats[catKey]
        const meta    = CAT_META[catKey] || { icon: '📌', label: { de: catKey } }
        const label   = meta.label[lang] || meta.label.de
        const doneCnt = items.filter(i => doneKeys.includes(i.key)).length
        const allDone = doneCnt === items.length
        const isOpen  = open[catKey]

        return (
          <div key={catKey} className={`ca-section${allDone ? ' ca-all-done' : ''}`}>

            {/* ── Accordion header ─────────────────────────── */}
            <button className="ca-header" onClick={() => toggleCat(catKey)}>
              <span className="ca-icon">{meta.icon}</span>
              <span className="ca-label">
                {label}
                {meta.optional && <span className="ca-opt-badge">optional</span>}
              </span>
              <span className={`ca-count${allDone ? ' ca-count-done' : ''}`}>
                {doneCnt}/{items.length}
              </span>
              <span className="ca-chevron">{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* ── Progress bar ─────────────────────────────── */}
            <div className="ca-bar-wrap">
              <div
                className="ca-bar-fill"
                style={{ width: `${items.length ? (doneCnt / items.length) * 100 : 0}%` }}
              />
            </div>

            {/* ── Items ────────────────────────────────────── */}
            {isOpen && (
              <div className="ca-items">
                {items.map(item => {
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
                        {text.detail && (
                          <div className="crit-detail">{text.detail}</div>
                        )}
                      </div>
                      <div className="crit-tag">{text.tag}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
