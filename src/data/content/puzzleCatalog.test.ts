import { describe, expect, it } from 'vitest'
import { CATEGORY_IDS } from '../../core/constants/categories'
import { getTierDefinition } from '../../core/constants/tiers'
import {
  getActiveCategories,
  isPuzzleAvailableOn,
  getPuzzlesForCategory,
  PUZZLE_CATALOG,
} from './puzzleCatalog'

describe('launch puzzle catalog', () => {
  it('contains exactly 144 unique puzzles including seasonal variants', () => {
    expect(PUZZLE_CATALOG).toHaveLength(144)
    expect(new Set(PUZZLE_CATALOG.map((puzzle) => puzzle.puzzle_id)).size).toBe(144)
  })

  it.each(['tiny_tots', 'little_explorers', 'big_kids', 'puzzle_masters'] as const)(
    'provides puzzles in every launch category for %s',
    (tierId) => {
      for (const categoryId of CATEGORY_IDS.filter((id) => id !== 'holidays')) {
        const count = getPuzzlesForCategory(categoryId, tierId).length
        expect(count).toBeGreaterThanOrEqual(4)
      }
      expect(getPuzzlesForCategory('fairy_tales', tierId)).toHaveLength(8)
      expect(getActiveCategories(tierId, new Date('2026-08-07T00:00:00Z')).map(({ id }) => id)).toEqual([
        'animals',
        'shapes_colors',
        'vehicles',
        'nature_seasons',
        'numbers_letters',
        'fairy_tales',
        'everyday_life',
        'holidays',
      ])
    },
  )

  it('keeps every piece count inside its tier range', () => {
    for (const puzzle of PUZZLE_CATALOG) {
      const tier = getTierDefinition(puzzle.tier_id)
      expect(puzzle.piece_count).toBeGreaterThanOrEqual(tier.minimumPieces)
      expect(puzzle.piece_count).toBeLessThanOrEqual(tier.maximumPieces)
      expect(CATEGORY_IDS).toContain(puzzle.category_id)
    }
  })

  it.each([
    [3, 'Spring Kite Festival'],
    [6, 'Sunny Beach Day'],
    [9, 'Autumn Harvest'],
    [0, 'Winter Lights'],
  ])('rotates one seasonal scene in local month %s', (monthIndex, expectedName) => {
    const puzzles = getPuzzlesForCategory(
      'holidays',
      'tiny_tots',
      new Date(2026, monthIndex, 15, 12),
    )
    expect(puzzles).toHaveLength(1)
    expect(puzzles[0].display_name).toBe(expectedName)
  })

  it('keeps an inactive seasonal scene unavailable to direct routes', () => {
    const summer = PUZZLE_CATALOG.find(
      (puzzle) => puzzle.puzzle_id === 'holidays_summer_beach_tiny_02',
    )
    expect(summer).toBeDefined()
    expect(isPuzzleAvailableOn(summer!, new Date(2026, 0, 15, 12))).toBe(false)
    expect(isPuzzleAvailableOn(summer!, new Date(2026, 6, 15, 12))).toBe(true)
  })
})
