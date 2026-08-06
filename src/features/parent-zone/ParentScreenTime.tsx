import type { UserSettings } from '../../data/models'

const REMINDER_OPTIONS = [null, 15, 30, 45, 60] as const

export function ParentScreenTime({
  settings,
  onChange,
}: {
  settings: UserSettings
  onChange: (change: Partial<UserSettings>) => Promise<void>
}) {
  return (
    <section className="parent-panel" aria-labelledby="screen-time-title">
      <p className="eyebrow">Gentle breaks</p>
      <h1 id="screen-time-title">Screen-time reminder</h1>
      <p>This reminder never locks the puzzle. Dismissing it starts the interval again.</p>
      <div className="reminder-options">
        {REMINDER_OPTIONS.map((minutes) => (
          <label key={minutes ?? 'off'}>
            <input
              type="radio"
              name="reminder"
              checked={settings.screen_time_reminder_minutes === minutes}
              onChange={() => void onChange({ screen_time_reminder_minutes: minutes })}
            />
            <span>{minutes === null ? 'Off' : `${minutes} minutes`}</span>
          </label>
        ))}
      </div>
    </section>
  )
}
