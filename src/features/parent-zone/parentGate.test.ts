import { describe, expect, it } from 'vitest'
import {
  isParentGateAnswerCorrect,
  shouldRevokeParentAccess,
} from './parentGate'

describe('parent gate', () => {
  it('rejects empty, partial, and random-tap answers', () => {
    expect(isParentGateAnswerCorrect('')).toBe(false)
    expect(isParentGateAnswerCorrect('1')).toBe(false)
    expect(isParentGateAnswerCorrect('111')).toBe(false)
  })

  it('accepts only the documented math answer', () => {
    expect(isParentGateAnswerCorrect('11')).toBe(true)
    expect(isParentGateAnswerCorrect(' 11 ')).toBe(true)
  })

  it('revokes access only after more than 60 seconds in the background', () => {
    expect(shouldRevokeParentAccess(null, 100_000)).toBe(false)
    expect(shouldRevokeParentAccess(10_000, 70_000)).toBe(false)
    expect(shouldRevokeParentAccess(10_000, 70_001)).toBe(true)
  })
})
