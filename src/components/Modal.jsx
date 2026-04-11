import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ open, onClose, title, subtitle, children, actions }) {
  // Toggle body class so CSS can hide the hamburger button
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open')
      return () => document.body.classList.remove('modal-open')
    }
  }, [open])

  if (!open) return null

  // Portal renders at document.body — outside any parent stacking context.
  // This means z-index: 9999 on the overlay works against the true root,
  // not against an ancestor with transform (page animation) that would trap it.
  return createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {(title || subtitle) && (
          <div className="modal-header">
            {title && <div className="modal-title">{title}</div>}
            {subtitle && <div className="modal-sub">{subtitle}</div>}
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
        {actions && (
          <div className="modal-footer">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
