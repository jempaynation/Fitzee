import { getFitzeeDatabase } from '../db/fitzeeDb'
import type { Reward } from '../models'

const memoryRewards = new Map<string, Reward>()

export function cacheReward(reward: Reward): void {
  memoryRewards.set(reward.reward_id, reward)
}

export async function readRewards(): Promise<Reward[]> {
  try {
    const database = await getFitzeeDatabase()
    if (!database) return [...memoryRewards.values()]
    const persisted = await database.getAll('rewards')
    const merged = new Map(
      persisted.map((reward) => [reward.reward_id, reward]),
    )
    for (const reward of memoryRewards.values()) {
      merged.set(reward.reward_id, reward)
    }
    return [...merged.values()]
  } catch {
    return [...memoryRewards.values()]
  }
}

export async function writeReward(reward: Reward): Promise<boolean> {
  cacheReward(reward)
  try {
    const database = await getFitzeeDatabase()
    if (!database) return false
    await database.put('rewards', reward)
    return true
  } catch {
    return false
  }
}

export function clearMemoryRewards(): void {
  memoryRewards.clear()
}
