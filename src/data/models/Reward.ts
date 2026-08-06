export interface Reward {
  reward_id: string
  type: 'sticker' | 'star'
  unlocked_at: string
  triggered_by_puzzle_id: string
}
