import { HashLink } from '../../core/navigation/hashNavigation'
import { playNavigationCue } from '../../core/utils/audio'
import type { PuzzleCatalogEntry } from '../../data/content/puzzleCatalog'
import { useI18n } from '../../i18n/i18n'

export function PuzzleCard({
  puzzle,
  soundEnabled,
  completionCount,
}: {
  puzzle: PuzzleCatalogEntry
  soundEnabled: boolean
  completionCount?: number
}) {
  const { t, puzzleName } = useI18n()
  return (
    <HashLink
      className="puzzle-card"
      to={`/puzzle_play/${encodeURIComponent(puzzle.puzzle_id)}`}
      onPointerDown={() => playNavigationCue(soundEnabled)}
    >
      <img src={puzzle.sourceUrl} alt={puzzle.alt_text} />
      <span className="puzzle-card__body">
        <strong>{puzzleName(puzzle.display_name)}</strong>
        <span>{t('card.pieces', { count: puzzle.piece_count })}</span>
        {completionCount !== undefined && (
          <span className="puzzle-card__complete">
            {completionCount > 1
              ? t('card.finishedTimes', { count: completionCount })
              : t('card.finished')}
          </span>
        )}
      </span>
    </HashLink>
  )
}
