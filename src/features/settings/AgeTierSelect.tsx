import { useState } from 'react'
import { TIER_DEFINITIONS, type TierId } from '../../core/constants/tiers'
import { useHashNavigation } from '../../core/navigation/useHashNavigation'
import { playNavigationCue } from '../../core/utils/audio'

interface AgeTierSelectProps {
  onSelect: (tierId: TierId) => Promise<void>
}

export function AgeTierSelect({ onSelect }: AgeTierSelectProps) {
  const { navigate } = useHashNavigation()
  const [selectedTier, setSelectedTier] = useState<TierId | null>(null)

  const selectTier = async (tierId: TierId) => {
    if (selectedTier) return
    setSelectedTier(tierId)
    await onSelect(tierId)
    navigate('/home', { replace: true })
  }

  return (
    <main className="onboarding-screen">
      <section className="onboarding-panel" aria-labelledby="age-tier-title">
        <div className="onboarding-mark" aria-hidden="true">
          🧩
        </div>
        <p className="eyebrow">Welcome to Fitzee</p>
        <h1 id="age-tier-title">Who is puzzling today?</h1>
        <p className="onboarding-intro">Pick the picture that matches their age.</p>

        <div className="tier-grid">
          {TIER_DEFINITIONS.map((tier) => (
            <button
              className="tier-card"
              type="button"
              key={tier.id}
              disabled={selectedTier !== null}
              aria-pressed={selectedTier === tier.id}
              onPointerDown={() => playNavigationCue(true)}
              onClick={() => void selectTier(tier.id)}
            >
              <span className="tier-card__icon" aria-hidden="true">
                {tier.icon}
              </span>
              <span className="tier-card__name">{tier.name}</span>
              <span className="tier-card__ages">{tier.ages}</span>
              <span className="tier-card__pieces">{tier.pieces}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
