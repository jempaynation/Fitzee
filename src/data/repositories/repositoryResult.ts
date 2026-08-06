export interface RepositoryReadResult<T> {
  value: T | null
  persistenceAvailable: boolean
}
