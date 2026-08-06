import { useEffect, useRef } from 'react'
import { useI18n } from '../../i18n/i18n'

export function ScreenTimeReminder({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      className="reminder-backdrop"
      ref={dialogRef}
      aria-labelledby="break-title"
      onCancel={(event) => {
        event.preventDefault()
        onDismiss()
      }}
    >
      <section className="break-reminder">
        <span aria-hidden="true">🌿</span>
        <p className="eyebrow">{t('reminder.eyebrow')}</p>
        <h1 id="break-title">{t('reminder.title')}</h1>
        <p>{t('reminder.text')}</p>
        <button className="primary-button" type="button" autoFocus onClick={onDismiss}>
          {t('reminder.continue')}
        </button>
      </section>
    </dialog>
  )
}
