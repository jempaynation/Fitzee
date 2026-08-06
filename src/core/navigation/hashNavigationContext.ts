import { createContext } from 'react'

export interface NavigateOptions {
  replace?: boolean
}

export interface HashNavigationValue {
  path: string
  navigate: (to: string, options?: NavigateOptions) => void
  goBack: () => void
}

export const HashNavigationContext = createContext<HashNavigationValue | null>(null)
