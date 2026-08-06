import type { TierId } from '../../core/constants/tiers'

export interface UserSettings {
  active_tier_id: TierId
  tier_source: 'parent_override' | 'onboarding_selection'
  sound_enabled: boolean
  music_enabled: boolean
  narration_enabled: boolean
  language: 'en' | 'fil'
  large_touch_targets_enabled: boolean
  big_kids_rotation_enabled: boolean
  big_kids_timer_enabled: boolean
  screen_time_reminder_minutes: number | null
  onboarding_completed: boolean
}

export function createOnboardingSettings(activeTierId: TierId): UserSettings {
  return {
    active_tier_id: activeTierId,
    tier_source: 'onboarding_selection',
    sound_enabled: true,
    music_enabled: true,
    narration_enabled: true,
    language: 'en',
    large_touch_targets_enabled: false,
    big_kids_rotation_enabled: false,
    big_kids_timer_enabled: false,
    screen_time_reminder_minutes: null,
    onboarding_completed: true,
  }
}
