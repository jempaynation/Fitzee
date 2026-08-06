import 'fake-indexeddb/auto'
import { deleteDB } from 'idb'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createOnboardingSettings } from '../models'
import {
  DEVICE_RECORD_KEY,
  FITZEE_DATABASE_NAME,
  getFitzeeDatabase,
  resetFitzeeDatabaseConnectionForTests,
} from '../db/fitzeeDb'
import {
  readParentZoneState,
} from './parentZoneStateRepository'
import {
  readUserSettings,
  writeUserSettings,
} from './userSettingsRepository'
import {
  readAllPuzzleProgress,
  writePuzzleProgress,
} from './puzzleProgressRepository'
import { deleteAllLocalData } from './localDataRepository'
import { clearMemoryRewards, readRewards } from './rewardRepository'
import { clearMemoryPuzzleProgress } from './puzzleProgressRepository'
import { clearMemoryUserSettings } from './userSettingsRepository'
import { awardPuzzleCompletion } from '../../features/rewards/rewardService'

const browserIndexedDb = globalThis.indexedDB

async function resetDatabase(): Promise<void> {
  await resetFitzeeDatabaseConnectionForTests()
  await deleteDB(FITZEE_DATABASE_NAME)
  clearMemoryRewards()
  clearMemoryPuzzleProgress()
  clearMemoryUserSettings()
}

describe('Fitzee IndexedDB repositories', () => {
  beforeEach(async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: browserIndexedDb,
    })
    await resetDatabase()
  })

  afterEach(async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: browserIndexedDb,
    })
    await resetDatabase()
  })

  it('persists the selected tier and complete settings record', async () => {
    const settings = createOnboardingSettings('big_kids')

    expect(await writeUserSettings(settings)).toBe(true)
    const result = await readUserSettings()

    expect(result.persistenceAvailable).toBe(true)
    expect(result.value).toEqual(settings)
  })

  it('keeps the current session usable when IndexedDB is unavailable', async () => {
    await resetFitzeeDatabaseConnectionForTests()
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: undefined,
    })
    const settings = createOnboardingSettings('tiny_tots')

    expect(await writeUserSettings(settings)).toBe(false)
    await resetFitzeeDatabaseConnectionForTests()
    const result = await readUserSettings()

    expect(result.persistenceAvailable).toBe(false)
    expect(result.value).toEqual(settings)
  })

  it('never restores a persisted valid parent session', async () => {
    const database = await getFitzeeDatabase()
    expect(database).not.toBeNull()
    await database?.put(
      'parent_zone_state',
      {
        gate_verified_at: '2026-08-01T10:00:00Z',
        gate_valid: true,
      },
      DEVICE_RECORD_KEY,
    )

    expect(await readParentZoneState()).toEqual({
      gate_verified_at: '2026-08-01T10:00:00Z',
      gate_valid: false,
    })
  })

  it('persists completed puzzles for the replay gallery', async () => {
    const progress = {
      puzzle_id: 'animals_farm_cow_tiny_01',
      status: 'completed' as const,
      pieces_placed: 4,
      piece_count: 4,
      first_completed_at: '2026-08-07T05:45:00.000Z',
      times_completed: 1,
      best_time_seconds: null,
    }

    expect(await writePuzzleProgress(progress)).toBe(true)
    const result = await readAllPuzzleProgress()

    expect(result.persistenceAvailable).toBe(true)
    expect(result.value).toEqual([progress])
  })

  it('deletes all device-local settings and progress', async () => {
    await writeUserSettings(createOnboardingSettings('tiny_tots'))
    await writePuzzleProgress({
      puzzle_id: 'animals_farm_cow_tiny_01',
      status: 'in_progress',
      pieces_placed: 2,
      piece_count: 4,
      first_completed_at: null,
      times_completed: 0,
      best_time_seconds: null,
    })

    expect(await deleteAllLocalData()).toBe(true)
    expect((await readUserSettings()).value).toBeNull()
    expect((await readAllPuzzleProgress()).value).toEqual([])
  })

  it('awards deterministic stickers, stars, and three-puzzle streak stars once', async () => {
    const puzzleIds = [
      'animals_farm_cow_tiny_01',
      'animals_ocean_turtle_tiny_02',
      'animals_dinosaur_tiny_03',
    ]
    for (const puzzleId of puzzleIds) {
      await writePuzzleProgress({
        puzzle_id: puzzleId,
        status: 'completed',
        pieces_placed: 4,
        piece_count: 4,
        first_completed_at: '2026-08-07T06:00:00.000Z',
        times_completed: 1,
        best_time_seconds: null,
      })
      await awardPuzzleCompletion(puzzleId, 'tiny_tots', 1)
    }

    const rewards = await readRewards()
    expect(rewards.filter(({ type }) => type === 'sticker')).toHaveLength(3)
    expect(rewards.filter(({ type }) => type === 'star')).toHaveLength(4)
    expect(rewards.some(({ reward_id }) => reward_id === 'streak_star:tiny_tots:3')).toBe(true)

    expect(await awardPuzzleCompletion(puzzleIds[2], 'tiny_tots', 1)).toEqual([])
    expect(await readRewards()).toHaveLength(7)
  })
})
