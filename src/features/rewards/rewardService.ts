import type { TierId } from '../../core/constants/tiers'
import type { PuzzleProgress } from '../../data/models'
import {
  completePuzzleAndPersistRewards,
  type PuzzleCompletionResult,
} from '../../data/repositories/puzzleCompletionRepository'

export async function awardPuzzleCompletion(
  progress: PuzzleProgress,
  tierId: TierId,
): Promise<PuzzleCompletionResult> {
  return completePuzzleAndPersistRewards(progress, tierId)
}
