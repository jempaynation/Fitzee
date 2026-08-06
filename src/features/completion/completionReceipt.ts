import type { Reward } from '../../data/models'

export interface CompletionReceipt {
  puzzleId: string
  completionNumber: number
  unlockedRewards: Reward[]
  persistenceAvailable: boolean
  createdAt: number
}

const receipts = new Map<string, CompletionReceipt>()
const RECEIPT_LIFETIME_MS = 10 * 60_000

export function recordCompletionReceipt(
  receipt: Omit<CompletionReceipt, 'createdAt'>,
): void {
  receipts.set(receipt.puzzleId, { ...receipt, createdAt: Date.now() })
}

export function readCompletionReceipt(
  puzzleId: string,
): CompletionReceipt | null {
  const receipt = receipts.get(puzzleId)
  if (!receipt) return null
  if (Date.now() - receipt.createdAt > RECEIPT_LIFETIME_MS) {
    receipts.delete(puzzleId)
    return null
  }
  return receipt
}

export function clearCompletionReceipts(): void {
  receipts.clear()
}
