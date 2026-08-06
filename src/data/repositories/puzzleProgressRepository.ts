import { getFitzeeDatabase } from '../db/fitzeeDb'
import type { PuzzleProgress } from '../models'
import type { RepositoryReadResult } from './repositoryResult'

const memoryProgress = new Map<string, PuzzleProgress>()
const unpersistedProgressIds = new Set<string>()

export function cachePuzzleProgress(progress: PuzzleProgress): void {
  memoryProgress.set(progress.puzzle_id, progress)
}

export function getCachedPuzzleProgress(
  puzzleId: string,
): PuzzleProgress | undefined {
  return memoryProgress.get(puzzleId)
}

export function markPuzzleProgressPersistence(
  puzzleId: string,
  persisted: boolean,
): void {
  if (persisted) unpersistedProgressIds.delete(puzzleId)
  else unpersistedProgressIds.add(puzzleId)
}

export async function readPuzzleProgress(
  puzzleId: string,
): Promise<RepositoryReadResult<PuzzleProgress>> {
  try {
    const database = await getFitzeeDatabase()
    if (!database) {
      return { value: memoryProgress.get(puzzleId) ?? null, persistenceAvailable: false }
    }
    const cached = memoryProgress.get(puzzleId)
    if (cached) {
      return {
        value: cached,
        persistenceAvailable: !unpersistedProgressIds.has(puzzleId),
      }
    }
    return {
      value: (await database.get('puzzle_progress', puzzleId)) ?? null,
      persistenceAvailable: true,
    }
  } catch {
    return { value: memoryProgress.get(puzzleId) ?? null, persistenceAvailable: false }
  }
}

export async function writePuzzleProgress(progress: PuzzleProgress): Promise<boolean> {
  cachePuzzleProgress(progress)
  try {
    const database = await getFitzeeDatabase()
    if (!database) {
      markPuzzleProgressPersistence(progress.puzzle_id, false)
      return false
    }
    await database.put('puzzle_progress', progress)
    markPuzzleProgressPersistence(progress.puzzle_id, true)
    return true
  } catch {
    markPuzzleProgressPersistence(progress.puzzle_id, false)
    return false
  }
}

export async function readAllPuzzleProgress(): Promise<
  RepositoryReadResult<PuzzleProgress[]>
> {
  try {
    const database = await getFitzeeDatabase()
    if (!database) {
      return { value: [...memoryProgress.values()], persistenceAvailable: false }
    }
    const persisted = await database.getAll('puzzle_progress')
    const merged = new Map(
      persisted.map((progress) => [progress.puzzle_id, progress]),
    )
    for (const progress of memoryProgress.values()) {
      merged.set(progress.puzzle_id, progress)
    }
    return {
      value: [...merged.values()],
      persistenceAvailable: unpersistedProgressIds.size === 0,
    }
  } catch {
    return { value: [...memoryProgress.values()], persistenceAvailable: false }
  }
}

export function clearMemoryPuzzleProgress(): void {
  memoryProgress.clear()
  unpersistedProgressIds.clear()
}
