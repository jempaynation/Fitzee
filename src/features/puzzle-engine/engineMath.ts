import type { TierId } from '../../core/constants/tiers'

export interface GridDimensions {
  rows: number
  columns: number
}

export interface PieceEdges {
  top: -1 | 0 | 1
  right: -1 | 0 | 1
  bottom: -1 | 0 | 1
  left: -1 | 0 | 1
}

export interface PuzzleTierConfig {
  snapToleranceRatio: number
  showTimer: boolean
  rotationEnabled: boolean
  hintMode: 'always' | 'fade' | 'hold' | 'none'
  returnToTrayOnMiss: boolean
}

export interface PuzzleChallengeOptions {
  bigKidsRotationEnabled?: boolean
  bigKidsTimerEnabled?: boolean
}

export const PUZZLE_TIER_CONFIG: Record<TierId, PuzzleTierConfig> = {
  tiny_tots: {
    snapToleranceRatio: 0.62,
    showTimer: false,
    rotationEnabled: false,
    hintMode: 'always',
    returnToTrayOnMiss: false,
  },
  little_explorers: {
    snapToleranceRatio: 0.45,
    showTimer: false,
    rotationEnabled: false,
    hintMode: 'fade',
    returnToTrayOnMiss: false,
  },
  big_kids: {
    snapToleranceRatio: 0.26,
    showTimer: false,
    rotationEnabled: false,
    hintMode: 'hold',
    returnToTrayOnMiss: true,
  },
  puzzle_masters: {
    snapToleranceRatio: 0.14,
    showTimer: true,
    rotationEnabled: true,
    hintMode: 'none',
    returnToTrayOnMiss: true,
  },
}

export function getPuzzleTierConfig(
  tierId: TierId,
  options: PuzzleChallengeOptions = {},
): PuzzleTierConfig {
  const base = PUZZLE_TIER_CONFIG[tierId]
  if (tierId !== 'big_kids') return base
  return {
    ...base,
    rotationEnabled: options.bigKidsRotationEnabled ?? false,
    showTimer: options.bigKidsTimerEnabled ?? false,
  }
}

export function getGridDimensions(
  pieceCount: number,
  aspectRatio = 1,
): GridDimensions {
  if (!Number.isInteger(pieceCount) || pieceCount < 1) {
    throw new Error('pieceCount must be a positive integer')
  }

  let bestRows = 1
  let bestColumns = pieceCount
  let bestDifference = Number.POSITIVE_INFINITY

  for (let rows = 1; rows <= Math.sqrt(pieceCount); rows += 1) {
    if (pieceCount % rows !== 0) continue
    const columns = pieceCount / rows
    const difference = Math.abs(columns / rows - aspectRatio)
    if (difference < bestDifference) {
      bestDifference = difference
      bestRows = rows
      bestColumns = columns
    }
  }

  return { rows: bestRows, columns: bestColumns }
}

function rightEdge(row: number, column: number): -1 | 1 {
  return (row + column) % 2 === 0 ? 1 : -1
}

function bottomEdge(row: number, column: number): -1 | 1 {
  return (row * 3 + column) % 2 === 0 ? -1 : 1
}

export function getPieceEdges(
  row: number,
  column: number,
  grid: GridDimensions,
): PieceEdges {
  return {
    top: row === 0 ? 0 : (-bottomEdge(row - 1, column) as -1 | 1),
    right: column === grid.columns - 1 ? 0 : rightEdge(row, column),
    bottom: row === grid.rows - 1 ? 0 : bottomEdge(row, column),
    left: column === 0 ? 0 : (-rightEdge(row, column - 1) as -1 | 1),
  }
}

export function isWithinSnapTolerance(
  dropX: number,
  dropY: number,
  targetX: number,
  targetY: number,
  cellSize: number,
  toleranceRatio: number,
): boolean {
  return Math.hypot(dropX - targetX, dropY - targetY) <= cellSize * toleranceRatio
}

export function rotateClockwise(rotation: number): number {
  return ((rotation + 90) % 360 + 360) % 360
}

export function isCorrectRotation(rotation: number): boolean {
  return ((rotation % 360) + 360) % 360 === 0
}
