import { getActiveCategories } from '../../data/content/puzzleCatalog'
import type { UserSettings } from '../../data/models'
import { HashLink } from '../../core/navigation/hashNavigation'
import { playNavigationCue } from '../../core/utils/audio'
import { useI18n } from '../../i18n/i18n'

export function CategoriesScreen({ settings }: { settings: UserSettings }) {
  const categories = getActiveCategories(settings.active_tier_id)
  const cue = () => playNavigationCue(settings.sound_enabled)
  const { t, categoryName } = useI18n()

  return (
    <section className="screen-card" aria-labelledby="categories-title">
      <div className="screen-icon" aria-hidden="true">🖼️</div>
      <h1 id="categories-title">{t('categories.title')}</h1>
      <p>{t('categories.choose')}</p>
      <div className="category-grid">
        {categories.map((category) => (
          <HashLink
            className="action-card"
            to={`/category_detail/${category.id}`}
            key={category.id}
            onPointerDown={cue}
          >
            <span aria-hidden="true">{category.icon}</span>
            <span>{categoryName(category.id)}</span>
          </HashLink>
        ))}
      </div>
    </section>
  )
}
