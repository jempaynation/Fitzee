import { useEffect, useState } from 'react'
import { HashLink } from '../../core/navigation/hashNavigation'
import { playCompletionCue } from '../../core/utils/audio'
import type { PuzzleCatalogEntry } from '../../data/content/puzzleCatalog'
import type { UserSettings } from '../../data/models'
import { readPuzzleProgress } from '../../data/repositories/puzzleProgressRepository'
import { useI18n } from '../../i18n/i18n'

export function PuzzleCompleteScreen({
  puzzle,
  settings,
}: {
  puzzle: PuzzleCatalogEntry
  settings: UserSettings
}) {
  const { t, puzzleName } = useI18n()
  const [canContinue, setCanContinue] = useState(false)
  const [firstCompletion, setFirstCompletion] = useState(false)

  useEffect(() => {
    playCompletionCue(settings.sound_enabled)
    let timer = window.setTimeout(() => setCanContinue(true), 2500)
    void readPuzzleProgress(puzzle.puzzle_id).then((result) => {
      setFirstCompletion((result.value?.times_completed ?? 0) === 1)
      if ((result.value?.times_completed ?? 0) > 1) {
        window.clearTimeout(timer)
        setCanContinue(true)
      }
    })
    return () => window.clearTimeout(timer)
  }, [puzzle.puzzle_id, settings.sound_enabled])

  return (
    <section className="completion-card" aria-labelledby="completion-title">
      <div className="confetti" aria-hidden="true">
        {['⭐', '●', '◆', '⭐', '●', '◆', '⭐', '●'].map((shape, index) => (
          <span key={index}>{shape}</span>
        ))}
      </div>
      <p className="eyebrow">{t('complete.eyebrow')}</p>
      <h1 id="completion-title">{t('complete.title')}</h1>
      <img className="completion-picture" src={puzzle.sourceUrl} alt={puzzle.alt_text} />
      <h2>{puzzleName(puzzle.display_name)}</h2>
      <p>{t('complete.saved')}</p>
      <div className="reward-reveal" aria-label={firstCompletion ? 'One star and a new picture sticker earned' : 'One star earned'}>
        <span aria-hidden="true">⭐</span>
        <strong>{t('complete.star')}</strong>
        {firstCompletion && <span>{t('complete.sticker')}</span>}
      </div>
      <div className="completion-actions">
        <HashLink
          className={`primary-button${canContinue ? '' : ' primary-button--waiting'}`}
          to={canContinue ? '/my_puzzles' : `/puzzle_complete/${puzzle.puzzle_id}`}
          aria-disabled={!canContinue}
          onClick={(event) => {
            if (!canContinue) event.preventDefault()
          }}
        >
          {canContinue ? t('complete.gallery') : t('complete.celebrating')}
        </HashLink>
        {canContinue && (
          <HashLink className="secondary-button" to={`/puzzle_play/${puzzle.puzzle_id}`}>
            {t('complete.replay')}
          </HashLink>
        )}
      </div>
    </section>
  )
}
