import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  ParentZoneState,
  PuzzleProgress,
  Reward,
  UserSettings,
} from '../models'

export const FITZEE_DATABASE_NAME = 'fitzee'
export const FITZEE_DATABASE_VERSION = 1
export const DEVICE_RECORD_KEY = 'device' as const

interface FitzeeDatabaseSchema extends DBSchema {
  user_settings: {
    key: typeof DEVICE_RECORD_KEY
    value: UserSettings
  }
  puzzle_progress: {
    key: string
    value: PuzzleProgress
  }
  rewards: {
    key: string
    value: Reward
  }
  parent_zone_state: {
    key: typeof DEVICE_RECORD_KEY
    value: ParentZoneState
  }
}

export type FitzeeDatabase = IDBPDatabase<FitzeeDatabaseSchema>

let databasePromise: Promise<FitzeeDatabase | null> | null = null

function openDatabase(): Promise<FitzeeDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)

  return openDB<FitzeeDatabaseSchema>(FITZEE_DATABASE_NAME, FITZEE_DATABASE_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('user_settings')) {
        database.createObjectStore('user_settings')
      }
      if (!database.objectStoreNames.contains('puzzle_progress')) {
        database.createObjectStore('puzzle_progress', { keyPath: 'puzzle_id' })
      }
      if (!database.objectStoreNames.contains('rewards')) {
        database.createObjectStore('rewards', { keyPath: 'reward_id' })
      }
      if (!database.objectStoreNames.contains('parent_zone_state')) {
        database.createObjectStore('parent_zone_state')
      }
    },
    blocking(_currentVersion, _blockedVersion, event) {
      const database = event.target as IDBDatabase
      database.close()
    },
  }).catch(() => null)
}

export function getFitzeeDatabase(): Promise<FitzeeDatabase | null> {
  databasePromise ??= openDatabase()
  return databasePromise
}

export async function resetFitzeeDatabaseConnectionForTests(): Promise<void> {
  const database = await databasePromise
  database?.close()
  databasePromise = null
}
