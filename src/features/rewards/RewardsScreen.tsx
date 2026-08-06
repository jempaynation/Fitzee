import { useEffect, useState } from 'react'
import { PUZZLE_CATALOG } from '../../data/content/puzzleCatalog'
import type { Reward, UserSettings } from '../../data/models'
import { readRewards } from '../../data/repositories/rewardRepository'
import { useI18n } from '../../i18n/i18n'

export function RewardsScreen({ settings }: { settings: UserSettings }) {
  const { t, puzzleName } = useI18n()
  const [rewards, setRewards] = useState<Reward[] | null>(null)

  useEffect(() => {
    let active = true
    void readRewards().then((value) => {
      if (active) setRewards(value)
    })
    return () => {
      active = false
    }
  }, [])

  const stars = rewards?.filter((reward) => reward.type === 'star').length ?? 0
  const stickers = (rewards ?? [])
    .filter((reward) => reward.type === 'sticker')
    .map((reward) => PUZZLE_CATALOG.find((puzzle) =>
      puzzle.puzzle_id === reward.triggered_by_puzzle_id &&
      puzzle.tier_id === settings.active_tier_id,
    ))
    .filter((puzzle) => puzzle !== undefined)

  return (
    <section className="rewards-screen" aria-labelledby="rewards-title">
      <header className="catalog-heading">
        <span aria-hidden="true">⭐</span>
        <div>
          <p className="eyebrow">{t('rewards.eyebrow')}</p>
          <h1 id="rewards-title">{t('rewards.title')}</h1>
        </div>
      </header>

      <div className="star-jar" aria-label={`${stars} stars earned`}>
        <div className="star-jar__glass" aria-hidden="true">
          {Array.from({ length: Math.min(stars, 30) }, (_, index) => (
            <span key={index} style={{ left: `${12 + (index * 23) % 76}%`, bottom: `${8 + Math.floor(index / 4) * 10}%` }}>★</span>
          ))}
        </div>
        <div><strong>{stars}</strong><span>{t('rewards.stars')}</span></div>
      </div>

      <section className="sticker-book" aria-labelledby="sticker-title">
        <h2 id="sticker-title">{t('rewards.stickers')}</h2>
        {rewards === null ? (
          <p role="status">{t('rewards.opening')}</p>
        ) : stickers.length === 0 ? (
          <p>{t('rewards.empty')}</p>
        ) : (
          <div className="sticker-grid">
            {stickers.map((puzzle) => (
              <figure key={puzzle.puzzle_id}>
                <img src={puzzle.sourceUrl} alt={puzzle.alt_text} />
                <figcaption>{puzzleName(puzzle.display_name)}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
