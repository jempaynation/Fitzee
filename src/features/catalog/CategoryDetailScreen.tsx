import { getCategoryDefinition, isCategoryId } from '../../core/constants/categories'
import { getPuzzlesForCategory } from '../../data/content/puzzleCatalog'
import type { UserSettings } from '../../data/models'
import { PuzzleCard } from './PuzzleCard'
import { useI18n } from '../../i18n/i18n'

export function CategoryDetailScreen({
  categoryId,
  settings,
}: {
  categoryId: string
  settings: UserSettings
}) {
  const { t, categoryName } = useI18n()
  if (!isCategoryId(categoryId)) {
    return (
      <section className="screen-card" role="alert">
        <div className="screen-icon" aria-hidden="true">🧩</div>
        <h1>Puzzles not found</h1>
        <p>Choose another picture world.</p>
      </section>
    )
  }

  const category = getCategoryDefinition(categoryId)
  const puzzles = getPuzzlesForCategory(categoryId, settings.active_tier_id)
  return (
    <section className="catalog-screen" aria-labelledby="category-title">
      <header className="catalog-heading">
        <span aria-hidden="true">{category.icon}</span>
        <div>
          <p className="eyebrow">{t('category.choose')}</p>
          <h1 id="category-title">{categoryName(category.id)}</h1>
        </div>
      </header>
      <div className="puzzle-grid">
        {puzzles.map((puzzle) => (
          <PuzzleCard
            key={puzzle.puzzle_id}
            puzzle={puzzle}
            soundEnabled={settings.sound_enabled}
          />
        ))}
      </div>
    </section>
  )
}
