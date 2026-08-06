export const TIER_IDS = [
  'tiny_tots',
  'little_explorers',
  'big_kids',
  'puzzle_masters',
] as const

export type TierId = (typeof TIER_IDS)[number]

export interface TierDefinition {
  id: TierId
  name: string
  ages: string
  pieces: string
  icon: string
  minimumPieces: number
  maximumPieces: number
}

export const TIER_DEFINITIONS: readonly TierDefinition[] = [
  {
    id: 'tiny_tots',
    name: 'Tiny Tots',
    ages: 'Ages 2–4',
    pieces: '2–6 pieces',
    icon: '🧸',
    minimumPieces: 2,
    maximumPieces: 6,
  },
  {
    id: 'little_explorers',
    name: 'Little Explorers',
    ages: 'Ages 4–6',
    pieces: '6–15 pieces',
    icon: '🔎',
    minimumPieces: 6,
    maximumPieces: 15,
  },
  {
    id: 'big_kids',
    name: 'Big Kids',
    ages: 'Ages 6–8',
    pieces: '15–40 pieces',
    icon: '🚀',
    minimumPieces: 15,
    maximumPieces: 40,
  },
  {
    id: 'puzzle_masters',
    name: 'Puzzle Masters',
    ages: 'Ages 8–10',
    pieces: '40–100+ pieces',
    icon: '🧩',
    minimumPieces: 40,
    maximumPieces: 120,
  },
]

export function isTierId(value: unknown): value is TierId {
  return typeof value === 'string' && TIER_IDS.includes(value as TierId)
}

export function getTierDefinition(tierId: TierId): TierDefinition {
  return TIER_DEFINITIONS.find(({ id }) => id === tierId)!
}
