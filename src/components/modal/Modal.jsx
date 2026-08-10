import { useEffect } from 'react'
import styles from './Modal.module.css'
import { CloseIcon } from '../icons/Icons'

const Modal = ({ open, title, onClose, children, width = 620 }) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
      >
        <header className={styles.head}>
          <h2>{title}</h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Close dialog"
            onClick={() => onClose?.()}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
