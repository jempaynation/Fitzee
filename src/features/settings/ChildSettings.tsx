import { useEffect } from 'react'
import {
  startBackgroundMusic,
  stopBackgroundMusic,
} from '../../core/utils/audio'
import type { UserSettings } from '../../data/models'
import { useI18n } from '../../i18n/i18n'

interface ChildSettingsProps {
  settings: UserSettings
  onChange: (change: Partial<UserSettings>) => Promise<void>
}

interface SettingToggleProps {
  checked: boolean
  icon: string
  label: string
  onChange: (checked: boolean) => void
}

function SettingToggle({
  checked,
  icon,
  label,
  onChange,
}: SettingToggleProps) {
  return (
    <label className="setting-row">
      <span className="setting-row__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="setting-row__label">{label}</span>
      <input
        className="toggle-input"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

export function ChildSettings({ settings, onChange }: ChildSettingsProps) {
  const { t } = useI18n()

  useEffect(() => {
    if (!settings.music_enabled) {
      stopBackgroundMusic()
      return
    }

    const startFromGesture = () => startBackgroundMusic()
    window.addEventListener('pointerdown', startFromGesture, { passive: true })
    window.addEventListener('keydown', startFromGesture)
    return () => {
      window.removeEventListener('pointerdown', startFromGesture)
      window.removeEventListener('keydown', startFromGesture)
    }
  }, [settings.music_enabled])

  const changeMusicSetting = (music_enabled: boolean) => {
    if (music_enabled) startBackgroundMusic()
    else stopBackgroundMusic()
    void onChange({ music_enabled })
  }

  return (
    <section className="screen-card" aria-labelledby="settings-title">
      <div className="screen-icon" aria-hidden="true">
        ⚙️
      </div>
      <p className="eyebrow">{t('settings.eyebrow')}</p>
      <h1 id="settings-title">{t('settings.title')}</h1>

      <div className="settings-list">
        <SettingToggle
          checked={settings.sound_enabled}
          icon="🔔"
          label={t('settings.sound')}
          onChange={(sound_enabled) => void onChange({ sound_enabled })}
        />
        <SettingToggle
          checked={settings.music_enabled}
          icon="🎵"
          label={t('settings.music')}
          onChange={changeMusicSetting}
        />
        <SettingToggle
          checked={settings.narration_enabled}
          icon="🗣️"
          label={t('settings.narration')}
          onChange={(narration_enabled) => void onChange({ narration_enabled })}
        />
        <label className="setting-row" htmlFor="language">
          <span className="setting-row__icon" aria-hidden="true">
            🌐
          </span>
          <span className="setting-row__label">{t('settings.language')}</span>
          <select
            id="language"
            value={settings.language}
            onChange={(event) => void onChange({ language: event.target.value as UserSettings['language'] })}
          >
            <option value="en">{t('settings.english')}</option>
            <option value="fil">{t('settings.filipino')}</option>
          </select>
        </label>
        <SettingToggle
          checked={settings.large_touch_targets_enabled}
          icon="🔎"
          label={t('settings.bigButtons')}
          onChange={(large_touch_targets_enabled) => void onChange({ large_touch_targets_enabled })}
        />
      </div>
    </section>
  )
}
