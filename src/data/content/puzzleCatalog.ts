import {
  CATEGORY_IDS,
  getCategoryDefinition,
  isCategoryId,
  type CategoryId,
} from '../../core/constants/categories'
import {
  TIER_IDS,
  getTierDefinition,
  isTierId,
  type TierId,
} from '../../core/constants/tiers'

export interface PuzzleMetadata {
  puzzle_id: string
  category_id: CategoryId
  tier_id: TierId
  display_name: string
  source_image: string
  piece_count: number
  narration_key: string
  alt_text: string
  tags: string[]
  active_months?: number[]
}

export interface PuzzleCatalogEntry extends PuzzleMetadata {
  sourceUrl: string
}

const metadataModules = import.meta.glob<PuzzleMetadata>(
  '/src/assets/puzzles/**/metadata.json',
  { eager: true, import: 'default' },
)

const imageModules = import.meta.glob<string>(
  '/src/assets/puzzles/**/source.webp',
  { eager: true, import: 'default', query: '?url' },
)

function validateMetadata(
  metadata: PuzzleMetadata,
  metadataPath: string,
): void {
  if (!metadata.puzzle_id || !isCategoryId(metadata.category_id)) {
    throw new Error(`Invalid puzzle identity in ${metadataPath}`)
  }
  if (!isTierId(metadata.tier_id)) {
    throw new Error(`Invalid tier in ${metadataPath}`)
  }
  const tier = getTierDefinition(metadata.tier_id)
  if (
    !Number.isInteger(metadata.piece_count) ||
    metadata.piece_count < tier.minimumPieces ||
    metadata.piece_count > tier.maximumPieces
  ) {
    throw new Error(
      `${metadata.puzzle_id} has ${metadata.piece_count} pieces outside ${tier.name}'s range`,
    )
  }
  if (!metadata.alt_text || !metadata.narration_key || !metadata.source_image) {
    throw new Error(`Incomplete puzzle metadata in ${metadataPath}`)
  }
  if (
    metadata.active_months &&
    (metadata.category_id !== 'holidays' ||
      metadata.active_months.length === 0 ||
      metadata.active_months.some((month) => !Number.isInteger(month) || month < 1 || month > 12))
  ) {
    throw new Error(`Invalid seasonal calendar in ${metadataPath}`)
  }
}

const catalog = Object.entries(metadataModules)
  .map(([metadataPath, metadata]): PuzzleCatalogEntry => {
    validateMetadata(metadata, metadataPath)
    const directory = metadataPath.slice(0, metadataPath.lastIndexOf('/'))
    const sourcePath = `${directory}/${metadata.source_image}`
    const sourceUrl = imageModules[sourcePath]
    if (!sourceUrl) {
      throw new Error(`Missing source image for ${metadata.puzzle_id}`)
    }
    return { ...metadata, sourceUrl }
  })
  .sort((first, second) => {
    const categoryDifference = CATEGORY_IDS.indexOf(first.category_id) -
      CATEGORY_IDS.indexOf(second.category_id)
    if (categoryDifference !== 0) return categoryDifference
    const tierDifference = TIER_IDS.indexOf(first.tier_id) -
      TIER_IDS.indexOf(second.tier_id)
    if (tierDifference !== 0) return tierDifference
    const firstSequence = Number(first.puzzle_id.match(/_(\d+)$/)?.[1] ?? 0)
    const secondSequence = Number(second.puzzle_id.match(/_(\d+)$/)?.[1] ?? 0)
    return firstSequence - secondSequence || first.puzzle_id.localeCompare(second.puzzle_id)
  })

const puzzleIds = new Set<string>()
for (const puzzle of catalog) {
  if (puzzleIds.has(puzzle.puzzle_id)) {
    throw new Error(`Duplicate puzzle_id: ${puzzle.puzzle_id}`)
  }
  puzzleIds.add(puzzle.puzzle_id)
}

export const PUZZLE_CATALOG: readonly PuzzleCatalogEntry[] = catalog

export function getPuzzleById(
  puzzleId: string,
): PuzzleCatalogEntry | undefined {
  return PUZZLE_CATALOG.find((puzzle) => puzzle.puzzle_id === puzzleId)
}

export function isPuzzleAvailableOn(
  puzzle: PuzzleCatalogEntry,
  date = new Date(),
): boolean {
  return !puzzle.active_months || puzzle.active_months.includes(date.getMonth() + 1)
}

export function getPuzzlesForTier(
  tierId: TierId,
  date = new Date(),
): PuzzleCatalogEntry[] {
  return PUZZLE_CATALOG.filter(
    (puzzle) => puzzle.tier_id === tierId && isPuzzleAvailableOn(puzzle, date),
  )
}

export function getPuzzlesForCategory(
  categoryId: CategoryId,
  tierId: TierId,
  date = new Date(),
): PuzzleCatalogEntry[] {
  return PUZZLE_CATALOG.filter(
    (puzzle) =>
      puzzle.category_id === categoryId &&
      puzzle.tier_id === tierId &&
      isPuzzleAvailableOn(puzzle, date),
  )
}

export function getActiveCategories(tierId: TierId, date = new Date()) {
  const categoryIds = new Set(
    getPuzzlesForTier(tierId, date).map((puzzle) => puzzle.category_id),
  )
  return CATEGORY_IDS
    .filter((categoryId) => categoryIds.has(categoryId))
    .map(getCategoryDefinition)
}
