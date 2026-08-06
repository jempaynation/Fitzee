import type { TierId } from '../../core/constants/tiers'
import { PUZZLE_CATALOG } from '../content/puzzleCatalog'
import { getFitzeeDatabase } from '../db/fitzeeDb'
import type { PuzzleProgress, Reward } from '../models'
import {
  cachePuzzleProgress,
  markPuzzleProgressPersistence,
  readAllPuzzleProgress,
} from './puzzleProgressRepository'
import { cacheReward, readRewards } from './rewardRepository'

export interface PuzzleCompletionResult {
  progress: PuzzleProgress
  unlockedRewards: Reward[]
  persistenceAvailable: boolean
}

function buildCompletionRecords(
  draft: PuzzleProgress,
  tierId: TierId,
  allProgress: PuzzleProgress[],
  existingRewards: Reward[],
): Omit<PuzzleCompletionResult, 'persistenceAvailable'> {
  const previous = allProgress.find(({ puzzle_id }) => puzzle_id === draft.puzzle_id)
  const completionNumber = Math.max(
    draft.times_completed,
    (previous?.times_completed ?? 0) + 1,
  )
  const progress: PuzzleProgress = {
    ...draft,
    status: 'completed',
    pieces_placed: draft.piece_count,
    first_completed_at:
      previous?.first_completed_at ??
      draft.first_completed_at ??
      new Date().toISOString(),
    times_completed: completionNumber,
    best_time_seconds:
      draft.best_time_seconds === null
        ? previous?.best_time_seconds ?? null
        : Math.min(
            previous?.best_time_seconds ?? draft.best_time_seconds,
            draft.best_time_seconds,
          ),
  }

  const progressById = new Map(
    allProgress.map((item) => [item.puzzle_id, item]),
  )
  progressById.set(progress.puzzle_id, progress)
  const completedInTier = new Set(
    [...progressById.values()]
      .filter((item) => item.status === 'completed')
      .filter((item) =>
        PUZZLE_CATALOG.some(
          (puzzle) =>
            puzzle.puzzle_id === item.puzzle_id && puzzle.tier_id === tierId,
        ),
      )
      .map((item) => item.puzzle_id),
  ).size

  const now = new Date().toISOString()
  const candidates: Reward[] = [
    {
      reward_id: `sticker:${progress.puzzle_id}`,
      type: 'sticker',
      unlocked_at: now,
      triggered_by_puzzle_id: progress.puzzle_id,
    },
    {
      reward_id: `star:${progress.puzzle_id}:${completionNumber}`,
      type: 'star',
      unlocked_at: now,
      triggered_by_puzzle_id: progress.puzzle_id,
    },
  ]

  if (completedInTier > 0 && completedInTier % 3 === 0) {
    candidates.push({
      reward_id: `streak_star:${tierId}:${completedInTier}`,
      type: 'star',
      unlocked_at: now,
      triggered_by_puzzle_id: progress.puzzle_id,
    })
  }

  const existingIds = new Set(existingRewards.map(({ reward_id }) => reward_id))
  return {
    progress,
    unlockedRewards: candidates.filter(({ reward_id }) => !existingIds.has(reward_id)),
  }
}

function cacheCompletion(
  progress: PuzzleProgress,
  rewards: Reward[],
  persisted: boolean,
): void {
  cachePuzzleProgress(progress)
  markPuzzleProgressPersistence(progress.puzzle_id, persisted)
  for (const reward of rewards) cacheReward(reward)
}

async function completeInMemory(
  draft: PuzzleProgress,
  tierId: TierId,
): Promise<PuzzleCompletionResult> {
  const progress = (await readAllPuzzleProgress()).value ?? []
  const rewards = await readRewards()
  const outcome = buildCompletionRecords(draft, tierId, progress, rewards)
  cacheCompletion(outcome.progress, outcome.unlockedRewards, false)
  return { ...outcome, persistenceAvailable: false }
}

export async function completePuzzleAndPersistRewards(
  draft: PuzzleProgress,
  tierId: TierId,
): Promise<PuzzleCompletionResult> {
  try {
    const database = await getFitzeeDatabase()
    if (!database) return completeInMemory(draft, tierId)

    const transaction = database.transaction(
      ['puzzle_progress', 'rewards'],
      'readwrite',
    )
    const progressStore = transaction.objectStore('puzzle_progress')
    const rewardStore = transaction.objectStore('rewards')
    const [allProgress, existingRewards] = await Promise.all([
      progressStore.getAll(),
      rewardStore.getAll(),
    ])
    const outcome = buildCompletionRecords(
      draft,
      tierId,
      allProgress,
      existingRewards,
    )
    await progressStore.put(outcome.progress)
    for (const reward of outcome.unlockedRewards) {
      await rewardStore.put(reward)
    }
    await transaction.done
    cacheCompletion(outcome.progress, outcome.unlockedRewards, true)
    return { ...outcome, persistenceAvailable: true }
  } catch {
    return completeInMemory(draft, tierId)
  }
}
