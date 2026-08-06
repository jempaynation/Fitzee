export type PuzzleStatus = 'not_started' | 'in_progress' | 'completed'

export interface PuzzleProgress {
  puzzle_id: string
  status: PuzzleStatus
  pieces_placed: number
  piece_count: number
  first_completed_at: string | null
  times_completed: number
  best_time_seconds: number | null
}
