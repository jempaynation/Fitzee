import { isTierId } from '../../core/constants/tiers'
import { DEVICE_RECORD_KEY, getFitzeeDatabase } from '../db/fitzeeDb'
import type { UserSettings } from '../models'
import type { RepositoryReadResult } from './repositoryResult'

let memorySettings: UserSettings | null = null

function isUserSettings(value: unknown): value is UserSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Partial<UserSettings>

  return (
    isTierId(settings.active_tier_id) &&
    (settings.tier_source === 'parent_override' ||
      settings.tier_source === 'onboarding_selection') &&
    typeof settings.sound_enabled === 'boolean' &&
    typeof settings.music_enabled === 'boolean' &&
    typeof settings.narration_enabled === 'boolean' &&
    (settings.language === 'en' || settings.language === 'fil') &&
    (settings.large_touch_targets_enabled === undefined ||
      typeof settings.large_touch_targets_enabled === 'boolean') &&
    (settings.big_kids_rotation_enabled === undefined ||
      typeof settings.big_kids_rotation_enabled === 'boolean') &&
    (settings.big_kids_timer_enabled === undefined ||
      typeof settings.big_kids_timer_enabled === 'boolean') &&
    (settings.screen_time_reminder_minutes === null ||
      typeof settings.screen_time_reminder_minutes === 'number') &&
    typeof settings.onboarding_completed === 'boolean'
  )
}

export async function readUserSettings(): Promise<
  RepositoryReadResult<UserSettings>
> {
  try {
    const database = await getFitzeeDatabase()
    if (!database) return { value: memorySettings, persistenceAvailable: false }

    const storedSettings = await database.get('user_settings', DEVICE_RECORD_KEY)
    const value = isUserSettings(storedSettings)
      ? {
          ...storedSettings,
          large_touch_targets_enabled: storedSettings.large_touch_targets_enabled ?? false,
          big_kids_rotation_enabled: storedSettings.big_kids_rotation_enabled ?? false,
          big_kids_timer_enabled: storedSettings.big_kids_timer_enabled ?? false,
        }
      : null
    memorySettings = value
    return { value, persistenceAvailable: true }
  } catch {
    return { value: memorySettings, persistenceAvailable: false }
  }
}

export async function writeUserSettings(settings: UserSettings): Promise<boolean> {
  memorySettings = settings

  try {
    const database = await getFitzeeDatabase()
    if (!database) return false
    await database.put('user_settings', settings, DEVICE_RECORD_KEY)
    return true
  } catch {
    return false
  }
}

export function clearMemoryUserSettings(): void {
  memorySettings = null
}
