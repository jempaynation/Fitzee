export const CATEGORY_IDS = [
  'animals',
  'shapes_colors',
  'vehicles',
  'nature_seasons',
  'numbers_letters',
  'fairy_tales',
  'everyday_life',
  'holidays',
] as const

export type CategoryId = (typeof CATEGORY_IDS)[number]

export interface CategoryDefinition {
  id: CategoryId
  name: string
  icon: string
}

export const CATEGORY_DEFINITIONS: readonly CategoryDefinition[] = [
  { id: 'animals', name: 'Animals', icon: '🐾' },
  { id: 'shapes_colors', name: 'Shapes & Colors', icon: '🔷' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'nature_seasons', name: 'Nature & Seasons', icon: '🌿' },
  { id: 'numbers_letters', name: 'Numbers & Letters', icon: '🔤' },
  { id: 'fairy_tales', name: 'Fairy Tales & Fantasy', icon: '🏰' },
  { id: 'everyday_life', name: 'Everyday Life', icon: '🏡' },
  { id: 'holidays', name: 'Holidays & Seasonal', icon: '🎉' },
]

export function isCategoryId(value: unknown): value is CategoryId {
  return (
    typeof value === 'string' &&
    CATEGORY_IDS.includes(value as CategoryId)
  )
}

export function getCategoryDefinition(
  categoryId: CategoryId,
): CategoryDefinition {
  return CATEGORY_DEFINITIONS.find(({ id }) => id === categoryId)!
}
