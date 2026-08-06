import { TIER_DEFINITIONS, type TierId } from '../../core/constants/tiers'
import type { UserSettings } from '../../data/models'

export function ParentTierOverride({
  settings,
  onChange,
}: {
  settings: UserSettings
  onChange: (change: Partial<UserSettings>) => Promise<void>
}) {
  return (
    <section className="parent-panel" aria-labelledby="tier-override-title">
      <p className="eyebrow">Difficulty</p>
      <h1 id="tier-override-title">Age & puzzle tier</h1>
      <p>Choose the tier that best fits the child using this device.</p>
      <div className="parent-tier-list">
        {TIER_DEFINITIONS.map((tier) => (
          <label key={tier.id}>
            <input
              type="radio"
              name="active-tier"
              value={tier.id}
              checked={settings.active_tier_id === tier.id}
              onChange={(event) => {
                void onChange({
                  active_tier_id: event.target.value as TierId,
                  tier_source: 'parent_override',
                })
              }}
            />
            <span aria-hidden="true">{tier.icon}</span>
            <span><strong>{tier.name}</strong><small>{tier.ages} · {tier.pieces}</small></span>
          </label>
        ))}
      </div>
    </section>
  )
}
