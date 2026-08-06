import { useState } from 'react'
import { deleteAllLocalData } from '../../data/repositories/localDataRepository'

export function ParentPrivacy({ onDataDeleted }: { onDataDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const deleteData = async () => {
    if (deleting) return
    setDeleting(true)
    setDeleteError(null)

    const deleted = await deleteAllLocalData().catch(() => false)
    if (deleted) {
      onDataDeleted()
      return
    }

    setDeleting(false)
    setDeleteError(
      'Fitzee could not confirm that all local data was deleted. Your progress may still be stored in this browser. Please try again.',
    )
  }

  return (
    <section className="parent-panel privacy-panel" aria-labelledby="privacy-title">
      <p className="eyebrow">Plain-language policy</p>
      <h1 id="privacy-title">Privacy & local data</h1>

      <div className="privacy-summary">
        <h2>Fitzee’s app code does not collect or transmit gameplay or child records.</h2>
        <ul>
          <li>No account, name, photo, voice, location, email, or advertising identifier is requested from a child.</li>
          <li>Puzzle progress, rewards, preferences, and the chosen age tier stay in this browser’s IndexedDB storage.</li>
          <li>No advertising, analytics, tracking pixels, remote fonts, or remotely hosted scripts run in the child experience.</li>
          <li>Fitzee has no app backend or cloud sync in v1, and its app code does not sell or share locally stored records.</li>
          <li>
            <a
              href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Pages
            </a>{' '}
            hosts this site. GitHub states that it logs and stores a visitor’s IP address for security, whether or not the visitor is
            signed in, and may process standard service and website usage information under its{' '}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noreferrer"
            >
              privacy statement
            </a>
            .
          </li>
          <li>Clearing browser storage, using private browsing, or using the action below can erase local progress.</li>
        </ul>
        <p>
          <strong>Contact:</strong>{' '}
          <a href="https://github.com/jempaynation/Fitzee" target="_blank" rel="noreferrer">
            The public Fitzee repository
          </a>{' '}
          is the support channel for this pre-release build. A dedicated parent contact address must be added before a commercial launch.
        </p>
      </div>

      <div className="danger-zone">
        <h2>Delete local data</h2>
        <p>This removes settings, puzzle progress, and rewards from this browser. It cannot be undone.</p>
        {!confirming ? (
          <button
            className="danger-button"
            type="button"
            onClick={() => {
              setDeleteError(null)
              setConfirming(true)
            }}
          >
            Start delete
          </button>
        ) : (
          <div className="delete-confirmation">
            <strong>Delete all Fitzee data on this browser?</strong>
            {deleteError ? <p role="alert">{deleteError}</p> : null}
            <div>
              <button className="danger-button" type="button" disabled={deleting} onClick={() => void deleteData()}>
                {deleting ? 'Deleting…' : 'Yes, delete local data'}
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteError(null)
                  setConfirming(false)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
