export const PARENT_GATE_QUESTION = '7 + 4'
export const PARENT_GATE_ANSWER = '11'

export function isParentGateAnswerCorrect(answer: string): boolean {
  return answer.trim() === PARENT_GATE_ANSWER
}

export function shouldRevokeParentAccess(
  hiddenAt: number | null,
  resumedAt: number,
): boolean {
  return hiddenAt !== null && resumedAt - hiddenAt > 60_000
}
