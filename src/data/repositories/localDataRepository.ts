import { getFitzeeDatabase } from '../db/fitzeeDb'
import { clearMemoryPuzzleProgress } from './puzzleProgressRepository'
import { clearMemoryRewards } from './rewardRepository'
import { clearMemoryUserSettings } from './userSettingsRepository'

export async function deleteAllLocalData(): Promise<boolean> {
  clearMemoryPuzzleProgress()
  clearMemoryRewards()
  clearMemoryUserSettings()

  try {
    const database = await getFitzeeDatabase()
    if (!database) return false
    const transaction = database.transaction(
      ['user_settings', 'puzzle_progress', 'rewards', 'parent_zone_state'],
      'readwrite',
    )
    await Promise.all([
      transaction.objectStore('user_settings').clear(),
      transaction.objectStore('puzzle_progress').clear(),
      transaction.objectStore('rewards').clear(),
      transaction.objectStore('parent_zone_state').clear(),
      transaction.done,
    ])
    return true
  } catch {
    return false
  }
}
