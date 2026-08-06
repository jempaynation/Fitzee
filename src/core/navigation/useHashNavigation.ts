import { useContext } from 'react'
import {
  HashNavigationContext,
  type HashNavigationValue,
} from './hashNavigationContext'

export function useHashNavigation(): HashNavigationValue {
  const value = useContext(HashNavigationContext)
  if (!value) {
    throw new Error('useHashNavigation must be used inside HashNavigationProvider')
  }
  return value
}
