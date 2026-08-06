import { useEffect, useRef, type ReactNode } from 'react'
import { HashLink } from '../../core/navigation/hashNavigation'
import { useHashNavigation } from '../../core/navigation/useHashNavigation'

export function ParentLayout({ children }: { children: ReactNode }) {
  const { path } = useHashNavigation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true })
  }, [path])

  return (
    <div className="parent-frame" lang="en">
      <header className="parent-header">
        <div>
          <strong>Fitzee Parent Zone</strong>
          <span>Adult controls</span>
        </div>
        <HashLink className="secondary-button" to="/home">Exit Parent Zone</HashLink>
      </header>
      <main className="parent-content" ref={mainRef} tabIndex={-1}>{children}</main>
    </div>
  )
}
