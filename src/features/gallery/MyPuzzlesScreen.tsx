import { useEffect, useState } from 'react'
import { HashLink } from '../../core/navigation/hashNavigation'
import {
  isPuzzleAvailableOn,
  PUZZLE_CATALOG,
} from '../../data/content/puzzleCatalog'
import type { PuzzleProgress, UserSettings } from '../../data/models'
import { readAllPuzzleProgress } from '../../data/repositories/puzzleProgressRepository'
import { PuzzleCard } from '../catalog/PuzzleCard'
import { useI18n } from '../../i18n/i18n'

export function MyPuzzlesScreen({ settings }: { settings: UserSettings }) {
  const { t } = useI18n()
  const [progress, setProgress] = useState<PuzzleProgress[] | null>(null)

  useEffect(() => {
    let active = true
    void readAllPuzzleProgress().then((result) => {
      if (active) setProgress(result.value ?? [])
    })
    return () => {
      active = false
    }
  }, [])

  const completed = (progress ?? [])
    .filter((item) => item.status === 'completed' && item.times_completed > 0)
    .map((item) => ({
      item,
      puzzle: PUZZLE_CATALOG.find((puzzle) => puzzle.puzzle_id === item.puzzle_id),
    }))
    .filter(
      (entry) =>
        entry.puzzle?.tier_id === settings.active_tier_id &&
        isPuzzleAvailableOn(entry.puzzle),
    )

  return (
    <section className="catalog-screen" aria-labelledby="my-puzzles-title">
      <header className="catalog-heading">
        <span aria-hidden="true">🧩</span>
        <div>
          <p className="eyebrow">{t('gallery.eyebrow')}</p>
          <h1 id="my-puzzles-title">{t('gallery.title')}</h1>
        </div>
      </header>

      {progress === null ? (
        <p className="empty-gallery" role="status">{t('gallery.opening')}</p>
      ) : completed.length === 0 ? (
        <div className="empty-gallery">
          <span aria-hidden="true">🖼️</span>
          <h2>{t('gallery.emptyTitle')}</h2>
          <p>{t('gallery.emptyText')}</p>
          <HashLink className="primary-button" to="/categories">{t('gallery.choose')}</HashLink>
        </div>
      ) : (
        <div className="puzzle-grid">
          {completed.map(({ item, puzzle }) => puzzle && (
            <PuzzleCard
              key={puzzle.puzzle_id}
              puzzle={puzzle}
              soundEnabled={settings.sound_enabled}
              completionCount={item.times_completed}
            />
          ))}
        </div>
      )}
    </section>
  )
}
