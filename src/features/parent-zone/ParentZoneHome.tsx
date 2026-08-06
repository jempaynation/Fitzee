import { HashLink } from '../../core/navigation/hashNavigation'
import type { UserSettings } from '../../data/models'

export function ParentZoneHome({
  settings,
  onChange,
}: {
  settings: UserSettings
  onChange: (change: Partial<UserSettings>) => Promise<void>
}) {
  return (
    <section className="parent-panel" aria-labelledby="parent-zone-title">
      <p className="eyebrow">Local controls</p>
      <h1 id="parent-zone-title">Parent Zone</h1>
      <p>Choose what you would like to manage on this device.</p>
      <div className="parent-menu">
        <HashLink to="/parent_tier_override">
          <span aria-hidden="true">🎚️</span>
          <span><strong>Age & difficulty</strong><small>Choose the active puzzle tier</small></span>
          <span aria-hidden="true">→</span>
        </HashLink>
        <HashLink to="/parent_screen_time">
          <span aria-hidden="true">⏰</span>
          <span><strong>Screen-time reminder</strong><small>Set a gentle break reminder</small></span>
          <span aria-hidden="true">→</span>
        </HashLink>
        <HashLink to="/parent_privacy">
          <span aria-hidden="true">🛡️</span>
          <span><strong>Privacy & data</strong><small>Read the policy or clear local data</small></span>
          <span aria-hidden="true">→</span>
        </HashLink>
      </div>

      <section className="parent-preferences" aria-labelledby="parent-audio-title">
        <h2 id="parent-audio-title">Audio</h2>
        <label>
          <span><strong>Sound effects</strong><small>Piece, navigation, and celebration cues</small></span>
          <input
            type="checkbox"
            checked={settings.sound_enabled}
            onChange={(event) => void onChange({ sound_enabled: event.target.checked })}
          />
        </label>
      </section>

      <section className="parent-preferences" aria-labelledby="big-kids-options-title">
        <h2 id="big-kids-options-title">Big Kids challenge options</h2>
        <p>These apply only to the Big Kids tier. They can never add a timer or rotation for younger children.</p>
        <label>
          <span><strong>Rotate pieces</strong><small>Start pieces at quarter turns</small></span>
          <input
            type="checkbox"
            checked={settings.big_kids_rotation_enabled}
            onChange={(event) => void onChange({ big_kids_rotation_enabled: event.target.checked })}
          />
        </label>
        <label>
          <span><strong>Show timer</strong><small>Track elapsed and best completion time</small></span>
          <input
            type="checkbox"
            checked={settings.big_kids_timer_enabled}
            onChange={(event) => void onChange({ big_kids_timer_enabled: event.target.checked })}
          />
        </label>
      </section>
    </section>
  )
}
