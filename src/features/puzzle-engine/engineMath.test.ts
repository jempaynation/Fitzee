import { describe, expect, it } from 'vitest'
import {
  getGridDimensions,
  getPuzzleTierConfig,
  getPieceEdges,
  isWithinSnapTolerance,
  isCorrectRotation,
  PUZZLE_TIER_CONFIG,
  rotateClockwise,
} from './engineMath'

describe('puzzle engine math', () => {
  it.each([
    [4, { rows: 2, columns: 2 }],
    [6, { rows: 2, columns: 3 }],
    [20, { rows: 4, columns: 5 }],
    [30, { rows: 5, columns: 6 }],
  ])('maps %i pieces to a balanced grid', (count, expected) => {
    expect(getGridDimensions(count)).toEqual(expected)
  })

  it('gives adjacent pieces complementary edges', () => {
    const grid = { rows: 4, columns: 5 }
    for (let row = 0; row < grid.rows; row += 1) {
      for (let column = 0; column < grid.columns; column += 1) {
        const edges = getPieceEdges(row, column, grid)
        if (column < grid.columns - 1) {
          expect(edges.right).toBe(-getPieceEdges(row, column + 1, grid).left)
        }
        if (row < grid.rows - 1) {
          expect(edges.bottom).toBe(-getPieceEdges(row + 1, column, grid).top)
        }
      }
    }
  })

  it('uses a measurably friendlier snap radius for younger tiers', () => {
    const drop = [45, 0] as const
    expect(
      isWithinSnapTolerance(...drop, 0, 0, 100, PUZZLE_TIER_CONFIG.tiny_tots.snapToleranceRatio),
    ).toBe(true)
    expect(
      isWithinSnapTolerance(...drop, 0, 0, 100, PUZZLE_TIER_CONFIG.big_kids.snapToleranceRatio),
    ).toBe(false)
  })

  it('never enables a timer or fail return for the youngest tiers', () => {
    expect(PUZZLE_TIER_CONFIG.tiny_tots.showTimer).toBe(false)
    expect(PUZZLE_TIER_CONFIG.little_explorers.showTimer).toBe(false)
    expect(PUZZLE_TIER_CONFIG.tiny_tots.returnToTrayOnMiss).toBe(false)
    expect(PUZZLE_TIER_CONFIG.little_explorers.returnToTrayOnMiss).toBe(false)
  })

  it('requires quarter-turn rotation only for Puzzle Masters', () => {
    expect(PUZZLE_TIER_CONFIG.little_explorers.rotationEnabled).toBe(false)
    expect(PUZZLE_TIER_CONFIG.puzzle_masters.rotationEnabled).toBe(true)
    expect(isCorrectRotation(90)).toBe(false)
    expect(rotateClockwise(270)).toBe(0)
    expect(isCorrectRotation(360)).toBe(true)
  })

  it('enables optional Big Kids challenges without leaking them to younger tiers', () => {
    expect(getPuzzleTierConfig('big_kids')).toMatchObject({
      rotationEnabled: false,
      showTimer: false,
    })
    expect(getPuzzleTierConfig('big_kids', {
      bigKidsRotationEnabled: true,
      bigKidsTimerEnabled: true,
    })).toMatchObject({ rotationEnabled: true, showTimer: true })
    expect(getPuzzleTierConfig('tiny_tots', {
      bigKidsRotationEnabled: true,
      bigKidsTimerEnabled: true,
    })).toMatchObject({ rotationEnabled: false, showTimer: false })
    expect(getPuzzleTierConfig('little_explorers', {
      bigKidsRotationEnabled: true,
      bigKidsTimerEnabled: true,
    })).toMatchObject({ rotationEnabled: false, showTimer: false })
  })
})
